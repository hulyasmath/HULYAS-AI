import { v4 } from 'uuid';
import { useCallback } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Constants, replaceSpecialVars } from 'librechat-data-provider';
import { useChatContext, useChatFormContext, useAddedChatContext } from '~/Providers';
import { useAuthContext } from '~/hooks/AuthContext';
import store from '~/store';

// Zeq OS Framework global types
declare global {
  interface Window {
    ZeqOSFramework?: {
      ZeqOSMiddleware: new () => {
        processQuery: (userQuery: string) => {
          mathematicalPrompt: string;
          activeOperators: string[];
          domains: string[];
          [key: string]: any;
        };
      };
      UTPWithOperators: new (start_date_str?: string, pulse_frequency_hz?: number) => {
        calculate_operators: (query_mode: boolean, userQuery: string) => {
          operators: Record<string, any>;
          frameworkState: any;
        };
      };
      version?: string;
      frameworkName?: string;
    };
    zeqMiddleware?: {
      processQuery: (userQuery: string) => {
        mathematicalPrompt: string;
        activeOperators: string[];
        domains: string[];
        [key: string]: any;
      };
    };
    utpFramework?: {
      calculate_operators: (query_mode: boolean, userQuery: string) => {
        operators: Record<string, any>;
        frameworkState: any;
      };
    };
    __zeqFrameworkReady?: boolean;
  }
}

const appendIndex = (index: number, value?: string) => {
  if (!value) {
    return value;
  }
  return `${value}${Constants.COMMON_DIVIDER}${index}`;
};

export default function useSubmitMessage() {
  const { user } = useAuthContext();
  const methods = useChatFormContext();
  const { ask, index, getMessages, setMessages, latestMessage, conversation } = useChatContext();
  const { addedIndex, ask: askAdditional, conversation: addedConvo } = useAddedChatContext();

  const autoSendPrompts = useRecoilValue(store.autoSendPrompts);
  const activeConvos = useRecoilValue(store.allConversationsSelector);
  const setActivePrompt = useSetRecoilState(store.activePromptByIndex(index));

  const submitMessage = useCallback(
    async (data?: { text: string }) => {
      if (!data) {
        return console.warn('No data provided to submitMessage');
      }

      // EXACT PATTERN FROM math.html - Process framework and store in global variable
      // Keep original message in data.text, framework goes in global zeqMathematicalPrompt
      if (data.text && typeof window !== 'undefined' && typeof window.processMathematicalFramework === 'function') {
        try {
          console.log('🔄 Zeq OS [useSubmitMessage]: Processing framework (math.html pattern)', {
            textPreview: data.text.substring(0, 100),
            textLength: data.text.length
          });
          
          // Process framework and store in global variable (EXACT from math.html genFunc pattern)
          const conversationId = conversation?.conversationId || null;
          const frameworkResult = await window.processMathematicalFramework(data.text, conversationId);
          
          console.log('✅ Zeq OS [useSubmitMessage]: Framework processed, stored in window.zeqMathematicalPrompt', {
            promptLength: window.zeqMathematicalPrompt?.length || 0,
            conversationId
          });
          
          // DO NOT replace data.text - keep original message (like math.html does)
          // Framework will be injected at fetch level using window.zeqMathematicalPrompt
          // Store original message for later retrieval if needed
          if (typeof window !== 'undefined') {
            window.__zeqOriginalMessages = window.__zeqOriginalMessages || {};
            // We'll store it when we have the messageId in useChatFunctions
          }
        } catch (error) {
          console.error('❌ Zeq OS [useSubmitMessage]: Framework processing error', error);
          // Continue with original text if processing fails
        }
      }

      const rootMessages = getMessages();
      const isLatestInRootMessages = rootMessages?.some(
        (message) => message.messageId === latestMessage?.messageId,
      );
      if (!isLatestInRootMessages && latestMessage) {
        setMessages([...(rootMessages || []), latestMessage]);
      }

      const hasAdded = addedIndex && activeConvos[addedIndex] && addedConvo;
      const isNewMultiConvo =
        hasAdded &&
        activeConvos.every((convoId) => convoId === Constants.NEW_CONVO) &&
        !rootMessages?.length;
      const overrideConvoId = isNewMultiConvo ? v4() : undefined;
      const overrideUserMessageId = hasAdded ? v4() : undefined;
      const rootIndex = addedIndex - 1;
      const clientTimestamp = new Date().toISOString();

      // Log the text being sent to ask() to verify it's processed
      console.log('📤 Zeq OS [useSubmitMessage]: Sending to ask()', {
        textLength: data.text.length,
        textPreview: data.text.substring(0, 200),
        isJSON: data.text.trim().startsWith('{') || data.text.trim().startsWith('[')
      });
      
      ask({
        text: data.text,
        overrideConvoId: appendIndex(rootIndex, overrideConvoId),
        overrideUserMessageId: appendIndex(rootIndex, overrideUserMessageId),
        clientTimestamp,
      });

      if (hasAdded) {
        askAdditional(
          {
            text: data.text,
            overrideConvoId: appendIndex(addedIndex, overrideConvoId),
            overrideUserMessageId: appendIndex(addedIndex, overrideUserMessageId),
            clientTimestamp,
          },
          { overrideMessages: rootMessages },
        );
      }
      methods.reset();
    },
    [
      ask,
      methods,
      addedIndex,
      addedConvo,
      setMessages,
      getMessages,
      activeConvos,
      askAdditional,
      latestMessage,
    ],
  );

  const submitPrompt = useCallback(
    (text: string) => {
      const parsedText = replaceSpecialVars({ text, user });
      if (autoSendPrompts) {
        submitMessage({ text: parsedText });
        return;
      }

      const currentText = methods.getValues('text');
      const newText = currentText.trim().length > 1 ? `\n${parsedText}` : parsedText;
      setActivePrompt(newText);
    },
    [autoSendPrompts, submitMessage, setActivePrompt, methods, user],
  );

  return { submitMessage, submitPrompt };
}
