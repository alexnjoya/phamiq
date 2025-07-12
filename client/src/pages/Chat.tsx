// components/Chat.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot,
  History,
  Settings,
  Plus,
  Search,
  Send,
  User,
  Loader2,
  AlertCircle,
  Info,
  Leaf,
  Sparkles,
  Copy,
  Check,
  Clock,
  Trash2,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Microscope,
  Target,
  Calendar,
  FileText
} from "lucide-react";
import { chatService, type Message, type ChatHistory, type ChatContext } from "./chatservice";
import SidebarLayout from '../components/SidebarLayout';
import { useAuth } from '../hooks/useAuth';

// Types
interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  active?: boolean;
}

interface ChatState {
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
}

const Chat: React.FC = () => {
  // State
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "bot",
      content: "Hello! I'm phamiq AI.",
      timestamp: new Date()
    }
  ]);
  const [chatState, setChatState] = useState<ChatState>({
    isLoading: false,
    error: null,
    isConnected: true
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const [chatContext, setChatContext] = useState<ChatContext | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showContextDetails, setShowContextDetails] = useState(true);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Navigation
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Sidebar configuration
  const sidebarItems: SidebarItem[] = [
    { icon: Plus, label: 'Analysis', href: '/upload' },
    { icon: History, label: 'History', href: '/history' },
    { icon: Bot, label: 'Chat', href: '/chat', active: true },
    { icon: Search, label: 'Discovery', href: '/discovery' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  // Load chat context from localStorage on mount
  useEffect(() => {
    const contextData = localStorage.getItem('chatContext');
    if (contextData) {
      try {
        const context: ChatContext = JSON.parse(contextData);
        setChatContext(context);
        
        // Auto-generate initial message based on context
        const initialMessage = generateInitialMessage(context);
        setMessages([
          {
            id: 1,
            type: "bot",
            content: initialMessage,
            timestamp: new Date()
          }
        ]);
        
        // Clear the context from localStorage
        localStorage.removeItem('chatContext');
      } catch (error) {
        console.error('Error parsing chat context:', error);
      }
    }
  }, []);

  // Load chat history on mount
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadChatHistory();
    }
  }, [isAuthenticated, authLoading]);

  // Test chat connection on mount
  useEffect(() => {
    const testConnection = async () => {
      // Only test connection if user is authenticated
      if (!isAuthenticated || authLoading) {
        return;
      }
      
      try {
        // First test if API is reachable
        const isBackendReachable = await chatService.testBackendConnection();
        if (!isBackendReachable) {
          setChatState(prev => ({ 
            ...prev, 
            isConnected: false,
            error: 'Backend server is not reachable. Please ensure you have an internet connection.'
          }));
          return;
        }
        
        const isAvailable = await chatService.isAvailable();
        setChatState(prev => ({ 
          ...prev, 
          isConnected: isAvailable,
          error: isAvailable ? null : 'Chat service is not available. Please check your connection.'
        }));
      } catch (error) {
        console.error('Connection test failed:', error);
        setChatState(prev => ({ 
          ...prev, 
          isConnected: false,
          error: 'Failed to connect to chat service.'
        }));
      }
    };

    testConnection();
  }, [isAuthenticated, authLoading]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Clear error after 5 seconds
  useEffect(() => {
    if (chatState.error) {
      const timer = setTimeout(() => {
        setChatState(prev => ({ ...prev, error: null }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [chatState.error]);

  // Generate initial message based on disease context
  const generateInitialMessage = (context: ChatContext): string => {
    const severityIcon = getSeverityIcon(context.severity);
    const confidenceLevel = getConfidenceLevel(context.confidence);
    
    return `I've analyzed your **${context.disease}** detection in **${context.cropType}** crops. Here's what I found:

**Analysis Results:**
${severityIcon} **Severity Level:** ${context.severity}
${confidenceLevel.icon} **Detection Confidence:** ${(context.confidence * 100).toFixed(0)}% (${confidenceLevel.text})

**I can help you with:**
• **Treatment options** specifically for ${context.disease} in ${context.cropType}
• **Prevention strategies** to avoid future outbreaks
• **Management practices** for ${context.severity} severity cases
• **Chemical and biological control** methods
• **Cultural practices** to reduce disease spread
• **Monitoring and early detection** techniques

What specific aspect of ${context.disease} management would you like to discuss? I can provide detailed treatment plans, prevention strategies, or answer any questions about managing this disease in your ${context.cropType} crops.`;
  };

  // Get severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'severe':
        return '🔴';
      case 'moderate':
        return '🟡';
      case 'mild':
        return '🟢';
      default:
        return '⚪';
    }
  };

  // Get confidence level
  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.9) return { icon: '🎯', text: 'Very High' };
    if (confidence >= 0.8) return { icon: '✅', text: 'High' };
    if (confidence >= 0.7) return { icon: '⚠️', text: 'Good' };
    if (confidence >= 0.6) return { icon: '❓', text: 'Moderate' };
    return { icon: '❌', text: 'Low' };
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'severe':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'moderate':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'mild':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Load chat history
  const loadChatHistory = async () => {
    try {
      const history = await chatService.getChatHistory(20);
      setChatHistory(history);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  // Load specific chat
  const loadChat = async (chatId: string) => {
    try {
      const chat = await chatService.getChatById(chatId);
      setMessages(chat.messages.map((msg, index) => ({
        id: index + 1,
        type: msg.role === 'user' ? 'user' : 'bot',
        content: msg.content,
        timestamp: new Date(msg.timestamp || Date.now())
      })));
      setCurrentChatId(chatId);
      setShowHistory(false);
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  // Delete chat
  const deleteChat = async (chatId: string) => {
    try {
      await chatService.deleteChat(chatId);
      await loadChatHistory();
      if (currentChatId === chatId) {
        handleClearChat();
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  // Retry connection function
  const retryConnection = async () => {
    setChatState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const isAvailable = await chatService.isAvailable();
      setChatState(prev => ({ 
        ...prev, 
        isConnected: isAvailable,
        error: isAvailable ? null : 'Chat service is not available. Please check your connection.',
        isLoading: false
      }));
    } catch (error) {
      console.error('Retry connection failed:', error);
      setChatState(prev => ({ 
        ...prev, 
        isConnected: false,
        error: 'Failed to connect to chat service.',
        isLoading: false
      }));
    }
  };

  // Clear chat function
  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now(),
        type: "bot",
        content: "Hello! I'm your agricultural AI assistant. I can help you with crop management, disease identification, farming techniques, and more. How can I assist you today?",
        timestamp: new Date()
      }
    ]);
    setChatContext(null);
    setCurrentChatId(null);
  };

  // Copy message function
  const handleCopyMessage = async (content: string, messageId: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  // Handle sending message
  const handleSendMessage = useCallback(async (): Promise<void> => {
    if (!message.trim() || chatState.isLoading) return;
    
    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: message.trim(),
      timestamp: new Date()
    };
    
    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setChatState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Get AI response
      const response = await chatService.getAIResponse(userMessage.content);
      
      // Add bot response
      const botMessage: Message = {
        id: Date.now() + 1,
        type: "bot",
        content: response.message,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setChatState(prev => ({ ...prev, isConnected: true }));
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorMessage = 'An unexpected error occurred';
      
      if (error instanceof Error) {
        if (error.message.includes('Authentication')) {
          errorMessage = 'Please log in again to continue chatting.';
          // Redirect to login after a delay
          setTimeout(() => {
            localStorage.clear();
            navigate('/login');
          }, 2000);
        } else if (error.message.includes('unavailable')) {
          errorMessage = 'AI service is currently unavailable. Please try again later.';
        } else if (error.message.includes('Failed to get AI response')) {
          errorMessage = 'Unable to get AI response. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setChatState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isConnected: false 
      }));
      
      // Add error message to chat
      const errorBotMessage: Message = {
        id: Date.now() + 1,
        type: "bot",
        content: `I'm sorry, I encountered an error: ${errorMessage}`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorBotMessage]);
    } finally {
      setChatState(prev => ({ ...prev, isLoading: false }));
    }
  }, [message, chatState.isLoading, navigate]);

  // Handle keyboard events
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Handle navigation
  const handleNavigation = useCallback((href: string): void => {
    navigate(href);
  }, [navigate]);

  // Handle textarea change
  const handleMessageChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setMessage(e.target.value);
  }, []);

  // Clear error manually
  const clearError = useCallback((): void => {
    setChatState(prev => ({ ...prev, error: null }));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Function to format message content with better styling
  const formatMessageContent = (content: string) => {
    // Split content into paragraphs
    const paragraphs = content.split('\n\n');
    
    return (
      <div className="space-y-4">
        {paragraphs.map((paragraph, index) => {
          // Check if this is a heading (starts with ** and ends with **)
          if (paragraph.match(/^\*\*.*\*\*$/)) {
            const heading = paragraph.replace(/\*\*(.*?)\*\*/g, '$1');
            return (
              <div key={index} className="space-y-2">
                <h3 className="text-lg font-bold text-gray-900 leading-relaxed">
                  {heading}
                </h3>
              </div>
            );
          }
          
          // Check if paragraph contains numbered list
          if (paragraph.match(/^\d+\.\s/)) {
            const lines = paragraph.split('\n');
            const title = lines[0];
            const listItems = lines.slice(1).filter(line => line.trim());
            
            return (
              <div key={index} className="space-y-3">
                <h3 className="font-bold text-gray-900 text-base">
                  {title.replace(/\*\*(.*?)\*\*/g, '$1')}
                </h3>
                <ul className="list-decimal list-inside space-y-2 ml-4">
                  {listItems.map((item, itemIndex) => {
                    const cleanItem = item.replace(/\*\*(.*?)\*\*/g, '$1');
                    const colonIndex = cleanItem.indexOf(':');
                    
                    if (colonIndex !== -1) {
                      const label = cleanItem.substring(0, colonIndex + 1);
                      const description = cleanItem.substring(colonIndex + 1);
                      
                      return (
                        <li key={itemIndex} className="text-gray-700 text-sm leading-relaxed">
                          <span className="font-semibold text-gray-900">{label}</span>
                          {description}
                        </li>
                      );
                    } else {
                      return (
                        <li key={itemIndex} className="text-gray-700 text-sm leading-relaxed">
                          {cleanItem}
                        </li>
                      );
                    }
                  })}
                </ul>
              </div>
            );
          }
          
          // Check if paragraph contains bullet points with headings
          if (paragraph.includes('**') && paragraph.includes(':')) {
            const [title, ...points] = paragraph.split('\n');
            const cleanTitle = title.replace(/\*\*(.*?)\*\*/g, '$1');
            
            return (
              <div key={index} className="space-y-2">
                <div className="font-bold text-gray-900 text-base">
                  {cleanTitle}
                </div>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  {points.map((point, pointIndex) => {
                    const pointText = point.trim().replace(/\*\*(.*?)\*\*/g, '$1');
                    const colonIndex = pointText.indexOf(':');
                    
                    if (colonIndex !== -1) {
                      const label = pointText.substring(0, colonIndex + 1);
                      const description = pointText.substring(colonIndex + 1);
                      
                      return (
                        <li key={pointIndex} className="text-gray-700 text-sm leading-relaxed">
                          <span className="font-semibold text-gray-900">{label}</span>
                          {description}
                        </li>
                      );
                    } else {
                      return (
                        <li key={pointIndex} className="text-gray-700 text-sm leading-relaxed">
                          {pointText}
                        </li>
                      );
                    }
                  })}
                </ul>
              </div>
            );
          }
          
          // Check if paragraph contains bullet points (starts with • or -)
          if (paragraph.match(/^[•\-]\s/)) {
            const lines = paragraph.split('\n');
            const listItems = lines.filter(line => line.trim());
            
            return (
              <div key={index} className="space-y-2">
                <ul className="list-disc list-inside space-y-1 ml-4">
                  {listItems.map((item, itemIndex) => {
                    const cleanItem = item.replace(/^[•\-]\s/, '').replace(/\*\*(.*?)\*\*/g, '$1');
                    const colonIndex = cleanItem.indexOf(':');
                    
                    if (colonIndex !== -1) {
                      const label = cleanItem.substring(0, colonIndex + 1);
                      const description = cleanItem.substring(colonIndex + 1);
                      
                      return (
                        <li key={itemIndex} className="text-gray-700 text-sm leading-relaxed">
                          <span className="font-semibold text-gray-900">{label}</span>
                          {description}
                        </li>
                      );
                    } else {
                      return (
                        <li key={itemIndex} className="text-gray-700 text-sm leading-relaxed">
                          {cleanItem}
                        </li>
                      );
                    }
                  })}
                </ul>
              </div>
            );
          }
          
          // Check if paragraph contains inline bold text
          if (paragraph.includes('**')) {
            const parts = paragraph.split(/\*\*(.*?)\*\*/);
            return (
              <p key={index} className="text-gray-700 text-sm leading-relaxed">
                {parts.map((part, partIndex) => {
                  if (partIndex % 2 === 1) {
                    // This is bold text
                    return (
                      <span key={partIndex} className="font-semibold text-gray-900">
                        {part}
                      </span>
                    );
                  } else {
                    // This is regular text
                    return part;
                  }
                })}
              </p>
            );
          }
          
          // Regular paragraph
          return (
            <p key={index} className="text-gray-700 text-sm leading-relaxed">
              {paragraph}
            </p>
          );
        })}
      </div>
    );
  };

  // Show loading state while authentication is being checked
  if (authLoading) {
    return (
      <SidebarLayout>
        <div className="flex-1 flex flex-col h-screen md:ml-24 relative">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Checking authentication...</p>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  // Show authentication required message if not authenticated
  if (!isAuthenticated) {
    return (
      <SidebarLayout>
        <div className="flex-1 flex flex-col h-screen md:ml-24 relative">
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <Bot className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
              <p className="text-gray-600 mb-6">Please log in to access the AI chat assistant.</p>
              <Button onClick={() => navigate('/login')} className="bg-teal-600 hover:bg-teal-700">
                Go to Login
              </Button>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen md:ml-24 relative">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">AI Assistant</h1>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${chatState.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-500">
                    {chatState.isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                title="Chat history"
              >
                <History className="w-5 h-5" />
              </button>
              <button
                onClick={handleClearChat}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                title="Clear chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Chat History Sidebar */}
        {showHistory && (
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Chat History</h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-hide">
                {chatHistory.length === 0 ? (
                  <p className="text-sm text-gray-500">No chat history yet</p>
                ) : (
                  chatHistory.map((chat) => (
                    <div
                      key={chat.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        currentChatId === chat.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div
                        className="flex-1 min-w-0"
                        onClick={() => loadChat(chat.id)}
                      >
                        <h4 className="font-medium text-gray-900 truncate">
                          {chat.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <Clock className="w-3 h-3" />
                          {new Date(chat.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteChat(chat.id)}
                        className="text-red-400 hover:text-red-600 p-1"
                        title="Delete chat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Disease Context Banner */}
        {chatContext && showContextDetails && (
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Microscope className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Disease Analysis Context</h3>
                </div>
                <button
                  onClick={() => setShowContextDetails(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  title="Hide details"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Disease Info */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-blue-600" />
                      <h4 className="font-medium text-blue-900 text-sm">Disease</h4>
                    </div>
                    <p className="text-blue-800 font-semibold">{chatContext.disease}</p>
                  </CardContent>
                </Card>

                {/* Crop Type */}
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Leaf className="w-4 h-4 text-green-600" />
                      <h4 className="font-medium text-green-900 text-sm">Crop Type</h4>
                    </div>
                    <p className="text-green-800 font-semibold">{chatContext.cropType}</p>
                  </CardContent>
                </Card>

                {/* Severity */}
                <Card className={`border ${getSeverityColor(chatContext.severity)}`}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4" />
                      <h4 className="font-medium text-sm">Severity</h4>
                    </div>
                    <p className="font-semibold">{chatContext.severity}</p>
                  </CardContent>
                </Card>

                {/* Confidence */}
                <Card className="bg-gray-50 border-gray-200">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-gray-600" />
                      <h4 className="font-medium text-gray-900 text-sm">Confidence</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${getConfidenceColor(chatContext.confidence)}`}>
                        {(chatContext.confidence * 100).toFixed(0)}%
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {getConfidenceLevel(chatContext.confidence).text}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Details */}
              {(chatContext.filename || chatContext.created_at) && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                    {chatContext.filename && (
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>File: {chatContext.filename}</span>
                      </div>
                    )}
                    {chatContext.created_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Analyzed: {new Date(chatContext.created_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {chatState.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mx-4 my-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-red-700">{chatState.error}</p>
                {!chatState.isConnected && (
                  <button
                    onClick={retryConnection}
                    disabled={chatState.isLoading}
                    className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {chatState.isLoading ? 'Retrying...' : 'Retry Connection'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Connection Loading */}
        {chatState.isLoading && !chatState.isConnected && !chatState.error && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mx-4 my-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="animate-spin w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-blue-700">Testing connection to chat service...</p>
              </div>
            </div>
          </div>
        )}

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] ${msg.type === "user" ? "order-2" : "order-1"}`}>
                    <div className={`flex items-start gap-3 ${msg.type === "user" ? "flex-row-reverse" : ""}`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.type === "user" 
                          ? "bg-blue-600" 
                          : "bg-gray-100"
                      }`}>
                        {msg.type === "user" ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                      
                      {/* Message Content */}
                      <div className={`flex-1 ${msg.type === "user" ? "text-right" : ""}`}>
                        <div className={`relative group ${
                          msg.type === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-white border border-gray-200 text-gray-900"
                        } rounded-2xl px-4 py-3`}>
                          
                          {/* Copy button for bot messages */}
                          {msg.type === "bot" && (
                            <button
                              onClick={() => handleCopyMessage(msg.content, msg.id)}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                              title="Copy message"
                            >
                              {copiedMessageId === msg.id ? (
                                <Check className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                          
                          <div className="pr-8">
                            {msg.type === "user" ? (
                              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                {msg.content}
                              </div>
                            ) : (
                              formatMessageContent(msg.content)
                            )}
                          </div>
                        </div>
                        <div className={`text-xs text-gray-500 mt-1 ${msg.type === "user" ? "text-right" : ""}`}>
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Loading indicator */}
              {chatState.isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%]">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
                          <span className="text-sm text-gray-600">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Input Container */}
        <div className="bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleMessageChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask about crop diseases, treatment methods, or farming techniques..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white "
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || chatState.isLoading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Chat;