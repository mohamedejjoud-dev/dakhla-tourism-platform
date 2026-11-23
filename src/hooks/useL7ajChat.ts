import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { askL7aj, ChatMessage } from '@/services/aiService';
import { SupportedLanguage } from '@/types/database';

export function useL7ajChat() {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.resolvedLanguage || i18n.language || 'fr') as SupportedLanguage;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number>(0);

  // Initialize initial greeting if conversation is empty
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-msg',
          role: 'assistant',
          text: t('assistant.greeting'),
          timestamp: new Date(),
        },
      ]);
    }
  }, [t, messages.length]);

  // Rate limit countdown effect
  useEffect(() => {
    if (retryAfter <= 0) {
      setRateLimited(false);
      return;
    }
    const timer = setInterval(() => {
      setRetryAfter((prev) => {
        if (prev <= 1) {
          setRateLimited(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [retryAfter]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading || rateLimited) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      const history = messages
        .filter((m) => m.id !== 'welcome-msg')
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await askL7aj(text, currentLang, history);
      setLoading(false);

      if (res.rateLimited) {
        setRateLimited(true);
        setRetryAfter(res.retryAfter || 60);
      }

      if (res.reply) {
        const assistantMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          text: res.reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    },
    [loading, rateLimited, messages, currentLang]
  );

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        text: t('assistant.greeting'),
        timestamp: new Date(),
      },
    ]);
    setRateLimited(false);
    setRetryAfter(0);
  }, [t]);

  return {
    messages,
    loading,
    rateLimited,
    retryAfter,
    sendMessage,
    clearChat,
  };
}
