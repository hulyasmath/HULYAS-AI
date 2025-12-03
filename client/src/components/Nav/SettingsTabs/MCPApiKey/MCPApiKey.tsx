import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Key, Copy, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useToastContext } from '@librechat/client';
import { useLocalize } from '~/hooks';
import store from '~/store';
import { cn } from '~/utils';
import {
  useGenerateMCPApiKeyMutation,
  useGetMCPApiKeyQuery,
  useRevokeMCPApiKeyMutation,
} from '~/data-provider/MCPApiKey';

export default function MCPApiKey() {
  const localize = useLocalize();
  const { showToast } = useToastContext();
  const user = useRecoilValue(store.user);

  const { data: apiKeyData, isLoading, refetch } = useGetMCPApiKeyQuery(user?.id ?? '', {
    enabled: !!user?.id,
  });

  const generateMutation = useGenerateMCPApiKeyMutation();
  const revokeMutation = useRevokeMCPApiKeyMutation();

  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    try {
      const response = await generateMutation.mutateAsync();
      setNewlyGeneratedKey(response.apiKey || null);
      showToast({
        message: localize('com_ui_mcp_apikey_generated'),
        status: 'success',
      });
      refetch();
    } catch (error: any) {
      showToast({
        message: error?.response?.data?.message || localize('com_ui_mcp_apikey_generate_error'),
        status: 'error',
      });
    }
  };

  const handleRevoke = async () => {
    try {
      await revokeMutation.mutateAsync();
      setNewlyGeneratedKey(null);
      showToast({
        message: localize('com_ui_mcp_apikey_revoked'),
        status: 'success',
      });
      refetch();
    } catch (error: any) {
      showToast({
        message: error?.response?.data?.message || localize('com_ui_mcp_apikey_revoke_error'),
        status: 'error',
      });
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast({
        message: localize('com_ui_copied_to_clipboard'),
        status: 'success',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showToast({
        message: localize('com_ui_copy_failed'),
        status: 'error',
      });
    }
  };

  const displayKey = newlyGeneratedKey || apiKeyData?.apiKey;
  const maskedKey = apiKeyData?.prefix ? `${apiKeyData.prefix}••••••••••••` : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Key className="icon-md text-text-primary" />
        <h3 className="text-lg font-semibold text-text-primary">
          {localize('com_nav_setting_mcp_api_key')}
        </h3>
      </div>

      <div className="rounded-lg border border-border-medium bg-surface-secondary p-4">
        <p className="mb-4 text-sm text-text-secondary">
          {localize('com_ui_mcp_apikey_description')}
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-text-secondary" />
          </div>
        ) : displayKey ? (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">
                {localize('com_ui_your_api_key')}{' '}
                {newlyGeneratedKey && `(${localize('com_ui_copy_now_warning')})`}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={displayKey}
                  className="flex-1 rounded-md border border-border-medium bg-surface-primary px-3 py-2 font-mono text-sm text-text-primary"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(displayKey)}
                  className={cn(
                    'flex items-center gap-2 rounded-md border border-border-medium bg-surface-primary px-4 py-2 text-sm transition-colors',
                    copied
                      ? 'border-green-500 text-green-600 dark:text-green-400'
                      : 'hover:bg-surface-hover text-text-secondary',
                  )}
                >
                  {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? localize('com_ui_copied') : localize('com_ui_copy')}
                </button>
              </div>
            </div>

            {apiKeyData && (
              <div className="text-xs text-text-tertiary">
                <p>
                  {localize('com_ui_created')}:{' '}
                  {new Date(apiKeyData.createdAt || '').toLocaleDateString()}
                </p>
                {apiKeyData.lastUsedAt && (
                  <p>
                    {localize('com_ui_last_used')}:{' '}
                    {new Date(apiKeyData.lastUsedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600 disabled:opacity-50"
              >
                {generateMutation.isPending
                  ? localize('com_ui_generating')
                  : localize('com_ui_regenerate_key')}
              </button>
              <button
                type="button"
                onClick={handleRevoke}
                disabled={revokeMutation.isPending}
                className="rounded-md border border-red-500 bg-surface-primary px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50"
              >
                {revokeMutation.isPending
                  ? localize('com_ui_revoking')
                  : localize('com_ui_revoke_key')}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-2 rounded-md border border-yellow-500/50 bg-yellow-500/10 p-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div className="flex-1 text-sm text-text-secondary">
                <p className="font-medium text-text-primary">
                  {localize('com_ui_no_api_key_generated')}
                </p>
                <p className="mt-1">{localize('com_ui_generate_api_key_prompt')}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600 disabled:opacity-50"
            >
              {generateMutation.isPending
                ? localize('com_ui_generating')
                : localize('com_ui_generate_api_key')}
            </button>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border-light bg-surface-secondary p-4">
        <h4 className="mb-2 text-sm font-medium text-text-primary">
          {localize('com_ui_how_to_use')}
        </h4>
        <ol className="list-decimal list-inside space-y-1 text-sm text-text-secondary">
          <li>{localize('com_ui_copy_api_key_above')}</li>
          <li>{localize('com_ui_configure_mcp_client', { url: 'http://localhost:4005/mcp' })}</li>
          <li>{localize('com_ui_add_api_key_header', { header: 'X-API-Key' })}</li>
          <li>
            {localize('com_ui_use_mcp_tools', {
              tools: 'zeq.list_operators, zeq.get_operator, zeq.process_query',
            })}
          </li>
        </ol>
      </div>
    </div>
  );
}



