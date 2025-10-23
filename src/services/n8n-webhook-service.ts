// n8n-webhook-service.ts
export interface N8nChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface N8nResponse {
  message: string;
  metadata?: any;
  sessionId?: string;
}

export interface N8nImageUpload {
  file: File;
  filename: string;
  fileType: string;
  fileSize: number;
}

export class N8nWebhookService {
  private static readonly WEBHOOK_URL = 'https://ask-merti.app.n8n.cloud/webhook/b1c66984-c4cd-426a-a01b-01ac1e44514d/chat';
  private static readonly SCRAPING_WEBHOOK_URL = 'https://ask-merti.app.n8n.cloud/webhook/fc782015-0ef9-433e-9fb2-e16073658b3c/chat';
  private static sessionId: string | null = null;
  private static isInitializing: boolean = false;

  /**
   * Initialize a chat session and get session ID
   */
  static async initializeChat(): Promise<string> {
    // If already initializing, wait for it to complete
    if (this.isInitializing) {
      while (this.isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.sessionId!;
    }

    // If already initialized, return existing session ID
    if (this.sessionId) {
      return this.sessionId;
    }

    this.isInitializing = true;
    
    try {
      console.log('🔄 Initializing n8n chat session...');
      
      const response = await fetch(this.WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'initialize',
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.sessionId) {
          this.sessionId = data.sessionId;
          console.log('✅ Chat session initialized with ID:', this.sessionId);
          return this.sessionId;
        }
      }
      
      // If no session ID returned, generate one locally
      this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('✅ Generated local session ID:', this.sessionId);
      return this.sessionId;
    } catch (error) {
      console.log('⚠️ Chat initialization failed, generating local session ID:', error);
      this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return this.sessionId;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Send a message to the n8n webhook and get a response
   */
  static async sendMessage(userMessage: string): Promise<N8nResponse> {
    try {
      console.log('🤖 Sending message to n8n webhook:', userMessage);
      
      // Ensure we have a session ID
      if (!this.sessionId) {
        await this.initializeChat();
      }
      
      const response = await fetch(this.WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatInput: userMessage, // Changed from 'message' to 'chatInput'
          sessionId: this.sessionId,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get response text first to handle different response formats
      const responseText = await response.text();
      console.log('📝 Raw response from n8n:', responseText);
      
      let data;
      try {
        // Try to parse as single JSON object first
        data = JSON.parse(responseText);
        console.log('✅ Parsed single JSON response:', data);
      } catch (jsonError) {
        console.log('⚠️ Single JSON parsing failed, trying streaming format...');
        
        // Fallback to streaming JSON parsing (multiple JSON objects, one per line)
        const lines = responseText.trim().split('\n');
        console.log('📝 Number of JSON lines:', lines.length);
        
        let fullMessage = '';
        let lastData = null;
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const lineData = JSON.parse(line);
              console.log('📝 Parsed line:', lineData);
              
              // Collect content from "item" type messages
              if (lineData.type === 'item' && lineData.content) {
                fullMessage += lineData.content;
              }
              
              // Keep track of the last parsed data
              lastData = lineData;
            } catch (lineError) {
              console.warn('⚠️ Failed to parse line:', line, lineError);
            }
          }
        }
        
        // Use the full message if we collected content, otherwise use the last data
        data = fullMessage ? { content: fullMessage, type: 'success' } : lastData;
        console.log('✅ Final parsed response from streaming:', data);
      }
      
      // Handle different response formats
      let message = '';
      if (data.type === 'error') {
        message = 'Sorry, I encountered an error processing your request. Please try again.';
      } else if (data.output) {
        // Handle n8n "last node" response format
        message = data.output;
      } else if (data.content) {
        message = data.content;
      } else if (data.message) {
        message = data.message;
      } else if (data.response) {
        message = data.response;
      } else if (data.text) {
        message = data.text;
      } else {
        message = 'No response received from the assistant.';
      }
      
      return {
        message: message,
        sessionId: data.sessionId || this.sessionId,
        metadata: data.metadata || data
      };
    } catch (error) {
      console.error('❌ Error calling n8n webhook:', error);
      throw new Error(`Failed to get response from n8n: ${error}`);
    }
  }

  /**
   * Get current session ID
   */
  static getSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Reset session (start new conversation)
   */
  static async resetSession(): Promise<string> {
    this.sessionId = null;
    this.isInitializing = false;
    return await this.initializeChat();
  }

  /**
   * Send URL to n8n for scraping
   */
  static async scrapeUrl(url: string): Promise<N8nResponse> {
    try {
      console.log('🔄 Sending URL to n8n for scraping:', url);
      
      const response = await fetch(this.SCRAPING_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatInput: url,
          sessionId: this.sessionId,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      console.log('📝 Raw response from n8n scraping:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('✅ Parsed n8n scraping response:', data);
      } catch (jsonError) {
        console.log('⚠️ JSON parsing failed for scraping response:', jsonError);
        data = { message: 'Scraping initiated successfully', success: true };
      }
      
      return {
        message: data.message || 'URL sent for scraping',
        sessionId: data.sessionId || null,
        metadata: data
      };
    } catch (error) {
      console.error('❌ Error calling n8n scraping webhook:', error);
      throw new Error(`Failed to send URL for scraping: ${error}`);
    }
  }

  /**
   * Send an image upload to the n8n webhook
   */
  static async uploadImage(imageUpload: N8nImageUpload, message?: string): Promise<N8nResponse> {
    try {
      console.log('🖼️ Uploading image to n8n webhook:', imageUpload.filename);
      
      // Ensure we have a session ID
      if (!this.sessionId) {
        await this.initializeChat();
      }

      // Create FormData for image upload
      const formData = new FormData();
      formData.append('image', imageUpload.file);
      formData.append('filename', imageUpload.filename);
      formData.append('fileType', imageUpload.fileType);
      formData.append('fileSize', imageUpload.fileSize.toString());
      formData.append('sessionId', this.sessionId);
      formData.append('timestamp', new Date().toISOString());
      
      // Add optional message parameter
      if (message) {
        formData.append('chatInput', message);
      }

      const response = await fetch(this.WEBHOOK_URL, {
        method: 'POST',
        body: formData, // Use FormData instead of JSON
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      console.log('📝 Raw response from n8n image upload:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('✅ Parsed n8n image upload response:', data);
      } catch (jsonError) {
        console.log('⚠️ JSON parsing failed for image upload response:', jsonError);
        
        // Try to parse as streaming JSON format (multiple JSON objects, one per line)
        const lines = responseText.trim().split('\n');
        console.log('📝 Number of JSON lines:', lines.length);
        
        let fullMessage = '';
        let lastData = null;
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const lineData = JSON.parse(line);
              console.log('📝 Parsed line:', lineData);
              
              // Collect content from "item" type messages
              if (lineData.type === 'item' && lineData.content) {
                fullMessage += lineData.content;
              }
              
              // Keep track of the last parsed data
              lastData = lineData;
            } catch (lineError) {
              console.warn('⚠️ Failed to parse line:', line, lineError);
            }
          }
        }
        
        // Use the full message if we collected content, otherwise use the last data
        data = fullMessage ? { content: fullMessage, type: 'success' } : lastData;
        console.log('✅ Final parsed response from streaming:', data);
      }
      
      // Handle different response formats
      let responseMessage = '';
      if (data.type === 'error') {
        responseMessage = 'Sorry, I encountered an error processing your image. Please try again.';
      } else if (data.output) {
        // Handle n8n "last node" response format
        responseMessage = data.output;
      } else if (data.content) {
        responseMessage = data.content;
      } else if (data.message) {
        responseMessage = data.message;
      } else if (data.response) {
        responseMessage = data.response;
      } else if (data.text) {
        responseMessage = data.text;
      } else {
        responseMessage = 'Image uploaded successfully, but no response received from the assistant.';
      }
      
      return {
        message: responseMessage,
        sessionId: data.sessionId || this.sessionId,
        metadata: data
      };
    } catch (error) {
      console.error('❌ Error uploading image to n8n:', error);
      throw new Error(`Failed to upload image to n8n: ${error}`);
    }
  }

  /**
   * Send a message with image attachment to the n8n webhook
   */
  static async sendMessageWithImage(userMessage: string, imageUpload: N8nImageUpload): Promise<N8nResponse> {
    try {
      console.log('📤 Sending message with image to n8n webhook:', userMessage, imageUpload.filename);
      
      // Ensure we have a session ID
      if (!this.sessionId) {
        await this.initializeChat();
      }

      // Create FormData for message with image
      const formData = new FormData();
      formData.append('chatInput', userMessage);
      formData.append('image', imageUpload.file);
      formData.append('filename', imageUpload.filename);
      formData.append('fileType', imageUpload.fileType);
      formData.append('fileSize', imageUpload.fileSize.toString());
      formData.append('sessionId', this.sessionId);
      formData.append('timestamp', new Date().toISOString());

      const response = await fetch(this.WEBHOOK_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      console.log('📝 Raw response from n8n message with image:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('✅ Parsed n8n message with image response:', data);
      } catch (jsonError) {
        console.log('⚠️ JSON parsing failed for message with image response:', jsonError);
        
        // Try to parse as streaming JSON format (multiple JSON objects, one per line)
        const lines = responseText.trim().split('\n');
        console.log('📝 Number of JSON lines:', lines.length);
        
        let fullMessage = '';
        let lastData = null;
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const lineData = JSON.parse(line);
              console.log('📝 Parsed line:', lineData);
              
              // Collect content from "item" type messages
              if (lineData.type === 'item' && lineData.content) {
                fullMessage += lineData.content;
              }
              
              // Keep track of the last parsed data
              lastData = lineData;
            } catch (lineError) {
              console.warn('⚠️ Failed to parse line:', line, lineError);
            }
          }
        }
        
        // Use the full message if we collected content, otherwise use the last data
        data = fullMessage ? { content: fullMessage, type: 'success' } : lastData;
        console.log('✅ Final parsed response from streaming:', data);
      }
      
      // Handle different response formats
      let message = '';
      if (data.type === 'error') {
        message = 'Sorry, I encountered an error processing your message and image. Please try again.';
      } else if (data.output) {
        // Handle n8n "last node" response format
        message = data.output;
      } else if (data.content) {
        message = data.content;
      } else if (data.message) {
        message = data.message;
      } else if (data.response) {
        message = data.response;
      } else if (data.text) {
        message = data.text;
      } else {
        message = 'Message with image sent successfully, but no response received from the assistant.';
      }
      
      return {
        message: message,
        sessionId: data.sessionId || this.sessionId,
        metadata: data
      };
    } catch (error) {
      console.error('❌ Error sending message with image to n8n:', error);
      throw new Error(`Failed to send message with image to n8n: ${error}`);
    }
  }
}
