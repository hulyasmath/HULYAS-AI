import React, { useState } from 'react';
import {
  useGetAdminApiConfigQuery,
  useGetAdminUserKeysQuery,
  useDeleteAdminUserKeyMutation,
  useGetAdminApiKeysQuery,
  useUpdateAdminApiKeyMutation,
  useUpdateAdminApiConfigMutation,
} from 'librechat-data-provider/react-query';
import { useLocalize } from '~/hooks';
import { Button, Spinner, Input, Label } from '@librechat/client';
import { Check, X, Trash2, Search, Key, Server, Users, Edit2, Save } from 'lucide-react';

export default function AdminSettings() {
  const localize = useLocalize();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEndpoint, setEditingEndpoint] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [apiKeyValues, setApiKeyValues] = useState<Record<string, string>>({});

  const { data: userKeysData, isLoading: userKeysLoading, refetch } = useGetAdminUserKeysQuery(
    selectedUserId || undefined,
  );
  const { data: llmApiKeys, isLoading: llmApiKeysLoading, refetch: refetchApiKeys } = useGetAdminApiKeysQuery();
  const deleteKeyMutation = useDeleteAdminUserKeyMutation({
    onSuccess: () => {
      refetch();
    },
  });
  const updateApiKeyMutation = useUpdateAdminApiKeyMutation({
    onSuccess: (data) => {
      setEditingEndpoint(null);
      setApiKeyValues({});
      refetchApiKeys();
      alert(`API key updated successfully! ${data.note}`);
    },
    onError: (error: any) => {
      alert(`Error updating API key: ${error.message || 'Unknown error'}`);
    },
  });
  const { data: apiConfig, isLoading: apiConfigLoading, refetch: refetchApiConfig } = useGetAdminApiConfigQuery();
  const updateApiConfigMutation = useUpdateAdminApiConfigMutation({
    onSuccess: (data) => {
      setEditingService(null);
      setApiKeyValues({});
      refetchApiConfig();
      alert(`API configuration updated successfully! ${data.note}`);
    },
    onError: (error: any) => {
      alert(`Error updating API configuration: ${error.message || 'Unknown error'}`);
    },
  });

  const handleDeleteKey = (userId: string, keyName: string) => {
    if (window.confirm(`Are you sure you want to delete the "${keyName}" key for this user?`)) {
      deleteKeyMutation.mutate({ userId, keyName });
    }
  };

  const filteredUsers = Array.isArray(userKeysData)
    ? userKeysData.filter((user: any) => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
          user.email?.toLowerCase().includes(search) ||
          user.name?.toLowerCase().includes(search) ||
          user.username?.toLowerCase().includes(search)
        );
      })
    : [];

  const renderLLMApiManagement = () => {
    if (llmApiKeysLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <Spinner />
        </div>
      );
    }

    if (!llmApiKeys || !Array.isArray(llmApiKeys) || llmApiKeys.length === 0) {
      return (
        <div className="rounded-lg border border-border-light bg-surface-secondary p-4 text-center">
          <p className="text-text-secondary">No LLM API endpoints configured in librechat.yaml</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {llmApiKeys.map((endpoint: any) => {
          const isEditing = editingEndpoint === endpoint.endpointName;
          const currentValue = apiKeyValues[endpoint.endpointName] || endpoint.apiKey || '';

          return (
            <div
              key={endpoint.id}
              className={`rounded-lg border-2 p-4 transition-all ${
                endpoint.configured
                  ? 'border-green-500 bg-surface-secondary'
                  : 'border-yellow-500 bg-surface-primary'
              }`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <h4 className="text-lg font-semibold">{endpoint.llmName}</h4>
                    {endpoint.configured ? (
                      <span className="rounded-full bg-green-500 px-2 py-0.5 text-xs font-semibold text-white">
                        Configured
                      </span>
                    ) : (
                      <span className="rounded-full bg-yellow-500 px-2 py-0.5 text-xs font-semibold text-white">
                        Not Configured
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-text-secondary">
                    <div>
                      <strong>Endpoint ID:</strong> <code className="rounded bg-surface-tertiary px-1">{endpoint.endpointName}</code>
                    </div>
                    <div>
                      <strong>Base URL:</strong> <code className="rounded bg-surface-tertiary px-1">{endpoint.baseURL}</code>
                    </div>
                    <div>
                      <strong>Environment Variable:</strong> <code className="rounded bg-surface-tertiary px-1">{endpoint.envVar}</code>
                    </div>
                    {endpoint.models && endpoint.models.length > 0 && (
                      <div>
                        <strong>Available Models:</strong> {endpoint.models.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  {endpoint.configured ? (
                    <Check className="h-6 w-6 text-green-500" />
                  ) : (
                    <X className="h-6 w-6 text-yellow-500" />
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-3 rounded-lg border border-border-light bg-surface-tertiary p-3">
                  <div>
                    <Label htmlFor={`api-key-${endpoint.endpointName}`}>
                      API Key for {endpoint.llmName}
                    </Label>
                    <Input
                      id={`api-key-${endpoint.endpointName}`}
                      type="password"
                      value={currentValue}
                      onChange={(e) =>
                        setApiKeyValues({ ...apiKeyValues, [endpoint.endpointName]: e.target.value })
                      }
                      placeholder="Enter your API key..."
                      className="mt-1 font-mono"
                    />
                    {endpoint.maskedKey && (
                      <p className="mt-1 text-xs text-text-secondary">
                        Current: <code className="rounded bg-surface-primary px-1">{endpoint.maskedKey}</code>
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        if (!currentValue.trim()) {
                          alert('Please enter an API key');
                          return;
                        }
                        updateApiKeyMutation.mutate({
                          endpointName: endpoint.endpointName,
                          apiKey: currentValue.trim(),
                        });
                      }}
                      disabled={updateApiKeyMutation.isLoading || !currentValue.trim()}
                      className="flex-1"
                    >
                      {updateApiKeyMutation.isLoading ? (
                        <>
                          <Spinner className="mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save API Key
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingEndpoint(null);
                        setApiKeyValues({ ...apiKeyValues, [endpoint.endpointName]: endpoint.apiKey || '' });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {endpoint.configured && endpoint.maskedKey && (
                    <div className="rounded-lg border border-border-light bg-surface-tertiary p-2">
                      <div className="text-xs text-text-secondary">Current API Key:</div>
                      <code className="mt-1 block font-mono text-sm">{endpoint.maskedKey}</code>
                    </div>
                  )}
                  <Button
                    variant={endpoint.configured ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => {
                      setEditingEndpoint(endpoint.endpointName);
                      setApiKeyValues({ ...apiKeyValues, [endpoint.endpointName]: endpoint.apiKey || '' });
                    }}
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    {endpoint.configured ? 'Edit API Key' : 'Add API Key'}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const handleUpdateSystemApi = (serviceKey: string, envVar: string, value: string) => {
    if (!value?.trim()) {
      alert('Please enter a value');
      return;
    }
    updateApiConfigMutation.mutate({
      service: serviceKey,
      envVar,
      value: value.trim(),
    });
  };

  const renderApiConfig = () => {
    if (apiConfigLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <Spinner />
        </div>
      );
    }

    // Always render services, even if apiConfig is not loaded yet
    // We'll provide default configs for each service

    const apiServices = [
      { name: 'OpenAI', key: 'openai', icon: '🤖', description: 'OpenAI GPT models' },
      { name: 'Azure OpenAI', key: 'azureOpenAI', icon: '☁️', description: 'Azure-hosted OpenAI' },
      { name: 'Anthropic', key: 'anthropic', icon: '🧠', description: 'Claude models' },
      { name: 'Google', key: 'google', icon: '🔍', description: 'Google Gemini models' },
      { name: 'DeepSeek', key: 'deepseek', icon: '⚡', description: 'DeepSeek AI models' },
      { name: 'Groq', key: 'groq', icon: '🚀', description: 'Groq fast inference' },
      { name: 'OpenRouter', key: 'openrouter', icon: '🌐', description: 'OpenRouter gateway' },
    ];

    const infrastructureServices = [
      { name: 'SearXNG', key: 'searxng', icon: '🔎', description: 'Web search engine' },
      { name: 'Meilisearch', key: 'meilisearch', icon: '📊', description: 'Search index' },
      { name: 'RAG API', key: 'rag', icon: '📚', description: 'Retrieval Augmented Generation' },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Server className="h-5 w-5" />
            AI Provider APIs
          </h4>
          <div className="grid gap-4 md:grid-cols-2">
            {apiServices.map((service) => {
              const config = apiConfig?.[service.key] || {
                configured: false,
                masked: null,
                apiKey: null,
                envVar: service.key === 'openai' ? 'OPENAI_API_KEY' :
                        service.key === 'azureOpenAI' ? 'AZURE_API_KEY' :
                        service.key === 'anthropic' ? 'ANTHROPIC_API_KEY' :
                        service.key === 'google' ? 'GOOGLE_KEY' :
                        service.key === 'deepseek' ? 'DEEPSEEK_API_KEY' :
                        service.key === 'groq' ? 'GROQ_API_KEY' :
                        service.key === 'openrouter' ? 'OPENROUTER_KEY' : '',
                reverseProxy: null,
                reverseProxyEnvVar: service.key === 'openai' ? 'OPENAI_REVERSE_PROXY' :
                                    service.key === 'google' ? 'GOOGLE_REVERSE_PROXY' : null,
                baseURL: null,
                baseURLEnvVar: service.key === 'azureOpenAI' ? 'AZURE_OPENAI_BASEURL' : null,
              };

              return (
                <div
                  key={service.key}
                  className={`rounded-lg border p-4 ${
                    config.configured
                      ? 'border-green-500 bg-surface-secondary'
                      : 'border-border-light bg-surface-primary'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{service.icon}</span>
                      <span className="font-semibold">{service.name}</span>
                    </div>
                    {config.configured ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  {editingService === service.key ? (
                    <div className="mt-3 space-y-3">
                      <div>
                        <Label>API Key for {service.name}</Label>
                        <Input
                          type="password"
                          value={apiKeyValues[`${service.key}_apiKey`] || config.apiKey || ''}
                          onChange={(e) =>
                            setApiKeyValues({ ...apiKeyValues, [`${service.key}_apiKey`]: e.target.value })
                          }
                          placeholder="Enter API key..."
                          className="mt-1 font-mono"
                        />
                        {config.masked && (
                          <p className="mt-1 text-xs text-text-secondary">
                            Current: <code className="rounded bg-surface-primary px-1">{config.masked}</code>
                          </p>
                        )}
                        <p className="mt-1 text-xs text-text-secondary">
                          Env Var: <code>{config.envVar}</code>
                        </p>
                      </div>
                      {config.reverseProxyEnvVar && (
                        <div>
                          <Label>Reverse Proxy URL (Optional)</Label>
                          <Input
                            value={apiKeyValues[`${service.key}_reverseProxy`] || config.reverseProxy || ''}
                            onChange={(e) =>
                              setApiKeyValues({ ...apiKeyValues, [`${service.key}_reverseProxy`]: e.target.value })
                            }
                            placeholder="Enter reverse proxy URL..."
                            className="mt-1"
                          />
                        </div>
                      )}
                      {config.baseURLEnvVar && (
                        <div>
                          <Label>Base URL (Optional)</Label>
                          <Input
                            value={apiKeyValues[`${service.key}_baseURL`] || config.baseURL || ''}
                            onChange={(e) =>
                              setApiKeyValues({ ...apiKeyValues, [`${service.key}_baseURL`]: e.target.value })
                            }
                            placeholder="Enter base URL..."
                            className="mt-1"
                          />
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            const apiKey = apiKeyValues[`${service.key}_apiKey`];
                            if (!apiKey?.trim()) {
                              alert('Please enter an API key');
                              return;
                            }
                            handleUpdateSystemApi(service.key, config.envVar, apiKey.trim());
                            if (config.reverseProxyEnvVar && apiKeyValues[`${service.key}_reverseProxy`]) {
                              handleUpdateSystemApi(service.key, config.reverseProxyEnvVar, apiKeyValues[`${service.key}_reverseProxy`].trim());
                            }
                            if (config.baseURLEnvVar && apiKeyValues[`${service.key}_baseURL`]) {
                              handleUpdateSystemApi(service.key, config.baseURLEnvVar, apiKeyValues[`${service.key}_baseURL`].trim());
                            }
                          }}
                          disabled={updateApiConfigMutation.isLoading}
                          className="flex-1"
                        >
                          {updateApiConfigMutation.isLoading ? (
                            <>
                              <Spinner className="mr-2" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingService(null);
                            setApiKeyValues({});
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {config.configured && (
                        <div className="mt-2 space-y-1 text-sm">
                          {config.masked && (
                            <div>
                              <span className="text-text-secondary">Key: </span>
                              <code className="rounded bg-surface-tertiary px-1.5 py-0.5 text-xs font-mono">
                                {config.masked}
                              </code>
                            </div>
                          )}
                          {config.userProvided && (
                            <div className="text-xs text-yellow-500">User-provided keys enabled</div>
                          )}
                          {config.reverseProxy && (
                            <div>
                              <span className="text-text-secondary">Proxy: </span>
                              <code className="text-xs">{config.reverseProxy}</code>
                            </div>
                          )}
                          {config.baseURL && (
                            <div>
                              <span className="text-text-secondary">Base URL: </span>
                              <code className="text-xs">{config.baseURL}</code>
                            </div>
                          )}
                        </div>
                      )}
                      <Button
                        variant={config.configured ? 'default' : 'outline'}
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => {
                          setEditingService(service.key);
                          setApiKeyValues({
                            ...apiKeyValues,
                            [`${service.key}_apiKey`]: config.apiKey || '',
                            [`${service.key}_reverseProxy`]: config.reverseProxy || '',
                            [`${service.key}_baseURL`]: config.baseURL || '',
                          });
                        }}
                      >
                        <Edit2 className="mr-2 h-4 w-4" />
                        {config.configured ? 'Edit API Key' : 'Add API Key'}
                      </Button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Server className="h-5 w-5" />
            Infrastructure Services
          </h4>
          <div className="grid gap-4 md:grid-cols-2">
            {infrastructureServices.map((service) => {
              const config = apiConfig?.[service.key] || {
                configured: false,
                url: null,
                urlEnvVar: service.key === 'searxng' ? 'SEARXNG_INSTANCE_URL' :
                          service.key === 'rag' ? 'RAG_API_URL' : null,
                host: null,
                hostEnvVar: service.key === 'meilisearch' ? 'MEILI_HOST' : null,
                apiKey: null,
                apiKeyValue: null,
                apiKeyEnvVar: service.key === 'searxng' ? 'SEARXNG_API_KEY' : null,
                masterKey: null,
                masterKeyValue: null,
                masterKeyEnvVar: service.key === 'meilisearch' ? 'MEILI_MASTER_KEY' : null,
              };

              return (
                <div
                  key={service.key}
                  className={`rounded-lg border p-4 ${
                    config.configured
                      ? 'border-green-500 bg-surface-secondary'
                      : 'border-border-light bg-surface-primary'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{service.icon}</span>
                      <span className="font-semibold">{service.name}</span>
                    </div>
                    {config.configured ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  {editingService === service.key ? (
                    <div className="mt-3 space-y-3">
                      {service.key === 'searxng' && (
                        <>
                          <div>
                            <Label>Instance URL</Label>
                            <Input
                              value={apiKeyValues[`${service.key}_url`] || config.url || ''}
                              onChange={(e) =>
                                setApiKeyValues({ ...apiKeyValues, [`${service.key}_url`]: e.target.value })
                              }
                              placeholder="http://searxng:8080"
                              className="mt-1"
                            />
                            <p className="mt-1 text-xs text-text-secondary">
                              Env Var: <code>{config.urlEnvVar}</code>
                            </p>
                          </div>
                          {config.apiKeyEnvVar && (
                            <div>
                              <Label>API Key (Optional)</Label>
                              <Input
                                type="password"
                                value={apiKeyValues[`${service.key}_apiKey`] || config.apiKeyValue || ''}
                                onChange={(e) =>
                                  setApiKeyValues({ ...apiKeyValues, [`${service.key}_apiKey`]: e.target.value })
                                }
                                placeholder="Enter API key..."
                                className="mt-1 font-mono"
                              />
                              {config.apiKey && (
                                <p className="mt-1 text-xs text-text-secondary">
                                  Current: <code className="rounded bg-surface-primary px-1">{config.apiKey}</code>
                                </p>
                              )}
                              <p className="mt-1 text-xs text-text-secondary">
                                Env Var: <code>{config.apiKeyEnvVar}</code>
                              </p>
                            </div>
                          )}
                        </>
                      )}
                      {service.key === 'meilisearch' && (
                        <>
                          <div>
                            <Label>Host URL</Label>
                            <Input
                              value={apiKeyValues[`${service.key}_host`] || config.host || ''}
                              onChange={(e) =>
                                setApiKeyValues({ ...apiKeyValues, [`${service.key}_host`]: e.target.value })
                              }
                              placeholder="http://meilisearch:7700"
                              className="mt-1"
                            />
                            <p className="mt-1 text-xs text-text-secondary">
                              Env Var: <code>{config.hostEnvVar}</code>
                            </p>
                          </div>
                          {config.masterKeyEnvVar && (
                            <div>
                              <Label>Master Key</Label>
                              <Input
                                type="password"
                                value={apiKeyValues[`${service.key}_masterKey`] || config.masterKeyValue || ''}
                                onChange={(e) =>
                                  setApiKeyValues({ ...apiKeyValues, [`${service.key}_masterKey`]: e.target.value })
                                }
                                placeholder="Enter master key..."
                                className="mt-1 font-mono"
                              />
                              {config.masterKey && (
                                <p className="mt-1 text-xs text-text-secondary">
                                  Current: <code className="rounded bg-surface-primary px-1">{config.masterKey}</code>
                                </p>
                              )}
                              <p className="mt-1 text-xs text-text-secondary">
                                Env Var: <code>{config.masterKeyEnvVar}</code>
                              </p>
                            </div>
                          )}
                        </>
                      )}
                      {service.key === 'rag' && (
                        <div>
                          <Label>RAG API URL</Label>
                          <Input
                            value={apiKeyValues[`${service.key}_url`] || config.url || ''}
                            onChange={(e) =>
                              setApiKeyValues({ ...apiKeyValues, [`${service.key}_url`]: e.target.value })
                            }
                            placeholder="http://rag_api:8000"
                            className="mt-1"
                          />
                          <p className="mt-1 text-xs text-text-secondary">
                            Env Var: <code>{config.urlEnvVar}</code>
                          </p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            if (service.key === 'searxng') {
                              if (apiKeyValues[`${service.key}_url`]) {
                                handleUpdateSystemApi(service.key, config.urlEnvVar, apiKeyValues[`${service.key}_url`]);
                              }
                              if (config.apiKeyEnvVar && apiKeyValues[`${service.key}_apiKey`]) {
                                handleUpdateSystemApi(service.key, config.apiKeyEnvVar, apiKeyValues[`${service.key}_apiKey`]);
                              }
                            } else if (service.key === 'meilisearch') {
                              if (apiKeyValues[`${service.key}_host`]) {
                                handleUpdateSystemApi(service.key, config.hostEnvVar, apiKeyValues[`${service.key}_host`]);
                              }
                              if (config.masterKeyEnvVar && apiKeyValues[`${service.key}_masterKey`]) {
                                handleUpdateSystemApi(service.key, config.masterKeyEnvVar, apiKeyValues[`${service.key}_masterKey`]);
                              }
                            } else if (service.key === 'rag') {
                              if (apiKeyValues[`${service.key}_url`]) {
                                handleUpdateSystemApi(service.key, config.urlEnvVar, apiKeyValues[`${service.key}_url`]);
                              }
                            }
                          }}
                          disabled={updateApiConfigMutation.isLoading}
                          className="flex-1"
                        >
                          {updateApiConfigMutation.isLoading ? (
                            <>
                              <Spinner className="mr-2" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingService(null);
                            setApiKeyValues({});
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {config.configured && (
                        <div className="mt-2 space-y-1 text-sm">
                          {config.url && (
                            <div>
                              <span className="text-text-secondary">URL: </span>
                              <code className="text-xs">{config.url}</code>
                            </div>
                          )}
                          {config.host && (
                            <div>
                              <span className="text-text-secondary">Host: </span>
                              <code className="text-xs">{config.host}</code>
                            </div>
                          )}
                          {config.apiKey && (
                            <div>
                              <span className="text-text-secondary">Key: </span>
                              <code className="rounded bg-surface-tertiary px-1.5 py-0.5 text-xs font-mono">
                                {config.apiKey}
                              </code>
                            </div>
                          )}
                          {config.masterKey && (
                            <div>
                              <span className="text-text-secondary">Master Key: </span>
                              <code className="rounded bg-surface-tertiary px-1.5 py-0.5 text-xs font-mono">
                                {config.masterKey}
                              </code>
                            </div>
                          )}
                        </div>
                      )}
                      <Button
                        variant={config.configured ? 'default' : 'outline'}
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => {
                          setEditingService(service.key);
                          setApiKeyValues({
                            ...apiKeyValues,
                            [`${service.key}_url`]: config.url || '',
                            [`${service.key}_host`]: config.host || '',
                            [`${service.key}_apiKey`]: config.apiKeyValue || '',
                            [`${service.key}_masterKey`]: config.masterKeyValue || '',
                          });
                        }}
                      >
                        <Edit2 className="mr-2 h-4 w-4" />
                        {config.configured ? 'Edit Configuration' : 'Add Configuration'}
                      </Button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderUserKeys = () => {
    if (userKeysLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <Spinner />
        </div>
      );
    }

    if (selectedUserId && userKeysData && !Array.isArray(userKeysData)) {
      // Show specific user's keys
      const { user, keys } = userKeysData;
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">{user.name || user.email}</h4>
              <p className="text-sm text-text-secondary">{user.email}</p>
            </div>
            <Button variant="outline" onClick={() => setSelectedUserId(null)}>
              Back to All Users
            </Button>
          </div>
          <div className="space-y-2">
            {keys && keys.length > 0 ? (
              keys.map((key: any) => (
                <div
                  key={key.name}
                  className="flex items-center justify-between rounded-lg border border-border-light bg-surface-secondary p-3"
                >
                  <div>
                    <div className="font-medium">{key.name}</div>
                    {key.expiresAt && (
                      <div className="text-xs text-text-secondary">
                        Expires: {new Date(key.expiresAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteKey(user._id, key.name)}
                    disabled={deleteKeyMutation.isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-text-secondary">No API keys found for this user</p>
            )}
          </div>
        </div>
      );
    }

    // Show all users
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-text-secondary" />
          <Input
            placeholder="Search users by email, name, or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
        <div className="space-y-2">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user: any) => (
              <div
                key={user._id}
                className="flex items-center justify-between rounded-lg border border-border-light bg-surface-secondary p-3 hover:bg-surface-tertiary"
              >
                <div className="flex-1">
                  <div className="font-medium">{user.name || user.email}</div>
                  <div className="text-sm text-text-secondary">{user.email}</div>
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <Key className="h-3 w-3" />
                    <span>{user.keyCount || 0} API key(s)</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUserId(user._id)}
                >
                  View Keys
                </Button>
              </div>
            ))
          ) : (
            <p className="text-text-secondary">No users found</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-1 text-sm text-text-primary">
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Key className="h-5 w-5" />
          LLM API Key Management
        </h3>
        <p className="mb-4 text-sm text-text-secondary">
          Manage API keys for LLM providers (DeepSeek, OpenRouter, etc.). Changes require API server restart.
        </p>
        {renderLLMApiManagement()}
      </div>

      <div className="border-t border-border-light pt-6">
        <h3 className="mb-4 text-lg font-semibold">System API Configuration</h3>
        <p className="mb-4 text-sm text-text-secondary">
          Manage system-wide API configurations. Click "Edit" on any service to update API keys and settings. Changes require API server restart.
        </p>
        {renderApiConfig()}
      </div>

      <div className="border-t border-border-light pt-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Users className="h-5 w-5" />
          User API Key Management
        </h3>
        <p className="mb-4 text-sm text-text-secondary">
          View and manage API keys for all users. Click on a user to see their keys.
        </p>
        {renderUserKeys()}
      </div>
    </div>
  );
}

