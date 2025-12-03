import React, { useState } from 'react';
import { useLocalize } from '~/hooks';
import { useGetAdminApiConfigQuery, useUpdateAdminApiConfigMutation } from 'librechat-data-provider/react-query';
import { Check, X, ExternalLink, Key, Webhook, Edit2, Save } from 'lucide-react';
import { Button, Spinner, Input, Label } from '@librechat/client';

export default function StripeSettings() {
  const localize = useLocalize();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [keyValues, setKeyValues] = useState<Record<string, string>>({});
  const { data: apiConfig, isLoading, refetch } = useGetAdminApiConfigQuery();
  const updateApiConfigMutation = useUpdateAdminApiConfigMutation({
    onSuccess: (data) => {
      setEditingKey(null);
      setKeyValues({});
      refetch();
      alert(`Stripe configuration updated successfully! ${data.note}`);
    },
    onError: (error: any) => {
      alert(`Error updating Stripe configuration: ${error.message || 'Unknown error'}`);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner />
      </div>
    );
  }

  const stripeConfig = apiConfig?.stripe || {};
  const stripeConfigured = stripeConfig.configured || false;
  const webhookSecretConfigured = !!stripeConfig.webhookSecret;
  const publishableKeyConfigured = !!stripeConfig.publishableKey;

  const handleUpdateStripeKey = (envVar: string, value: string) => {
    if (!value?.trim()) {
      alert('Please enter a value');
      return;
    }
    updateApiConfigMutation.mutate({
      service: 'stripe',
      envVar,
      value: value.trim(),
    });
  };

  const stripeKeys = [
    {
      name: 'Stripe Secret Key',
      key: 'secretKey',
      envVar: stripeConfig.secretKeyEnvVar || 'STRIPE_SECRET_KEY',
      configured: stripeConfigured,
      value: stripeConfig.secretKey,
      required: true,
      description: 'Your Stripe secret key (required for payment processing)',
    },
    {
      name: 'Stripe Publishable Key',
      key: 'publishableKey',
      envVar: stripeConfig.publishableKeyEnvVar || 'STRIPE_PUBLISHABLE_KEY',
      configured: publishableKeyConfigured,
      value: stripeConfig.publishableKey,
      required: false,
      description: 'Publishable key for frontend Stripe.js integration (optional)',
    },
    {
      name: 'Webhook Secret',
      key: 'webhookSecret',
      envVar: stripeConfig.webhookSecretEnvVar || 'STRIPE_WEBHOOK_SECRET',
      configured: webhookSecretConfigured,
      value: stripeConfig.webhookSecret,
      required: true,
      description: 'Webhook signing secret for verifying Stripe webhook events (required)',
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-1 text-sm text-text-primary">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Stripe Payment Configuration</h3>
        <p className="mb-4 text-sm text-text-secondary">
          Manage your Stripe payment integration API keys. Changes require API server restart.
        </p>
      </div>

      <div className="space-y-4">
        {stripeKeys.map((stripeKey) => {
          const isEditing = editingKey === stripeKey.key;
          const currentValue = keyValues[stripeKey.key] || '';

          return (
            <div
              key={stripeKey.key}
              className={`rounded-lg border-2 p-4 ${
                stripeKey.configured
                  ? 'border-green-500 bg-surface-secondary'
                  : stripeKey.required
                  ? 'border-red-500 bg-surface-primary'
                  : 'border-yellow-500 bg-surface-primary'
              }`}
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    {stripeKey.key === 'webhookSecret' ? (
                      <Webhook className="h-5 w-5" />
                    ) : (
                      <Key className="h-5 w-5" />
                    )}
                    <span className="font-semibold">{stripeKey.name}</span>
                    {stripeKey.configured ? (
                      <span className="rounded-full bg-green-500 px-2 py-0.5 text-xs font-semibold text-white">
                        Configured
                      </span>
                    ) : stripeKey.required ? (
                      <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                        Required
                      </span>
                    ) : (
                      <span className="rounded-full bg-yellow-500 px-2 py-0.5 text-xs font-semibold text-white">
                        Optional
                      </span>
                    )}
                  </div>
                  <p className="mb-2 text-xs text-text-secondary">{stripeKey.description}</p>
                  <div className="text-xs">
                    <span className="text-text-secondary">Environment Variable: </span>
                    <code className="rounded bg-surface-tertiary px-1.5 py-0.5">{stripeKey.envVar}</code>
                  </div>
                </div>
                <div className="ml-4">
                  {stripeKey.configured ? (
                    <Check className="h-6 w-6 text-green-500" />
                  ) : (
                    <X className="h-6 w-6 text-red-500" />
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="mt-3 space-y-3 rounded-lg border border-border-light bg-surface-tertiary p-3">
                  <div>
                    <Label>{stripeKey.name}</Label>
                    <Input
                      type="password"
                      value={currentValue}
                      onChange={(e) => setKeyValues({ ...keyValues, [stripeKey.key]: e.target.value })}
                      placeholder={`Enter ${stripeKey.name.toLowerCase()}...`}
                      className="mt-1 font-mono"
                    />
                    {stripeKey.value && (
                      <p className="mt-1 text-xs text-text-secondary">
                        Current: <code className="rounded bg-surface-primary px-1">{stripeKey.value}</code>
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleUpdateStripeKey(stripeKey.envVar, currentValue)}
                      disabled={updateApiConfigMutation.isLoading || !currentValue.trim()}
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
                        setEditingKey(null);
                        setKeyValues({});
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {stripeKey.configured && stripeKey.value && (
                    <div className="rounded-lg border border-border-light bg-surface-tertiary p-2">
                      <div className="text-xs text-text-secondary">Current Value:</div>
                      <code className="mt-1 block font-mono text-sm">{stripeKey.value}</code>
                    </div>
                  )}
                  <Button
                    variant={stripeKey.configured ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => {
                      setEditingKey(stripeKey.key);
                      setKeyValues({ ...keyValues, [stripeKey.key]: '' });
                    }}
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    {stripeKey.configured ? 'Edit Key' : 'Add Key'}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-border-light bg-surface-secondary p-4">
        <h4 className="mb-2 font-semibold">Webhook Configuration</h4>
        <p className="mb-3 text-sm text-text-secondary">
          Configure your Stripe webhook endpoint to receive payment events:
        </p>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Webhook URL:</strong>{' '}
            <code className="rounded bg-surface-tertiary px-1.5 py-0.5">
              {stripeConfig.webhookUrl || 'http://localhost:3080/api/stripe/webhook'}
            </code>
          </div>
          <div>
            <strong>Events to listen for:</strong>
            <ul className="ml-4 mt-1 list-disc space-y-1">
              <li>checkout.session.completed</li>
              <li>customer.subscription.created</li>
              <li>customer.subscription.updated</li>
              <li>customer.subscription.deleted</li>
              <li>invoice.payment_succeeded</li>
              <li>invoice.payment_failed</li>
            </ul>
          </div>
        </div>
        <Button
          variant="outline"
          className="mt-3"
          onClick={() => window.open('https://dashboard.stripe.com/webhooks', '_blank')}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Open Stripe Dashboard
        </Button>
      </div>

      <div className="rounded-lg border border-border-light bg-surface-secondary p-4">
        <h4 className="mb-2 font-semibold">Documentation</h4>
        <p className="mb-3 text-sm text-text-secondary">
          For detailed setup instructions, see the STRIPE_SETUP.md file in your project root.
        </p>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Environment Variables:</strong>
            <ul className="ml-4 mt-1 list-disc space-y-1">
              <li>
                <code>STRIPE_SECRET_KEY</code> - Your Stripe secret key (required)
              </li>
              <li>
                <code>STRIPE_WEBHOOK_SECRET</code> - Webhook signing secret (required)
              </li>
              <li>
                <code>STRIPE_PUBLISHABLE_KEY</code> - Publishable key (optional, for frontend)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

