import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  UseQueryOptions,
  UseMutationResult,
  QueryObserverResult,
} from '@tanstack/react-query';
import { Constants, initialModelsConfig } from '../config';
import { defaultOrderQuery } from '../types/assistants';
import { MCPServerConnectionStatusResponse } from '../types/queries';
import * as dataService from '../data-service';
import * as m from '../types/mutations';
import * as q from '../types/queries';
import { QueryKeys } from '../keys';
import * as s from '../schemas';
import * as t from '../types';
import * as permissions from '../accessPermissions';
import { ResourceType } from '../accessPermissions';

export { hasPermissions } from '../accessPermissions';

export const useGetSharedMessages = (
  shareId: string,
  config?: UseQueryOptions<t.TSharedMessagesResponse>,
): QueryObserverResult<t.TSharedMessagesResponse> => {
  return useQuery<t.TSharedMessagesResponse>(
    [QueryKeys.sharedMessages, shareId],
    () => dataService.getSharedMessages(shareId),
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      ...config,
    },
  );
};

export const useGetSharedLinkQuery = (
  conversationId: string,
  config?: UseQueryOptions<t.TSharedLinkGetResponse>,
): QueryObserverResult<t.TSharedLinkGetResponse> => {
  const queryClient = useQueryClient();
  return useQuery<t.TSharedLinkGetResponse>(
    [QueryKeys.sharedLinks, conversationId],
    () => dataService.getSharedLink(conversationId),
    {
      enabled:
        !!conversationId &&
        conversationId !== Constants.NEW_CONVO &&
        conversationId !== Constants.PENDING_CONVO,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      onSuccess: (data) => {
        queryClient.setQueryData([QueryKeys.sharedLinks, conversationId], {
          conversationId: data.conversationId,
          shareId: data.shareId,
        });
      },
      ...config,
    },
  );
};

export const useGetConversationByIdQuery = (
  id: string,
  config?: UseQueryOptions<s.TConversation>,
): QueryObserverResult<s.TConversation> => {
  return useQuery<s.TConversation>(
    [QueryKeys.conversation, id],
    () => dataService.getConversationById(id),
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      ...config,
    },
  );
};

//This isn't ideal because its just a query and we're using mutation, but it was the only way
//to make it work with how the Chat component is structured
export const useGetConversationByIdMutation = (id: string): UseMutationResult<s.TConversation> => {
  const queryClient = useQueryClient();
  return useMutation(() => dataService.getConversationById(id), {
    // onSuccess: (res: s.TConversation) => {
    onSuccess: () => {
      queryClient.invalidateQueries([QueryKeys.conversation, id]);
    },
  });
};

export const useUpdateMessageMutation = (
  id: string,
): UseMutationResult<unknown, unknown, t.TUpdateMessageRequest, unknown> => {
  const queryClient = useQueryClient();
  return useMutation((payload: t.TUpdateMessageRequest) => dataService.updateMessage(payload), {
    onSuccess: () => {
      queryClient.invalidateQueries([QueryKeys.messages, id]);
    },
  });
};

export const useUpdateMessageContentMutation = (
  conversationId: string,
): UseMutationResult<unknown, unknown, t.TUpdateMessageContent, unknown> => {
  const queryClient = useQueryClient();
  return useMutation(
    (payload: t.TUpdateMessageContent) => dataService.updateMessageContent(payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryKeys.messages, conversationId]);
      },
    },
  );
};

export const useUpdateUserKeysMutation = (): UseMutationResult<
  t.TUser,
  unknown,
  t.TUpdateUserKeyRequest,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation((payload: t.TUpdateUserKeyRequest) => dataService.updateUserKey(payload), {
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries([QueryKeys.name, variables.name]);
    },
  });
};

export const useClearConversationsMutation = (): UseMutationResult<unknown> => {
  const queryClient = useQueryClient();
  return useMutation(() => dataService.clearAllConversations(), {
    onSuccess: () => {
      queryClient.invalidateQueries([QueryKeys.allConversations]);
    },
  });
};

export const useRevokeUserKeyMutation = (name: string): UseMutationResult<unknown> => {
  const queryClient = useQueryClient();
  return useMutation(() => dataService.revokeUserKey(name), {
    onSuccess: () => {
      queryClient.invalidateQueries([QueryKeys.name, name]);
      if (s.isAssistantsEndpoint(name)) {
        queryClient.invalidateQueries([QueryKeys.assistants, name, defaultOrderQuery]);
        queryClient.invalidateQueries([QueryKeys.assistantDocs]);
        queryClient.invalidateQueries([QueryKeys.assistants]);
        queryClient.invalidateQueries([QueryKeys.assistant]);
        queryClient.invalidateQueries([QueryKeys.mcpTools]);
        queryClient.invalidateQueries([QueryKeys.actions]);
        queryClient.invalidateQueries([QueryKeys.tools]);
      }
    },
  });
};

export const useRevokeAllUserKeysMutation = (): UseMutationResult<unknown> => {
  const queryClient = useQueryClient();
  return useMutation(() => dataService.revokeAllUserKeys(), {
    onSuccess: () => {
      queryClient.invalidateQueries([QueryKeys.name]);
      queryClient.invalidateQueries([
        QueryKeys.assistants,
        s.EModelEndpoint.assistants,
        defaultOrderQuery,
      ]);
      queryClient.invalidateQueries([
        QueryKeys.assistants,
        s.EModelEndpoint.azureAssistants,
        defaultOrderQuery,
      ]);
      queryClient.invalidateQueries([QueryKeys.assistantDocs]);
      queryClient.invalidateQueries([QueryKeys.assistants]);
      queryClient.invalidateQueries([QueryKeys.assistant]);
      queryClient.invalidateQueries([QueryKeys.mcpTools]);
      queryClient.invalidateQueries([QueryKeys.actions]);
      queryClient.invalidateQueries([QueryKeys.tools]);
    },
  });
};

export const useGetModelsQuery = (
  config?: UseQueryOptions<t.TModelsConfig>,
): QueryObserverResult<t.TModelsConfig> => {
  return useQuery<t.TModelsConfig>([QueryKeys.models], () => dataService.getModels(), {
    initialData: initialModelsConfig,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: Infinity,
    ...config,
  });
};

export const useCreatePresetMutation = (): UseMutationResult<
  s.TPreset,
  unknown,
  s.TPreset,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation((payload: s.TPreset) => dataService.createPreset(payload), {
    onSuccess: () => {
      queryClient.invalidateQueries([QueryKeys.presets]);
    },
  });
};

export const useDeletePresetMutation = (): UseMutationResult<
  m.PresetDeleteResponse,
  unknown,
  s.TPreset | undefined,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation((payload: s.TPreset | undefined) => dataService.deletePreset(payload), {
    onSuccess: () => {
      queryClient.invalidateQueries([QueryKeys.presets]);
    },
  });
};

export const useUpdateTokenCountMutation = (): UseMutationResult<
  t.TUpdateTokenCountResponse,
  unknown,
  { text: string },
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation(({ text }: { text: string }) => dataService.updateTokenCount(text), {
    onSuccess: () => {
      queryClient.invalidateQueries([QueryKeys.tokenCount]);
    },
  });
};

export const useRegisterUserMutation = (
  options?: m.RegistrationOptions,
): UseMutationResult<t.TError, unknown, t.TRegisterUser, unknown> => {
  const queryClient = useQueryClient();
  return useMutation<t.TRegisterUserResponse, t.TError, t.TRegisterUser>(
    (payload: t.TRegisterUser) => dataService.register(payload),
    {
      ...options,
      onSuccess: (...args) => {
        queryClient.invalidateQueries([QueryKeys.user]);
        if (options?.onSuccess) {
          options.onSuccess(...args);
        }
      },
    },
  );
};

export const useUserKeyQuery = (
  name: string,
  config?: UseQueryOptions<t.TCheckUserKeyResponse>,
): QueryObserverResult<t.TCheckUserKeyResponse> => {
  return useQuery<t.TCheckUserKeyResponse>(
    [QueryKeys.name, name],
    () => {
      if (!name) {
        return Promise.resolve({ expiresAt: '' });
      }
      return dataService.userKeyQuery(name);
    },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      retry: false,
      ...config,
    },
  );
};

export const useRequestPasswordResetMutation = (): UseMutationResult<
  t.TRequestPasswordResetResponse,
  unknown,
  t.TRequestPasswordReset,
  unknown
> => {
  return useMutation((payload: t.TRequestPasswordReset) =>
    dataService.requestPasswordReset(payload),
  );
};

export const useResetPasswordMutation = (): UseMutationResult<
  unknown,
  unknown,
  t.TResetPassword,
  unknown
> => {
  return useMutation((payload: t.TResetPassword) => dataService.resetPassword(payload));
};

export const useAvailablePluginsQuery = <TData = s.TPlugin[]>(
  config?: UseQueryOptions<s.TPlugin[], unknown, TData>,
): QueryObserverResult<TData> => {
  return useQuery<s.TPlugin[], unknown, TData>(
    [QueryKeys.availablePlugins],
    () => dataService.getAvailablePlugins(),
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      ...config,
    },
  );
};

export const useUpdateUserPluginsMutation = (
  _options?: m.UpdatePluginAuthOptions,
): UseMutationResult<t.TUser, unknown, t.TUpdateUserPlugins, unknown> => {
  const queryClient = useQueryClient();
  const { onSuccess, ...options } = _options ?? {};
  return useMutation((payload: t.TUpdateUserPlugins) => dataService.updateUserPlugins(payload), {
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries([QueryKeys.user]);
      onSuccess?.(...args);
      if (args[1]?.action === 'uninstall' && args[1]?.pluginKey?.startsWith(Constants.mcp_prefix)) {
        const serverName = args[1]?.pluginKey?.substring(Constants.mcp_prefix.length);
        queryClient.invalidateQueries([QueryKeys.mcpAuthValues, serverName]);
      }
    },
  });
};

export const useReinitializeMCPServerMutation = (): UseMutationResult<
  {
    success: boolean;
    message: string;
    serverName: string;
    oauthRequired?: boolean;
    oauthUrl?: string;
  },
  unknown,
  string,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation((serverName: string) => dataService.reinitializeMCPServer(serverName), {
    onSuccess: () => {
      queryClient.invalidateQueries([QueryKeys.mcpTools]);
    },
  });
};

export const useCancelMCPOAuthMutation = (): UseMutationResult<
  m.CancelMCPOAuthResponse,
  unknown,
  string,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation((serverName: string) => dataService.cancelMCPOAuth(serverName), {
    onSuccess: () => {
      queryClient.invalidateQueries([QueryKeys.mcpConnectionStatus]);
    },
  });
};

export const useGetCustomConfigSpeechQuery = (
  config?: UseQueryOptions<t.TCustomConfigSpeechResponse>,
): QueryObserverResult<t.TCustomConfigSpeechResponse> => {
  return useQuery<t.TCustomConfigSpeechResponse>(
    [QueryKeys.customConfigSpeech],
    () => dataService.getCustomConfigSpeech(),
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      ...config,
    },
  );
};

export const useUpdateFeedbackMutation = (
  conversationId: string,
  messageId: string,
): UseMutationResult<t.TUpdateFeedbackResponse, Error, t.TUpdateFeedbackRequest> => {
  const queryClient = useQueryClient();
  return useMutation(
    (payload: t.TUpdateFeedbackRequest) =>
      dataService.updateFeedback(conversationId, messageId, payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryKeys.messages, messageId]);
      },
    },
  );
};

export const useSearchPrincipalsQuery = (
  params: q.PrincipalSearchParams,
  config?: UseQueryOptions<q.PrincipalSearchResponse>,
): QueryObserverResult<q.PrincipalSearchResponse> => {
  return useQuery<q.PrincipalSearchResponse>(
    [QueryKeys.principalSearch, params],
    () => dataService.searchPrincipals(params),
    {
      enabled: !!params.q && params.q.length >= 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      staleTime: 30000,
      ...config,
    },
  );
};

export const useGetAccessRolesQuery = (
  resourceType: ResourceType,
  config?: UseQueryOptions<q.AccessRolesResponse>,
): QueryObserverResult<q.AccessRolesResponse> => {
  return useQuery<q.AccessRolesResponse>(
    [QueryKeys.accessRoles, resourceType],
    () => dataService.getAccessRoles(resourceType),
    {
      enabled: !!resourceType,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      ...config,
    },
  );
};

export const useGetResourcePermissionsQuery = (
  resourceType: ResourceType,
  resourceId: string,
  config?: UseQueryOptions<permissions.TGetResourcePermissionsResponse>,
): QueryObserverResult<permissions.TGetResourcePermissionsResponse> => {
  return useQuery<permissions.TGetResourcePermissionsResponse>(
    [QueryKeys.resourcePermissions, resourceType, resourceId],
    () => dataService.getResourcePermissions(resourceType, resourceId),
    {
      enabled: !!resourceType && !!resourceId,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      staleTime: 2 * 60 * 1000, // Cache for 2 minutes
      ...config,
    },
  );
};

export const useUpdateResourcePermissionsMutation = (): UseMutationResult<
  permissions.TUpdateResourcePermissionsResponse,
  Error,
  {
    resourceType: ResourceType;
    resourceId: string;
    data: permissions.TUpdateResourcePermissionsRequest;
  }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resourceType, resourceId, data }) =>
      dataService.updateResourcePermissions(resourceType, resourceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.accessRoles, variables.resourceType],
      });

      queryClient.invalidateQueries({
        queryKey: [QueryKeys.resourcePermissions, variables.resourceType, variables.resourceId],
      });

      queryClient.invalidateQueries({
        queryKey: [QueryKeys.effectivePermissions, variables.resourceType, variables.resourceId],
      });
    },
  });
};

export const useGetEffectivePermissionsQuery = (
  resourceType: ResourceType,
  resourceId: string,
  config?: UseQueryOptions<permissions.TEffectivePermissionsResponse>,
): QueryObserverResult<permissions.TEffectivePermissionsResponse> => {
  return useQuery<permissions.TEffectivePermissionsResponse>({
    queryKey: [QueryKeys.effectivePermissions, resourceType, resourceId],
    queryFn: () => dataService.getEffectivePermissions(resourceType, resourceId),
    enabled: !!resourceType && !!resourceId,
    refetchOnWindowFocus: false,
    staleTime: 30000,
    ...config,
  });
};

export const useMCPServerConnectionStatusQuery = (
  serverName: string,
  config?: UseQueryOptions<MCPServerConnectionStatusResponse>,
): QueryObserverResult<MCPServerConnectionStatusResponse> => {
  return useQuery<MCPServerConnectionStatusResponse>(
    [QueryKeys.mcpConnectionStatus, serverName],
    () => dataService.getMCPServerConnectionStatus(serverName),
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      staleTime: 10000, // 10 seconds
      enabled: !!serverName,
      ...config,
    },
  );
};

// Admin Plan Management Hooks
import type {
  TPlan,
  TCreatePlanRequest,
  TUpdatePlanRequest,
  TUserUsage,
  TUserPlanInfo,
  TUpdateUserPlanRequest,
} from '../data-service';

export type { TPlan, TCreatePlanRequest, TUpdatePlanRequest, TUserUsage, TUserPlanInfo, TUpdateUserPlanRequest };

export const useGetAdminPlansQuery = (
  config?: UseQueryOptions<TPlan[]>,
): QueryObserverResult<TPlan[]> => {
  return useQuery<TPlan[]>(
    [QueryKeys.name, 'admin', 'plans'],
    () => dataService.getAdminPlans(),
    {
      refetchOnWindowFocus: false,
      ...config,
    },
  );
};

export const useGetPublicPlansQuery = (
  config?: UseQueryOptions<TPlan[]>,
): QueryObserverResult<TPlan[]> => {
  return useQuery<TPlan[]>(
    [QueryKeys.name, 'public', 'plans'],
    () => dataService.getPublicPlans(),
    {
      refetchOnWindowFocus: false,
      ...config,
    },
  );
};

export const useGetAdminPlanQuery = (
  planId: string,
  config?: UseQueryOptions<TPlan>,
): QueryObserverResult<TPlan> => {
  return useQuery<TPlan>(
    [QueryKeys.name, 'admin', 'plan', planId],
    () => dataService.getAdminPlan(planId),
    {
      enabled: !!planId,
      refetchOnWindowFocus: false,
      ...config,
    },
  );
};

export const useCreateAdminPlanMutation = (): UseMutationResult<
  TPlan,
  unknown,
  TCreatePlanRequest,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation((payload: TCreatePlanRequest) => dataService.createAdminPlan(payload), {
    onSuccess: () => {
      queryClient.invalidateQueries([QueryKeys.name, 'admin', 'plans']);
    },
  });
};

export const useUpdateAdminPlanMutation = (): UseMutationResult<
  TPlan,
  unknown,
  { planId: string; data: TUpdatePlanRequest },
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ planId, data }: { planId: string; data: TUpdatePlanRequest }) =>
      dataService.updateAdminPlan(planId, data),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries([QueryKeys.name, 'admin', 'plans']);
        queryClient.invalidateQueries([QueryKeys.name, 'admin', 'plan', variables.planId]);
      },
    },
  );
};

export const useDeleteAdminPlanMutation = (): UseMutationResult<
  { message: string; plan: TPlan },
  unknown,
  string,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation((planId: string) => dataService.deleteAdminPlan(planId), {
    onSuccess: () => {
      queryClient.invalidateQueries([QueryKeys.name, 'admin', 'plans']);
    },
  });
};

export const useGetAdminUserUsageQuery = (
  userId: string,
  config?: UseQueryOptions<TUserUsage>,
): QueryObserverResult<TUserUsage> => {
  return useQuery<TUserUsage>(
    [QueryKeys.name, 'admin', 'user', userId, 'usage'],
    () => dataService.getAdminUserUsage(userId),
    {
      enabled: !!userId,
      refetchOnWindowFocus: false,
      ...config,
    },
  );
};

export const useGetAdminUserPlanQuery = (
  userId: string,
  config?: UseQueryOptions<TUserPlanInfo>,
): QueryObserverResult<TUserPlanInfo> => {
  return useQuery<TUserPlanInfo>(
    [QueryKeys.name, 'admin', 'user', userId, 'plan'],
    () => dataService.getAdminUserPlan(userId),
    {
      enabled: !!userId,
      refetchOnWindowFocus: false,
      ...config,
    },
  );
};

export const useUpdateAdminUserPlanMutation = (): UseMutationResult<
  { message: string; user: any },
  unknown,
  { userId: string; data: TUpdateUserPlanRequest },
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ userId, data }: { userId: string; data: TUpdateUserPlanRequest }) =>
      dataService.updateAdminUserPlan(userId, data),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries([QueryKeys.name, 'admin', 'user', variables.userId, 'plan']);
        queryClient.invalidateQueries([QueryKeys.name, 'admin', 'user', variables.userId, 'usage']);
      },
    },
  );
};

export const useCreateStripeCheckoutSessionMutation = (
  options?: m.CreateStripeCheckoutSessionOptions,
): UseMutationResult<
  { sessionId: string; url: string },
  unknown,
  { planId: string },
  unknown
> => {
  return useMutation(
    ({ planId }: { planId: string }) => dataService.createStripeCheckoutSession({ planId }),
    options,
  );
};

export const useUpdateUserPlanMutation = (
  options?: m.MutationOptions<{ message: string; user: any }, { planId: string }>,
): UseMutationResult<{ message: string; user: any }, unknown, { planId: string }, unknown> => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ planId }: { planId: string }) => dataService.updateUserPlan({ planId }),
    {
      onSuccess: () => {
        // Invalidate both query key formats to ensure user data refreshes
        queryClient.invalidateQueries([QueryKeys.user]);
        queryClient.invalidateQueries([QueryKeys.name, 'user']);
      },
      ...options,
    },
  );
};

export const useCreateStripeCustomerPortalMutation = (
  options?: m.CreateStripeCustomerPortalOptions,
): UseMutationResult<{ url: string }, unknown, void, unknown> => {
  return useMutation(() => dataService.createStripeCustomerPortalSession(), options);
};

// Admin Settings hooks
export const useGetAdminApiConfigQuery = (
  config?: UseQueryOptions<any>,
): QueryObserverResult<any> => {
  return useQuery<any>(
    [QueryKeys.name, 'admin', 'settings', 'api-config'],
    () => dataService.getAdminApiConfig(),
    {
      refetchOnWindowFocus: false,
      ...config,
    },
  );
};

export const useUpdateAdminApiConfigMutation = (
  options?: m.MutationOptions<{ message: string; service: string; envVar: string; note: string }, { service: string; envVar: string; value: string }>,
): UseMutationResult<{ message: string; service: string; envVar: string; note: string }, unknown, { service: string; envVar: string; value: string }, unknown> => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ service, envVar, value }: { service: string; envVar: string; value: string }) =>
      dataService.updateAdminApiConfig({ service, envVar, value }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryKeys.name, 'admin', 'settings', 'api-config']);
      },
      ...options,
    },
  );
};

export const useGetAdminUserKeysQuery = (
  userId?: string,
  config?: UseQueryOptions<any>,
): QueryObserverResult<any> => {
  return useQuery<any>(
    [QueryKeys.name, 'admin', 'settings', 'user-keys', userId],
    () => dataService.getAdminUserKeys(userId),
    {
      refetchOnWindowFocus: false,
      enabled: true,
      ...config,
    },
  );
};

export const useDeleteAdminUserKeyMutation = (
  options?: m.MutationOptions<{ message: string }, { userId: string; keyName: string }>,
): UseMutationResult<{ message: string }, unknown, { userId: string; keyName: string }, unknown> => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ userId, keyName }: { userId: string; keyName: string }) =>
      dataService.deleteAdminUserKey(userId, keyName),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryKeys.name, 'admin', 'settings', 'user-keys']);
      },
      ...options,
    },
  );
};

export const useGetAdminApiKeysQuery = (
  config?: UseQueryOptions<any[]>,
): QueryObserverResult<any[]> => {
  return useQuery<any[]>(
    [QueryKeys.name, 'admin', 'settings', 'api-keys'],
    () => dataService.getAdminApiKeys(),
    {
      refetchOnWindowFocus: false,
      ...config,
    },
  );
};

export const useUpdateAdminApiKeyMutation = (
  options?: m.MutationOptions<{ message: string; endpointName: string; envVar: string; note: string }, { endpointName: string; apiKey: string }>,
): UseMutationResult<{ message: string; endpointName: string; envVar: string; note: string }, unknown, { endpointName: string; apiKey: string }, unknown> => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ endpointName, apiKey }: { endpointName: string; apiKey: string }) =>
      dataService.updateAdminApiKey({ endpointName, apiKey }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryKeys.name, 'admin', 'settings', 'api-keys']);
        queryClient.invalidateQueries([QueryKeys.name, 'admin', 'settings', 'api-config']);
      },
      ...options,
    },
  );
};

export const useGetAdminGuestAccessQuery = (
  config?: UseQueryOptions<{ enabled: boolean; dailyLimit: number; windowHours: number }>,
): QueryObserverResult<{ enabled: boolean; dailyLimit: number; windowHours: number }> => {
  return useQuery<{ enabled: boolean; dailyLimit: number; windowHours: number }>(
    [QueryKeys.name, 'admin', 'settings', 'guest-access'],
    () => dataService.getAdminGuestAccessConfig(),
    {
      refetchOnWindowFocus: false,
      ...config,
    },
  );
};

export const useUpdateAdminGuestAccessMutation = (
  options?: m.MutationOptions<{ message: string; note: string }, { enabled: boolean; dailyLimit: number; windowHours: number }>,
): UseMutationResult<{ message: string; note: string }, unknown, { enabled: boolean; dailyLimit: number; windowHours: number }, unknown> => {
  const queryClient = useQueryClient();
  return useMutation(
    (payload: { enabled: boolean; dailyLimit: number; windowHours: number }) =>
      dataService.updateAdminGuestAccessConfig(payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryKeys.name, 'admin', 'settings', 'guest-access']);
      },
      ...options,
    },
  );
};

/* ========================= */
/* Zeq Patterns Hooks        */
/* ========================= */

// Get daily patterns (public)
export const useGetDailyZeqPatternsQuery = (
  config?: UseQueryOptions<dataService.TZeqPattern[]>,
): QueryObserverResult<dataService.TZeqPattern[]> => {
  return useQuery<dataService.TZeqPattern[]>(
    [QueryKeys.zeqPatterns, 'daily'],
    () => dataService.getDailyZeqPatterns(),
    {
      staleTime: 1000 * 60 * 60, // Cache for 1 hour (same patterns all day)
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      ...config,
    },
  );
};

// Track pattern click (public)
export const useTrackZeqPatternClickMutation = (): UseMutationResult<
  { success: boolean },
  unknown,
  string,
  unknown
> => {
  return useMutation((patternId: string) => dataService.trackZeqPatternClick(patternId));
};

// Get all patterns (admin)
export const useGetAdminZeqPatternsQuery = (
  config?: UseQueryOptions<dataService.TZeqPattern[]>,
): QueryObserverResult<dataService.TZeqPattern[]> => {
  return useQuery<dataService.TZeqPattern[]>(
    [QueryKeys.zeqPatternsAdmin],
    () => dataService.getAdminZeqPatterns(),
    {
      refetchOnWindowFocus: false,
      ...config,
    },
  );
};

// Create pattern (admin)
export const useCreateAdminZeqPatternMutation = (
  options?: m.MutationOptions<dataService.TZeqPattern, dataService.TCreateZeqPatternRequest>,
): UseMutationResult<
  dataService.TZeqPattern,
  unknown,
  dataService.TCreateZeqPatternRequest,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: dataService.TCreateZeqPatternRequest) => dataService.createAdminZeqPattern(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryKeys.zeqPatternsAdmin]);
        queryClient.invalidateQueries([QueryKeys.zeqPatterns]);
      },
      ...options,
    },
  );
};

// Update pattern (admin)
export const useUpdateAdminZeqPatternMutation = (
  options?: m.MutationOptions<dataService.TZeqPattern, { id: string; data: dataService.TUpdateZeqPatternRequest }>,
): UseMutationResult<
  dataService.TZeqPattern,
  unknown,
  { id: string; data: dataService.TUpdateZeqPatternRequest },
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, data }) => dataService.updateAdminZeqPattern(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryKeys.zeqPatternsAdmin]);
        queryClient.invalidateQueries([QueryKeys.zeqPatterns]);
      },
      ...options,
    },
  );
};

// Delete pattern (admin)
export const useDeleteAdminZeqPatternMutation = (
  options?: m.MutationOptions<{ message: string; pattern: dataService.TZeqPattern }, string>,
): UseMutationResult<
  { message: string; pattern: dataService.TZeqPattern },
  unknown,
  string,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation(
    (id: string) => dataService.deleteAdminZeqPattern(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryKeys.zeqPatternsAdmin]);
        queryClient.invalidateQueries([QueryKeys.zeqPatterns]);
      },
      ...options,
    },
  );
};

/* ========================= */
/* Zeq Pattern Categories    */
/* ========================= */

export const useGetZeqPatternCategoriesQuery = (
  config?: UseQueryOptions<dataService.TZeqPatternCategory[]>,
): QueryObserverResult<dataService.TZeqPatternCategory[]> => {
  return useQuery<dataService.TZeqPatternCategory[]>(
    [QueryKeys.zeqPatternCategories],
    () => dataService.getZeqPatternCategories(),
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      ...config,
    },
  );
};

export const useGetAdminZeqPatternCategoriesQuery = (
  config?: UseQueryOptions<dataService.TZeqPatternCategory[]>,
): QueryObserverResult<dataService.TZeqPatternCategory[]> => {
  return useQuery<dataService.TZeqPatternCategory[]>(
    [QueryKeys.zeqPatternCategoriesAdmin],
    () => dataService.getAdminZeqPatternCategories(),
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      ...config,
    },
  );
};

export const useCreateAdminZeqPatternCategoryMutation = (
  options?: m.MutationOptions<dataService.TZeqPatternCategory, dataService.TCreateZeqPatternCategoryRequest>,
): UseMutationResult<
  dataService.TZeqPatternCategory,
  unknown,
  dataService.TCreateZeqPatternCategoryRequest,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: dataService.TCreateZeqPatternCategoryRequest) => dataService.createAdminZeqPatternCategory(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryKeys.zeqPatternCategoriesAdmin]);
        queryClient.invalidateQueries([QueryKeys.zeqPatternCategories]);
      },
      ...options,
    },
  );
};

export const useUpdateAdminZeqPatternCategoryMutation = (
  options?: m.MutationOptions<dataService.TZeqPatternCategory, { id: string; data: dataService.TUpdateZeqPatternCategoryRequest }>,
): UseMutationResult<
  dataService.TZeqPatternCategory,
  unknown,
  { id: string; data: dataService.TUpdateZeqPatternCategoryRequest },
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, data }) => dataService.updateAdminZeqPatternCategory(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryKeys.zeqPatternCategoriesAdmin]);
        queryClient.invalidateQueries([QueryKeys.zeqPatternCategories]);
      },
      ...options,
    },
  );
};

export const useDeleteAdminZeqPatternCategoryMutation = (
  options?: m.MutationOptions<{ message: string; category: dataService.TZeqPatternCategory }, string>,
): UseMutationResult<
  { message: string; category: dataService.TZeqPatternCategory },
  unknown,
  string,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation(
    (id: string) => dataService.deleteAdminZeqPatternCategory(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryKeys.zeqPatternCategoriesAdmin]);
        queryClient.invalidateQueries([QueryKeys.zeqPatternCategories]);
      },
      ...options,
    },
  );
};
