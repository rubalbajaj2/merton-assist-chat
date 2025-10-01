import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { N8nWebhookService, N8nChatMessage } from "@/services/n8n-webhook-service";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
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

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      console.log('📤 Sending message via n8n service:', userMessage.content);
      const response = await N8nWebhookService.sendMessage(userMessage.content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.message
      };

      setMessages(prev => [...prev, assistantMessage]);
      console.log('📥 Received response:', response.message);

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
        <h3 className="font-semibold text-lg">Ask Merti!</h3>
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
        <div className="flex items-center gap-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            size="icon" 
            className="flex-shrink-0 bg-secondary hover:bg-secondary/90"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
