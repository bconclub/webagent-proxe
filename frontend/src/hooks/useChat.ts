import { useCallback } from 'react';
import { useChatStream, type Message } from './useChatStream';

interface UseChatOptions {
  brand: string;
  apiUrl?: string;
  onMessageComplete?: (message: Message) => void;
}

export function useChat({ brand, apiUrl, onMessageComplete }: UseChatOptions) {
  const { messages, isLoading, error, sendMessage, clearMessages } = useChatStream({
    brand,
    apiUrl,
    onMessageComplete,
  });

  const handleQuickButton = useCallback(
    (buttonText: string, messageCount: number = 0) => {
      sendMessage(buttonText, messageCount);
    },
    [sendMessage]
  );

  const handleFollowUp = useCallback(
    (followUpText: string, messageCount: number) => {
      sendMessage(followUpText, messageCount);
    },
    [sendMessage]
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    handleQuickButton,
    handleFollowUp,
    clearMessages,
  };
}

