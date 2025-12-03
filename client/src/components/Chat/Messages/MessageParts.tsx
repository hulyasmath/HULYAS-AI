import React, { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { useRecoilValue } from 'recoil';
import type { TMessageContentParts } from 'librechat-data-provider';
import type { TMessageProps, TMessageIcon } from '~/common';
import { useMessageHelpers, useLocalize, useAttachments } from '~/hooks';
import MessageIcon from '~/components/Chat/Messages/MessageIcon';
import ContentParts from './Content/ContentParts';
import { fontSizeAtom } from '~/store/fontSize';
import SiblingSwitch from './SiblingSwitch';
import MultiMessage from './MultiMessage';
import HoverButtons from './HoverButtons';
import SubRow from './SubRow';
import { cn } from '~/utils';
import store from '~/store';

export default function Message(props: TMessageProps) {
  const localize = useLocalize();
  const { message, siblingIdx, siblingCount, setSiblingIdx, currentEditId, setCurrentEditId } =
    props;
  const { attachments, searchResults } = useAttachments({
    messageId: message?.messageId,
    attachments: message?.attachments,
  });
  const {
    edit,
    index,
    agent,
    isLast,
    enterEdit,
    assistant,
    handleScroll,
    conversation,
    isSubmitting,
    latestMessage,
    handleContinue,
    copyToClipboard,
    regenerateMessage,
  } = useMessageHelpers(props);

  const fontSize = useAtomValue(fontSizeAtom);
  const maximizeChatSpace = useRecoilValue(store.maximizeChatSpace);
  const { children, messageId = null, isCreatedByUser } = message ?? {};

  const name = useMemo(() => {
    if (isCreatedByUser === true) {
      return localize('com_user_message');
    }
    
    // Always check endpoint/model first for HULYAS override (even if assistant/agent exists)
    const endpoint = message?.endpoint ?? conversation?.endpoint;
    const model = message?.model ?? conversation?.model;
    if (endpoint === 'DeepSeek' && model === 'deepseek-chat') {
      return 'HULYAS';
    }
    
    // Then check for assistant/agent
    if (assistant) {
      return assistant.name ?? localize('com_ui_assistant');
    }
    if (agent) {
      return agent.name ?? localize('com_ui_agent');
    }
    
    // For OpenRouter (Large Language Models), extract friendly name from model ID
    if (endpoint === 'OpenRouter' && model) {
      // Extract model name from format like "google/gemini-3-pro-preview" -> "Gemini 3 Pro"
      const modelParts = model.split('/');
      if (modelParts.length > 1) {
        const modelName = modelParts[1];
        // Convert "gemini-3-pro-preview" to "Gemini 3 Pro"
        const friendlyName = modelName
          .split('-')
          .map((part, index) => {
            // Skip version numbers and preview/suffixes for cleaner display
            if (part === 'preview' || part === 'instruct' || part === 'chat' || part === 'coder') {
              return '';
            }
            // Capitalize first letter of each meaningful part
            return part.charAt(0).toUpperCase() + part.slice(1);
          })
          .filter(Boolean)
          .join(' ');
        return friendlyName || model;
      }
      return model;
    }
    
    // Fallback to message sender
    return message?.sender ?? localize('com_ui_assistant');
  }, [assistant, agent, isCreatedByUser, localize, message?.endpoint, message?.model, message?.sender, conversation?.endpoint, conversation?.model]);

  const iconData: TMessageIcon = useMemo(
    () => {
      const endpoint = message?.endpoint ?? conversation?.endpoint;
      const model = message?.model ?? conversation?.model;
      const isHulyas = endpoint === 'DeepSeek' && model === 'deepseek-chat';
      
      return {
        endpoint: endpoint,
        model: model,
        iconURL: isHulyas ? '/assets/hulyas.gif' : (message?.iconURL ?? conversation?.iconURL),
        modelLabel: name,
        isCreatedByUser: message?.isCreatedByUser,
      };
    },
    [
      name,
      conversation?.endpoint,
      conversation?.iconURL,
      conversation?.model,
      message?.model,
      message?.iconURL,
      message?.endpoint,
      message?.isCreatedByUser,
    ],
  );

  if (!message) {
    return null;
  }

  const baseClasses = {
    common: 'group mx-auto flex flex-1 gap-3 transition-all duration-300 transform-gpu',
    chat: maximizeChatSpace
      ? 'w-full max-w-full md:px-5 lg:px-1 xl:px-5'
      : 'md:max-w-[47rem] xl:max-w-[55rem]',
  };

  return (
    <>
      <div
        className="w-full border-0 bg-transparent dark:border-0 dark:bg-transparent"
        onWheel={handleScroll}
        onTouchMove={handleScroll}
      >
        <div className="m-auto justify-center p-4 py-2 md:gap-6">
          <div
            id={messageId ?? ''}
            aria-label={`message-${message.depth}-${messageId}`}
            className={cn(baseClasses.common, baseClasses.chat, 'message-render')}
          >
            <div className="relative flex flex-shrink-0 flex-col items-center">
              <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full pt-0.5">
                <MessageIcon iconData={iconData} assistant={assistant} agent={agent} />
              </div>
            </div>
            <div
              className={cn(
                'relative flex w-11/12 flex-col',
                isCreatedByUser ? 'user-turn' : 'agent-turn',
              )}
            >
              <h2 className={cn('select-none font-semibold text-text-primary', fontSize)}>
                {name}
              </h2>
              <div className="flex flex-col gap-1">
                <div className="flex max-w-full flex-grow flex-col gap-0">
                  <ContentParts
                    edit={edit}
                    isLast={isLast}
                    enterEdit={enterEdit}
                    siblingIdx={siblingIdx}
                    attachments={attachments}
                    isSubmitting={isSubmitting}
                    searchResults={searchResults}
                    messageId={message.messageId}
                    setSiblingIdx={setSiblingIdx}
                    isCreatedByUser={message.isCreatedByUser}
                    conversationId={conversation?.conversationId}
                    isLatestMessage={messageId === latestMessage?.messageId}
                    content={message.content as Array<TMessageContentParts | undefined>}
                  />
                </div>
                {isLast && isSubmitting ? (
                  <div className="mt-1 h-[27px] bg-transparent" />
                ) : (
                  <SubRow classes="text-xs">
                    <SiblingSwitch
                      siblingIdx={siblingIdx}
                      siblingCount={siblingCount}
                      setSiblingIdx={setSiblingIdx}
                    />
                    <HoverButtons
                      index={index}
                      isEditing={edit}
                      message={message}
                      enterEdit={enterEdit}
                      isSubmitting={isSubmitting}
                      conversation={conversation ?? null}
                      regenerate={() => regenerateMessage()}
                      copyToClipboard={copyToClipboard}
                      handleContinue={handleContinue}
                      latestMessage={latestMessage}
                      isLast={isLast}
                    />
                  </SubRow>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <MultiMessage
        key={messageId}
        messageId={messageId}
        conversation={conversation}
        messagesTree={children ?? []}
        currentEditId={currentEditId}
        setCurrentEditId={setCurrentEditId}
      />
    </>
  );
}
