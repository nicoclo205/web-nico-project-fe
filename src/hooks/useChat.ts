// src/hooks/useChat.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { chatService, ChatMessage } from '../services/chatService';

interface UseChatOptions {
  roomId: string;
  token: string;
  enabled?: boolean;
}

export const useChat = ({ roomId, token, enabled = true }: UseChatOptions) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
  }, []);

  useEffect(() => {
    if (!enabled || !roomId || !token) return;

    chatService.connect(roomId, token, {
      onConnect: () => {
        setIsConnected(true);
        setError(null);
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
      onMessage: (message) => {
        setMessages((prev) => [...prev, message]);
        setTimeout(scrollToBottom, 100);
      },
      onHistory: (historyMessages) => {
        setMessages(historyMessages);
        setTimeout(scrollToBottom, 100);
      },
      onError: (errorMsg) => {
        setError(errorMsg);
      },
    });

    return () => {
      chatService.disconnect();
    };
  }, [roomId, token, enabled, scrollToBottom]);

  const sendMessage = useCallback((contenido: string) => {
    if (!contenido.trim()) return;
    chatService.sendMessage(contenido);
  }, []);

  return {
    messages,
    isConnected,
    error,
    sendMessage,
    messagesEndRef,
  };
};
