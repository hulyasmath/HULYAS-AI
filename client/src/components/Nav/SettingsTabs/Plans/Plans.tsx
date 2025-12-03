import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { SystemRoles } from 'librechat-data-provider';
import {
  useGetAdminPlansQuery,
  useCreateAdminPlanMutation,
  useUpdateAdminPlanMutation,
  useDeleteAdminPlanMutation,
  useGetAdminUserPlanQuery,
  useUpdateAdminUserPlanMutation,
  type TPlan,
  type TCreatePlanRequest,
} from 'librechat-data-provider/react-query';
import { useLocalize } from '~/hooks';
// Note: User list query would need to be added to data-provider
import store from '~/store';
import { Button, Input, Label, Spinner } from '@librechat/client';
import { Trash2, Plus, Save, Edit2, X } from 'lucide-react';

export default function Plans() {
  const localize = useLocalize();
  const user = useRecoilValue(store.user);
  const isAdmin = user?.role === SystemRoles.ADMIN;

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<TPlan | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlan, setNewPlan] = useState<Partial<TCreatePlanRequest>>({
    name: '',
    displayName: '',
    monthlyTokenLimit: null,
    dailyRequestLimit: null,
    allowedEndpoints: [],
    hardLimit: true,
    isActive: true,
  });

  const { data: plansData, isLoading: plansLoading, error: plansError } = useGetAdminPlansQuery({ enabled: isAdmin });
  const plans = Array.isArray(plansData) ? plansData : [];
  const { data: userPlanInfo } = useGetAdminUserPlanQuery(selectedUserId || '', {
    enabled: !!selectedUserId && isAdmin,
  });

  const createPlan = useCreateAdminPlanMutation();
  const updatePlan = useUpdateAdminPlanMutation();
  const deletePlan = useDeleteAdminPlanMutation();
  const updateUserPlan = useUpdateAdminUserPlanMutation();

  if (!isAdmin) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-text-secondary">{localize('com_ui_admin_access_required')}</p>
      </div>
    );
  }

  if (plansError) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary mb-2">Error loading plans</p>
          <p className="text-sm text-red-500">
            {plansError instanceof Error ? plansError.message : 'Unknown error'}
          </p>
          <p className="text-xs text-text-secondary mt-2">
            Make sure the API server is running and the admin endpoints are accessible.
          </p>
        </div>
      </div>
    );
  }

  const handleCreatePlan = () => {
    if (!newPlan.name || !newPlan.displayName || !newPlan.allowedEndpoints?.length) {
      return;
    }
    createPlan.mutate(newPlan as TCreatePlanRequest, {
      onSuccess: () => {
        setShowCreateForm(false);
        setNewPlan({
          name: '',
          displayName: '',
          monthlyTokenLimit: null,
          dailyRequestLimit: null,
          allowedEndpoints: [],
          hardLimit: true,
          isActive: true,
        });
      },
    });
  };

  const handleUpdatePlan = (plan: TPlan) => {
    updatePlan.mutate(
      {
        planId: plan._id,
        data: {
          displayName: plan.displayName,
          monthlyTokenLimit: plan.monthlyTokenLimit,
          dailyRequestLimit: plan.dailyRequestLimit,
          allowedEndpoints: plan.allowedEndpoints,
          hardLimit: plan.hardLimit,
          stripeProductId: plan.stripeProductId,
          stripePriceId: plan.stripePriceId,
          isActive: plan.isActive,
        },
      },
      {
        onSuccess: () => {
          setEditingPlan(null);
        },
      },
    );
  };

  const handleDeletePlan = (planId: string) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      deletePlan.mutate(planId);
    }
  };

  const handleUpdateUserPlan = (userId: string, planId: string | null) => {
    updateUserPlan.mutate({
      userId,
      data: { planId },
    });
  };

  const formatNumber = (num: number | null) => {
    if (num === null) return 'Unlimited';
    return num.toLocaleString();
  };

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Plan Management</h3>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Create Plan
        </Button>
      </div>

      {showCreateForm && (
        <div className="rounded-lg border border-border-light bg-surface-secondary p-4">
          <h4 className="mb-4 font-semibold">Create New Plan</h4>
          <div className="space-y-3">
            <div>
              <Label>Plan Name (ID)</Label>
              <Input
                value={newPlan.name}
                onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value.toLowerCase() })}
                placeholder="free, pro, enterprise"
              />
            </div>
            <div>
              <Label>Display Name</Label>
              <Input
                value={newPlan.displayName}
                onChange={(e) => setNewPlan({ ...newPlan, displayName: e.target.value })}
                placeholder="Free Plan"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Monthly Token Limit</Label>
                <Input
                  type="number"
                  value={newPlan.monthlyTokenLimit || ''}
                  onChange={(e) =>
                    setNewPlan({
                      ...newPlan,
                      monthlyTokenLimit: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  placeholder="Leave empty for unlimited"
                />
              </div>
              <div>
                <Label>Daily Request Limit</Label>
                <Input
                  type="number"
                  value={newPlan.dailyRequestLimit || ''}
                  onChange={(e) =>
                    setNewPlan({
                      ...newPlan,
                      dailyRequestLimit: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>
            <div>
              <Label>Allowed Endpoints (comma-separated)</Label>
              <Input
                value={newPlan.allowedEndpoints?.join(', ') || ''}
                onChange={(e) =>
                  setNewPlan({
                    ...newPlan,
                    allowedEndpoints: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="DeepSeek, OpenRouter"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreatePlan} disabled={createPlan.isLoading}>
                {createPlan.isLoading ? <Spinner /> : 'Create'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {plansLoading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className="rounded-lg border border-border-light bg-surface-secondary p-4"
            >
              {editingPlan?._id === plan._id ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Editing: {plan.displayName}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingPlan(null)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                  <div>
                    <Label>Display Name</Label>
                    <Input
                      value={editingPlan.displayName}
                      onChange={(e) =>
                        setEditingPlan({ ...editingPlan, displayName: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Monthly Token Limit</Label>
                      <Input
                        type="number"
                        value={editingPlan.monthlyTokenLimit || ''}
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            monthlyTokenLimit: e.target.value ? parseInt(e.target.value) : null,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Daily Request Limit</Label>
                      <Input
                        type="number"
                        value={editingPlan.dailyRequestLimit || ''}
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            dailyRequestLimit: e.target.value ? parseInt(e.target.value) : null,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Allowed Endpoints</Label>
                    <Input
                      value={editingPlan.allowedEndpoints.join(', ')}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          allowedEndpoints: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        })
                      }
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleUpdatePlan(editingPlan)}
                      disabled={updatePlan.isLoading}
                    >
                      {updatePlan.isLoading ? <Spinner /> : <Save size={16} />} Save
                    </Button>
                    <Button variant="outline" onClick={() => setEditingPlan(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{plan.displayName}</h4>
                      <p className="text-sm text-text-secondary">ID: {plan.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingPlan({ ...plan })}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePlan(plan._id)}
                        disabled={deletePlan.isLoading}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-text-secondary">Monthly Tokens: </span>
                      <span className="font-medium">{formatNumber(plan.monthlyTokenLimit)}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Daily Requests: </span>
                      <span className="font-medium">{formatNumber(plan.dailyRequestLimit)}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-text-secondary">Allowed Endpoints: </span>
                      <span className="font-medium">{plan.allowedEndpoints.join(', ')}</span>
                    </div>
                    {plan.stripeProductId && (
                      <div>
                        <span className="text-text-secondary">Stripe Product ID: </span>
                        <span className="font-medium">{plan.stripeProductId}</span>
                      </div>
                    )}
                    {plan.stripePriceId && (
                      <div>
                        <span className="text-text-secondary">Stripe Price ID: </span>
                        <span className="font-medium">{plan.stripePriceId}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 rounded-lg border border-border-light bg-surface-secondary p-4">
        <h3 className="mb-4 text-lg font-semibold">User Plan Management</h3>
        <div className="space-y-4">
          <div>
            <Label>User ID (enter user ID to manage their plan)</Label>
            <Input
              value={selectedUserId || ''}
              onChange={(e) => setSelectedUserId(e.target.value || null)}
              placeholder="Enter user ID"
            />
          </div>
          {selectedUserId && userPlanInfo && (
            <div className="space-y-3">
              <div>
                <Label>Current Plan</Label>
                <select
                  value={userPlanInfo.plan?._id || ''}
                  onChange={(e) =>
                    handleUpdateUserPlan(selectedUserId, e.target.value || null)
                  }
                  className="webkit-dark-styles transition-color w-full rounded-2xl border border-border-light bg-surface-primary px-3.5 pb-2.5 pt-3 text-text-primary duration-200 focus:border-green-500 focus:outline-none"
                >
                  <option value="">-- No Plan --</option>
                  {plans.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.displayName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-text-secondary">Monthly Tokens Used: </span>
                  <span className="font-medium">
                    {userPlanInfo.usage.monthlyTokens.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-text-secondary">Daily Requests: </span>
                  <span className="font-medium">
                    {userPlanInfo.usage.dailyRequests.toLocaleString()}
                  </span>
                </div>
                {userPlanInfo.customTokenOverrides > 0 && (
                  <div>
                    <span className="text-text-secondary">Token Overrides: </span>
                    <span className="font-medium">
                      {userPlanInfo.customTokenOverrides.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

