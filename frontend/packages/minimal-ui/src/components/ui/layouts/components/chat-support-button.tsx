'use client';

import { memo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import CircularProgress from '@mui/material/CircularProgress';

import { useTranslate } from '@/ui/locales';
import { Iconify } from '@/components/ui/iconify';

// ----------------------------------------------------------------------

// Extend window type for chatbot widget
declare global {
  interface Window {
    ChatbotWidget?: {
      init: (config: ChatbotConfig) => void;
      toggle: () => void;
    };
  }
}

interface ChatbotConfig {
  title: string;
  subtitle: string;
  welcomeMessage: string;
  placeholder: string;
  position: 'left' | 'right';
  accentColor: string;
  rtl: boolean;
  quickReplies: Array<{ text: string; icon: string }>;
  hideButton: boolean;
  showHumanOperatorButton: boolean;
  humanOperatorThreshold: number;
  humanOperatorButtonText: string;
}

// ----------------------------------------------------------------------

export const ChatSupportButton = memo(() => {
  const { t, currentLang } = useTranslate('chat');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [chatbotWidget, setChatbotWidget] = useState<Window['ChatbotWidget'] | null>(null);

  const loadChatbot = useCallback(() => {
    const appVersion = process.env.NEXT_PUBLIC_BUILD_TIME || Date.now().toString();
    const script = document.createElement('script');
    script.src = `https://chat.voody.app/voody-chatbot.min.js?v=${appVersion}`;

    script.onload = () => {
      if (window.ChatbotWidget) {
        setChatbotWidget(window.ChatbotWidget);
        setHasError(false);
      } else {
        console.warn('ChatbotWidget not available on window object');
        setHasError(true);
        setIsLoading(false);
      }
    };

    script.onerror = (error) => {
      console.error('Failed to load chatbot widget script:', error);
      setHasError(true);
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    loadChatbot();
  }, [loadChatbot]);

  useEffect(() => {
    if (chatbotWidget) {
      try {
        const isFarsi = currentLang.value === 'fa';

        window.ChatbotWidget?.init({
          title: t('support.title'),
          subtitle: t('support.subtitle'),
          welcomeMessage: t('support.welcomeMessage'),
          placeholder: t('support.placeholder'),
          position: isFarsi ? 'left' : 'right',
          accentColor: '#8E33FF',
          rtl: isFarsi,
          quickReplies: [
            { text: t('support.quickReplies.newOrder'), icon: '🛒' },
            { text: t('support.quickReplies.trackOrder'), icon: '📋' },
            { text: t('support.quickReplies.faqs'), icon: '❓' },
            { text: t('support.quickReplies.aboutUs'), icon: 'ℹ' },
            { text: t('support.quickReplies.contactUs'), icon: '📞' },
            { text: t('support.quickReplies.humanOperator'), icon: '👨‍💼' },
          ],
          hideButton: true,
          showHumanOperatorButton: true,
          humanOperatorThreshold: 5,
          humanOperatorButtonText: t('support.humanOperatorButton'),
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize chatbot:', error);
        setHasError(true);
        setIsLoading(false);
      }
    }
  }, [chatbotWidget, currentLang, t]);

  const handleToggleChat = useCallback(() => {
    if (chatbotWidget && !isLoading && !hasError) {
      try {
        window.ChatbotWidget?.toggle();
      } catch (error) {
        console.error('Failed to toggle chatbot:', error);
        setHasError(true);
      }
    }
  }, [chatbotWidget, isLoading, hasError]);

  // Don't render if there's an error loading the chatbot
  if (hasError) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: { xs: 16, md: 24 },
        // RTL (Persian): right side, LTR (English): left side
        // right: { xs: 16, md: 24 },
        right: { xs: 16, md: 24 },
        // left: isFarsi ? undefined : { xs: 16, md: 24 },
        zIndex: 1050,
      }}
    >
      <Fab
        color="primary"
        aria-label="support chat"
        onClick={handleToggleChat}
        disabled={isLoading}
        sx={{
          width: 56,
          height: 56,
          boxShadow: '0 4px 20px rgba(142, 51, 255, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 24px rgba(142, 51, 255, 0.4)',
            transform: 'scale(1.05)',
          },
          transition: 'all 0.3s ease-in-out',
        }}
      >
        {isLoading ? (
          <CircularProgress size={24} sx={{ color: 'white' }} />
        ) : (
          <Iconify icon="solar:chat-round-dots-bold" width={28} />
        )}
      </Fab>
    </Box>
  );
});

ChatSupportButton.displayName = 'ChatSupportButton';

