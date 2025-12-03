import React, { useMemo } from 'react';
import { getEndpointField } from 'librechat-data-provider';
import type * as t from 'librechat-data-provider';
import { getIconKey, getEntity, getIconEndpoint } from '~/utils';
import ConvoIconURL from '~/components/Endpoints/ConvoIconURL';
import { icons } from '~/hooks/Endpoint/Icons';

export default function ConvoIcon({
  conversation,
  endpointsConfig,
  assistantMap,
  agentsMap,
  className = '',
  containerClassName = '',
  context,
  size,
}: {
  conversation: t.TConversation | t.TPreset | null;
  endpointsConfig: t.TEndpointsConfig;
  assistantMap: t.TAssistantsMap | undefined;
  agentsMap: t.TAgentsMap | undefined;
  containerClassName?: string;
  context?: 'message' | 'nav' | 'landing' | 'menu-item';
  className?: string;
  size?: number;
}) {
  const iconURL = conversation?.iconURL ?? '';
  let endpoint = conversation?.endpoint;
  endpoint = getIconEndpoint({ endpointsConfig, iconURL, endpoint });

  // For sidebar menu (menu-item context), always use hulyapulse.png
  // For other contexts, use HULYAS icon for DeepSeek, otherwise use original iconURL
  let displayIconURL = iconURL;
  if (context === 'menu-item') {
    displayIconURL = '/assets/hulyapulse.png';
  } else {
    const isHulyas = endpoint === 'DeepSeek' && conversation?.model === 'deepseek-chat';
    displayIconURL = isHulyas ? '/assets/hulyas.gif' : iconURL;
  }

  const { entity, isAgent } = useMemo(
    () =>
      getEntity({
        endpoint,
        agentsMap,
        assistantMap,
        agent_id: conversation?.agent_id,
        assistant_id: conversation?.assistant_id,
      }),
    [endpoint, conversation?.agent_id, conversation?.assistant_id, agentsMap, assistantMap],
  );

  const name = entity?.name ?? '';
  const avatar = isAgent
    ? (entity as t.Agent | undefined)?.avatar?.filepath
    : ((entity as t.Assistant | undefined)?.metadata?.avatar as string);

  const endpointIconURL = getEndpointField(endpointsConfig, endpoint, 'iconURL');
  const iconKey = getIconKey({ endpoint, endpointsConfig, endpointIconURL });
  const Icon = icons[iconKey] ?? null;

  return (
    <>
      {displayIconURL && (displayIconURL.includes('http') || displayIconURL.startsWith('/')) ? (
        <ConvoIconURL
          iconURL={displayIconURL}
          modelLabel={conversation?.chatGptLabel ?? conversation?.modelLabel ?? ''}
          endpointIconURL={endpointIconURL}
          assistantAvatar={avatar}
          assistantName={name}
          agentAvatar={avatar}
          agentName={name}
          context={context}
        />
      ) : (
        <div className={containerClassName}>
          {endpoint && Icon != null && (
            <Icon
              size={size}
              context={context}
              endpoint={endpoint}
              className={className}
              iconURL={endpointIconURL}
              assistantName={name}
              agentName={name}
              avatar={avatar}
            />
          )}
        </div>
      )}
    </>
  );
}
