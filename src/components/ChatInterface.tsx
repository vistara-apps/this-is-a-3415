import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { ChatMessage } from '../types';
import { AIService } from '../services/aiService';
import ProviderCard from './ProviderCard';
import AidProgramCard from './AidProgramCard';
import ResourceCard from './ResourceCard';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi! I'm HealthNavi, your AI assistant for finding affordable healthcare and assistance programs. I can help you find doctors who accept Medicaid, locate aid programs you might qualify for, or find community resources in your area. What can I help you with today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const { response, searchResults } = await AIService.processQuery(inputValue);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response,
        timestamp: new Date(),
        searchResults
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderSearchResults = (message: ChatMessage) => {
    if (!message.searchResults) return null;

    return (
      <div className="mt-4 space-y-4">
        {message.searchResults.providers && message.searchResults.providers.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-textSecondary mb-2">Healthcare Providers</h4>
            <div className="space-y-2">
              {message.searchResults.providers.map(provider => (
                <ProviderCard key={provider.providerId} provider={provider} />
              ))}
            </div>
          </div>
        )}

        {message.searchResults.aidPrograms && message.searchResults.aidPrograms.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-textSecondary mb-2">Aid Programs</h4>
            <div className="space-y-2">
              {message.searchResults.aidPrograms.map(program => (
                <AidProgramCard key={program.programId} program={program} />
              ))}
            </div>
          </div>
        )}

        {message.searchResults.resources && message.searchResults.resources.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-textSecondary mb-2">Community Resources</h4>
            <div className="space-y-2">
              {message.searchResults.resources.map(resource => (
                <ResourceCard key={resource.resourceId} resource={resource} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-purple-600 p-4">
        <div className="flex items-center space-x-3">
          <MessageCircle className="w-6 h-6 text-white" />
          <h2 className="text-white text-lg font-semibold">AI Healthcare Assistant</h2>
        </div>
      </div>

      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${
              message.type === 'user' 
                ? 'bg-primary text-white' 
                : 'bg-surface text-textPrimary'
            } rounded-lg p-3 animate-slide-up`}>
              <p className="text-sm leading-relaxed">{message.content}</p>
              {renderSearchResults(message)}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-surface text-textPrimary rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-textSecondary rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-textSecondary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-textSecondary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about healthcare providers, aid programs, or community resources..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;