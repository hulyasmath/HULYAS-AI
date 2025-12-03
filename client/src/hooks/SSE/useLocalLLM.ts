/**
 * Local LLM Hook - Handles local inference when endpoint is "local"
 * Integrates with the existing SSE flow to provide seamless local inference
 */

import { useEffect, useRef } from 'react';
import type { TMessage, TSubmission, EventSubmission } from 'librechat-data-provider';
import type { EventHandlerParams } from './useEventHandlers';
import type { LocalLLMOptions } from '~/lib/local-llm-client';

// Lazy load local LLM client to avoid loading transformers library unless needed
async function getLocalLLMClientLazy() {
  const module = await import('~/lib/local-llm-client');
  return module.getLocalLLMClient();
}

interface UseLocalLLMParams {
  submission: TSubmission | null;
  chatHelpers: Pick<
    EventHandlerParams,
    | 'setMessages'
    | 'getMessages'
    | 'setConversation'
    | 'setIsSubmitting'
    | 'newConversation'
    | 'resetLatestMessage'
  >;
  eventHandlers: {
    createdHandler: (data: any, submission: EventSubmission) => void;
    messageHandler: (text: string, submission: EventSubmission) => void;
    finalHandler: (data: any, submission: EventSubmission) => void;
    errorHandler: (error: any, submission: EventSubmission) => void;
  };
}

export function useLocalLLM({
  submission,
  chatHelpers,
  eventHandlers,
}: UseLocalLLMParams) {
  const abortControllerRef = useRef<AbortController | null>(null);
  const {
    setMessages,
    getMessages,
    setIsSubmitting,
    resetLatestMessage,
  } = chatHelpers;

  useEffect(() => {
    if (!submission || Object.keys(submission).length === 0) {
      return;
    }

    const endpoint = submission.conversation?.endpoint;
    if (endpoint !== 'local') {
      return; // Not a local LLM request
    }

    console.log('🤖 Local LLM: Processing request locally...');

    const processLocalLLM = async () => {
      try {
        // Lazy load the client only when actually using local LLM
        const client = await getLocalLLMClientLazy();
        
        // Check if supported
        const supportCheck = await client.isSupported();
        if (!supportCheck.supported) {
          throw new Error(`Local LLM not supported: ${supportCheck.reason}`);
        }

        // Get messages from conversation
        const messages = getMessages() || [];
        const conversationMessages = messages.map((msg: TMessage) => ({
          role: (msg as any).role || (msg.isCreatedByUser ? 'user' : 'assistant'),
          content: typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text),
        }));

        // Add the current user message
        if (submission.userMessage?.text) {
          conversationMessages.push({
            role: 'user',
            content: submission.userMessage.text,
          });
        }

        // Get model from conversation or use default
        const model = submission.conversation?.model || 'Xenova/Qwen2.5-0.5B-Instruct';
        
        // Initialize model
        await client.initialize(model);

        // Create initial response message
        const initialResponse: TMessage = {
          messageId: submission.initialResponse?.messageId || `local-${Date.now()}`,
          conversationId: submission.conversation?.conversationId || null,
          parentMessageId: submission.userMessage?.messageId || null,
          text: '',
          isCreatedByUser: false,
          finish_reason: null,
        } as TMessage;

        // Simulate created event
        eventHandlers.createdHandler(
          {
            message: initialResponse,
            parentMessageId: submission.userMessage?.messageId,
          },
          submission as EventSubmission,
        );

        // Generate response with streaming
        let fullText = '';
        abortControllerRef.current = new AbortController();

        const options: LocalLLMOptions = {
          model,
          temperature: submission.conversation?.temperature ?? 0.7,
          maxTokens: submission.conversation?.maxTokens ?? 512,
        };

        for await (const chunk of client.generateStream(conversationMessages, options)) {
          if (abortControllerRef.current?.signal.aborted) {
            console.log('🤖 Local LLM: Generation aborted');
            break;
          }

          fullText = chunk.text;
          
          // Update message with streaming text
          eventHandlers.messageHandler(fullText, {
            ...submission,
            initialResponse,
            userMessage: submission.userMessage,
          } as EventSubmission);

          if (chunk.finished) {
            break;
          }
        }

        // Finalize message
        eventHandlers.finalHandler(
          {
            message: {
              ...initialResponse,
              text: fullText,
              finish_reason: 'stop',
            },
          },
          submission as EventSubmission,
        );

        setIsSubmitting(false);
        resetLatestMessage();
        console.log('✅ Local LLM: Generation complete');
      } catch (error: any) {
        console.error('❌ Local LLM: Error during generation', error);
        eventHandlers.errorHandler(error, submission as EventSubmission);
        setIsSubmitting(false);
        resetLatestMessage();
      }
    };

    processLocalLLM();

    // Cleanup on unmount or new submission
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [submission, chatHelpers, eventHandlers]);

  return {
    abort: () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    },
  };
}

