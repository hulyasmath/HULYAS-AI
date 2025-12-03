import { useEffect, useState } from 'react';
import { v4 } from 'uuid';
import { SSE } from 'sse.js';
import { useSetRecoilState } from 'recoil';
import {
  request,
  Constants,
  /* @ts-ignore */
  createPayload,
  LocalStorageKeys,
  removeNullishValues,
  EModelEndpoint,
} from 'librechat-data-provider';
import type { TMessage, TPayload, TSubmission, EventSubmission } from 'librechat-data-provider';
import type { EventHandlerParams } from './useEventHandlers';
import type { TResData } from '~/common';
import { useGenTitleMutation, useGetStartupConfig, useGetUserBalance } from '~/data-provider';
import { useAuthContext } from '~/hooks/AuthContext';
import useEventHandlers from './useEventHandlers';
import { processThroughFramework } from '~/lib/zeq-interceptor';
import { useLocalLLM } from './useLocalLLM';
import store from '~/store';

const clearDraft = (conversationId?: string | null) => {
  if (conversationId) {
    localStorage.removeItem(`${LocalStorageKeys.TEXT_DRAFT}${conversationId}`);
    localStorage.removeItem(`${LocalStorageKeys.FILES_DRAFT}${conversationId}`);
  } else {
    localStorage.removeItem(`${LocalStorageKeys.TEXT_DRAFT}${Constants.NEW_CONVO}`);
    localStorage.removeItem(`${LocalStorageKeys.FILES_DRAFT}${Constants.NEW_CONVO}`);
  }
};

type ChatHelpers = Pick<
  EventHandlerParams,
  | 'setMessages'
  | 'getMessages'
  | 'setConversation'
  | 'setIsSubmitting'
  | 'newConversation'
  | 'resetLatestMessage'
>;

export default function useSSE(
  submission: TSubmission | null,
  chatHelpers: ChatHelpers,
  isAddedRequest = false,
  runIndex = 0,
) {
  const genTitle = useGenTitleMutation();
  const setActiveRunId = useSetRecoilState(store.activeRunFamily(runIndex));

  const { token, isAuthenticated } = useAuthContext();
  const [completed, setCompleted] = useState(new Set());
  const setAbortScroll = useSetRecoilState(store.abortScrollFamily(runIndex));
  const setShowStopButton = useSetRecoilState(store.showStopButtonByIndex(runIndex));

  const {
    setMessages,
    getMessages,
    setConversation,
    setIsSubmitting,
    newConversation,
    resetLatestMessage,
  } = chatHelpers;

  const {
    clearStepMaps,
    stepHandler,
    syncHandler,
    finalHandler,
    errorHandler,
    messageHandler,
    contentHandler,
    createdHandler,
    attachmentHandler,
    abortConversation,
  } = useEventHandlers({
    genTitle,
    setMessages,
    getMessages,
    setCompleted,
    isAddedRequest,
    setConversation,
    setIsSubmitting,
    newConversation,
    setShowStopButton,
    resetLatestMessage,
  });

  // Handle local LLM requests
  // Note: Hook is always called (React requirement), but it checks endpoint internally
  useLocalLLM({
    submission,
    chatHelpers: {
      setMessages,
      getMessages,
      setConversation,
      setIsSubmitting,
      newConversation,
      resetLatestMessage,
    },
    eventHandlers: {
      createdHandler,
      messageHandler,
      finalHandler,
      errorHandler,
    },
  });

  const { data: startupConfig } = useGetStartupConfig();
  const balanceQuery = useGetUserBalance({
    enabled: !!isAuthenticated && startupConfig?.balance?.enabled,
  });

  useEffect(() => {
    if (submission == null || Object.keys(submission).length === 0) {
      return;
    }

    // Check if this is a local LLM request
    const endpoint = submission.conversation?.endpoint;
    if (endpoint === 'local') {
      // Use local LLM instead of SSE
      console.log('🤖 Local LLM: Detected local endpoint, routing to local inference');
      return;
    }

    // CRITICAL: Preserve original userMessage.text for UI display
    // userMessage.text is what gets displayed in the chat - it MUST be the original text
    // Only payload.text gets the processed prompt for the API
    let { userMessage } = submission;
    
    // Store original text to ensure it's never lost
    const originalText = userMessage?.text || '';
    
    // CRITICAL: DO NOT modify userMessage.text - it's used for UI display
    // Only replace text in the API payload, NOT in the userMessage object
    // User should see their original message, API receives processed prompt
    let processedSubmission = {
      ...submission,
      userMessage: {
        ...userMessage,
        text: originalText // Ensure userMessage.text is ALWAYS the original
      }
    };

    const payloadData = createPayload(processedSubmission);
    let { payload } = payloadData;
    payload = removeNullishValues(payload) as TPayload;

    // EXACT PATTERN FROM math.html - Use global zeqMathematicalPrompt for payload
    // Replace payload text/messages with global prompt (EXACT from math.html streamGen pattern)
    if (typeof window !== 'undefined' && window.zeqMathematicalPrompt) {
      try {
        // Replace payload.text with global prompt
        if (payload.text) {
          console.log('📤 Zeq OS [useSSE]: Replacing payload.text with global zeqMathematicalPrompt', {
            originalLength: payload.text.length,
            promptLength: window.zeqMathematicalPrompt.length
          });
          payload.text = window.zeqMathematicalPrompt;
        }
        
        // Replace messages array content with global prompt
        if (payload.messages && Array.isArray(payload.messages)) {
          console.log('📤 Zeq OS [useSSE]: Replacing messages array with global zeqMathematicalPrompt', {
            messageCount: payload.messages.length
          });
          
          // Replace the last user message (EXACT from math.html pattern)
          for (let i = payload.messages.length - 1; i >= 0; i--) {
            const msg = payload.messages[i];
            if (msg && (msg.role === 'user' || msg.role === 'User')) {
              if (typeof msg.content === 'string') {
                msg.content = window.zeqMathematicalPrompt;
              } else if (Array.isArray(msg.content)) {
                const textPart = msg.content.find(p => p.type === 'text');
                if (textPart) {
                  textPart.text = window.zeqMathematicalPrompt;
                }
              }
              console.log('✅ Zeq OS [useSSE]: Message replaced with global prompt', {
                index: i,
                promptLength: window.zeqMathematicalPrompt.length
              });
              break; // Only replace the last user message
            }
          }
        }
      } catch (error) {
        console.error('❌ Zeq OS [useSSE]: Payload replacement error', error);
      }
    } else {
      console.warn('⚠️ Zeq OS [useSSE]: Global zeqMathematicalPrompt not available for payload', {
        hasGlobalPrompt: typeof window !== 'undefined' && !!window.zeqMathematicalPrompt,
        hasText: !!payload.text,
        hasMessages: !!(payload.messages && Array.isArray(payload.messages))
      });
    }

    let textIndex = null;
    clearStepMaps();

    // Log final payload before sending
    console.log('📤 Zeq OS [useSSE]: Sending payload to API', {
      server: payloadData.server,
      textLength: payload.text?.length || 0,
      textPreview: payload.text?.substring(0, 100) || 'no text'
    });

    const sse = new SSE(payloadData.server, {
      payload: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });

    sse.addEventListener('attachment', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        attachmentHandler({ data, submission: submission as EventSubmission });
      } catch (error) {
        console.error(error);
      }
    });

    sse.addEventListener('message', (e: MessageEvent) => {
      const data = JSON.parse(e.data);

      if (data.final != null) {
        clearDraft(submission.conversation?.conversationId);
        const { plugins } = data;
        finalHandler(data, { ...submission, plugins } as EventSubmission);
        (startupConfig?.balance?.enabled ?? false) && balanceQuery.refetch();
        console.log('final', data);
        return;
      } else if (data.created != null) {
        const runId = v4();
        setActiveRunId(runId);
        userMessage = {
          ...userMessage,
          ...data.message,
          text: originalText, // Always preserve original text for display
          overrideParentMessageId: userMessage.overrideParentMessageId,
        };

        createdHandler(data, { ...submission, userMessage } as EventSubmission);
      } else if (data.event != null) {
        stepHandler(data, { ...submission, userMessage } as EventSubmission);
      } else if (data.sync != null) {
        const runId = v4();
        setActiveRunId(runId);
        /* synchronize messages to Assistants API as well as with real DB ID's */
        syncHandler(data, { ...submission, userMessage } as EventSubmission);
      } else if (data.type != null) {
        const { text, index } = data;
        if (text != null && index !== textIndex) {
          textIndex = index;
        }

        contentHandler({ data, submission: submission as EventSubmission });
      } else {
        const text = data.text ?? data.response;
        const { plugin, plugins } = data;

        const initialResponse = {
          ...(submission.initialResponse as TMessage),
          parentMessageId: data.parentMessageId,
          messageId: data.messageId,
        };

        if (data.message != null) {
          messageHandler(text, { ...submission, plugin, plugins, userMessage, initialResponse });
        }
      }
    });

    sse.addEventListener('open', () => {
      setAbortScroll(false);
      console.log('connection is opened');
    });

    sse.addEventListener('cancel', async () => {
      const streamKey = (submission as TSubmission | null)?.['initialResponse']?.messageId;
      if (completed.has(streamKey)) {
        setIsSubmitting(false);
        setCompleted((prev) => {
          prev.delete(streamKey);
          return new Set(prev);
        });
        return;
      }

      setCompleted((prev) => new Set(prev.add(streamKey)));
      const latestMessages = getMessages();
      const conversationId = latestMessages?.[latestMessages.length - 1]?.conversationId;
      return await abortConversation(
        conversationId ??
          userMessage.conversationId ??
          submission.conversation?.conversationId ??
          '',
        submission as EventSubmission,
        latestMessages,
      );
    });

    sse.addEventListener('error', async (e: MessageEvent) => {
      /* @ts-ignore */
      if (e.responseCode === 401) {
        /* token expired, refresh and retry */
        try {
          const refreshResponse = await request.refreshToken();
          const token = refreshResponse?.token ?? '';
          if (!token) {
            throw new Error('Token refresh failed.');
          }
          sse.headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          };

          request.dispatchTokenUpdatedEvent(token);
          sse.stream();
          return;
        } catch (error) {
          /* token refresh failed, continue handling the original 401 */
          console.log(error);
        }
      }

      console.log('error in server stream.');
      (startupConfig?.balance?.enabled ?? false) && balanceQuery.refetch();

      let data: TResData | undefined = undefined;
      try {
        data = JSON.parse(e.data) as TResData;
      } catch (error) {
        console.error(error);
        console.log(e);
        setIsSubmitting(false);
      }

      errorHandler({ data, submission: { ...submission, userMessage } as EventSubmission });
    });

    setIsSubmitting(true);
    sse.stream();

    return () => {
      const isCancelled = sse.readyState <= 1;
      sse.close();
      if (isCancelled) {
        const e = new Event('cancel');
        /* @ts-ignore */
        sse.dispatchEvent(e);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission]);
}
