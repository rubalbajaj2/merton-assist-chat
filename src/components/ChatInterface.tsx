import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle, Paperclip, X, ImageIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { N8nWebhookService, N8nChatMessage } from "@/services/n8n-webhook-service";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
}

interface ImageUpload {
  file: File;
  filename: string;
  fileType: string;
  fileSize: number;
}

interface ChatInterfaceProps {
  selectedQuestion?: string;
  onQuestionProcessed?: () => void;
}

const ChatInterface = ({ selectedQuestion, onQuestionProcessed }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm a Merton council agent. I'm here to help, whether that's by providing information or finding the right service for you."
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Initialize n8n chat session
  useEffect(() => {
    const initChat = async () => {
      try {
        await N8nWebhookService.initializeChat();
        console.log('✅ n8n chat session initialized');
      } catch (error) {
        console.error('Failed to initialize chat session:', error);
      }
    };
    initChat();
  }, []);

  useEffect(() => {
    if (selectedQuestion) {
      setInput(selectedQuestion);
      onQuestionProcessed?.();
    }
  }, [selectedQuestion, onQuestionProcessed]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate image file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPG, PNG, GIF, etc.)');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image file size must be less than 10MB');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input || (selectedImage ? `Uploaded image: ${selectedImage.name}` : ''),
      imageUrl: imagePreview || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      let response;
      
      if (selectedImage && input.trim()) {
        // Send message with image
        const imageUpload: ImageUpload = {
          file: selectedImage,
          filename: selectedImage.name,
          fileType: selectedImage.type,
          fileSize: selectedImage.size
        };
        response = await N8nWebhookService.sendMessageWithImage(input, imageUpload);
      } else if (selectedImage) {
        // Send image only
        const imageUpload: ImageUpload = {
          file: selectedImage,
          filename: selectedImage.name,
          fileType: selectedImage.type,
          fileSize: selectedImage.size
        };
        response = await N8nWebhookService.uploadImage(imageUpload);
      } else {
        // Send message only
        response = await N8nWebhookService.sendMessage(input);
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.message
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Clear selected image
      if (selectedImage) {
        URL.revokeObjectURL(imagePreview!);
        setSelectedImage(null);
        setImagePreview(null);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([{
      id: "1",
      role: "assistant",
      content: "Hi! I'm a Merton council agent. I'm here to help, whether that's by providing information or finding the right service for you."
    }]);
    setInput("");
    
    // Clear selected image
    if (selectedImage) {
      URL.revokeObjectURL(imagePreview!);
      setSelectedImage(null);
      setImagePreview(null);
    }
    
    // Reset n8n session
    N8nWebhookService.resetSession().then(() => {
      console.log('🔄 n8n session reset');
    }).catch(error => {
      console.error('Failed to reset session:', error);
    });
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border border-border min-h-[450px]">
      <div className="flex items-center gap-2 p-4 border-b border-border flex-shrink-0">
        <MessageCircle className="w-5 h-5 text-secondary" />
        <h3 className="font-semibold text-2xl">Ask Merti!</h3>
        <Button variant="destructive" size="sm" className="ml-auto" onClick={handleClearChat}>
          Clear Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-muted text-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {message.content}
                {message.imageUrl && (
                  <div className="mt-2">
                    <img 
                      src={message.imageUrl} 
                      alt="Uploaded image" 
                      className="max-w-full h-auto rounded"
                      style={{ maxHeight: '200px' }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-primary text-primary-foreground rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border flex-shrink-0">
        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-3 p-2 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Selected Image:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  URL.revokeObjectURL(imagePreview);
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="mt-2 max-w-full h-auto rounded"
              style={{ maxHeight: '100px' }}
            />
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            disabled={isLoading}
          />
          <input
            type="file"
            id="image-upload"
            onChange={handleImageSelect}
            className="hidden"
            accept="image/*"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => document.getElementById('image-upload')?.click()}
            disabled={isLoading}
          >
            <ImageIcon className="w-5 h-5" />
          </Button>
          <Button 
            size="icon" 
            className="flex-shrink-0 bg-secondary hover:bg-secondary/90"
            onClick={handleSend}
            disabled={isLoading || (!input.trim() && !selectedImage)}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
