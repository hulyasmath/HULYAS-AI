import { useMutation, useQuery } from '@tanstack/react-query';
import { request } from 'librechat-data-provider';

/**
 * Hook to export transparency transcript for a conversation
 */
export function useExportTransparency(conversationId: string | null) {
  return useMutation({
    mutationFn: async () => {
      if (!conversationId) {
        throw new Error('Conversation ID is required');
      }
      try {
        console.log('📥 Exporting transparency for conversation:', conversationId);
        // request.get() returns response.data directly
        const response = await request.get(`/api/transparency/${conversationId}/export`);
        console.log('📥 Export response:', response);
        
        // Check if we got HTML instead of JSON (routing issue)
        if (typeof response === 'string' && response.includes('<!DOCTYPE html>')) {
          console.error('❌ Got HTML instead of JSON - API route not found');
          throw new Error('API endpoint not found. The request may be hitting the frontend instead of the backend. Please check that the API server is running and the route is registered.');
        }
        
        // Response should be: { success: true, transcript: {...} }
        return response;
      } catch (error: any) {
        console.error('❌ Export error:', error);
        console.error('❌ Error response:', error?.response);
        // Handle 404 or other errors
        if (error?.response?.status === 404) {
          throw new Error('No transparency logs found for this conversation');
        }
        // Check if we got HTML instead of JSON (routing issue)
        if (error?.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE html>')) {
          throw new Error('API endpoint not found. The request may be hitting the frontend instead of the backend.');
        }
        throw error;
      }
    },
  });
}

/**
 * Hook to get transparency logs for a conversation
 */
export function useGetTransparencyLogs(conversationId: string | null) {
  return useQuery({
    queryKey: ['transparency', conversationId],
    queryFn: async () => {
      if (!conversationId) {
        return null;
      }
      const response = await request.get(`/api/transparency/${conversationId}`);
      return response.data;
    },
    enabled: !!conversationId,
  });
}

/**
 * Hook to delete transparency logs for a conversation
 */
export function useDeleteTransparencyLogs(conversationId: string | null) {
  return useMutation({
    mutationFn: async () => {
      if (!conversationId) {
        throw new Error('Conversation ID is required');
      }
      const response = await request.delete(`/api/transparency/${conversationId}`);
      return response.data;
    },
  });
}

