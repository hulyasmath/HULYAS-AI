import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mcpApiKeyEndpoints, request } from 'librechat-data-provider';
import type { IMCPApiKey } from 'librechat-data-schemas';

export interface MCPApiKeyResponse {
  apiKey?: string;
  prefix?: string;
  createdAt?: string;
  lastUsedAt?: string | null;
  message?: string;
}

export const useGenerateMCPApiKeyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<MCPApiKeyResponse, Error, void>({
    mutationFn: async () => {
      const response = await request.post<MCPApiKeyResponse>(mcpApiKeyEndpoints.generate());
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mcpApiKey']);
    },
  });
};

export const useGetMCPApiKeyQuery = (userId: string, options?: { enabled?: boolean }) => {
  return useQuery<MCPApiKeyResponse | null>({
    queryKey: ['mcpApiKey', userId],
    queryFn: async () => {
      const response = await request.get<MCPApiKeyResponse>(mcpApiKeyEndpoints.get());
      return response.data;
    },
    enabled: options?.enabled !== false && !!userId,
    ...options,
  });
};

export const useRevokeMCPApiKeyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, void>({
    mutationFn: async () => {
      const response = await request.delete<{ message: string }>(mcpApiKeyEndpoints.revoke());
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mcpApiKey']);
    },
  });
};


