import React, { useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetPublicPlansQuery,
  useCreateStripeCheckoutSessionMutation,
  useCreateStripeCustomerPortalMutation,
  useUpdateUserPlanMutation,
  type TPlan,
} from 'librechat-data-provider/react-query';
import { useLocalize } from '~/hooks';
import { useGetUserQuery } from '~/data-provider/Auth/queries';
import { QueryKeys } from 'librechat-data-provider';
import store from '~/store';
import { Button, Spinner } from '@librechat/client';
import { Crown, Check, ExternalLink } from 'lucide-react';

export default function Subscription() {
  const localize = useLocalize();
  const user = useRecoilValue(store.user);
  const setUser = useSetRecoilState(store.user);
  const queryClient = useQueryClient();
  const { data: plans = [], isLoading } = useGetPublicPlansQuery();
  const { refetch: refetchUser } = useGetUserQuery();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const checkoutMutation = useCreateStripeCheckoutSessionMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout. Please try again.');
    },
  });

  const portalMutation = useCreateStripeCustomerPortalMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      console.error('Error creating customer portal session:', error);
      alert('Failed to open customer portal. Please try again.');
    },
  });

  const updatePlanMutation = useUpdateUserPlanMutation({
    onSuccess: async (data) => {
      console.log('[Subscription] Plan update success:', data);
      
      // Invalidate user query
      await queryClient.invalidateQueries([QueryKeys.user]);
      console.log('[Subscription] Invalidated user queries');
      
      // Refetch user data and update Recoil state
      try {
        const userData = await refetchUser();
        console.log('[Subscription] Refetched user data:', userData.data);
        if (userData.data) {
          setUser(userData.data);
          console.log('[Subscription] Updated Recoil user state with planId:', userData.data.planId);
        }
      } catch (error) {
        console.error('[Subscription] Error refetching user:', error);
        // Fallback: reload page if refetch fails
        setTimeout(() => window.location.reload(), 1000);
      }
      
      alert(data.message || 'Plan updated successfully! Please refresh the page to see changes.');
    },
    onError: (error: any) => {
      console.error('[Subscription] Plan update error:', error);
      console.error('[Subscription] Error message:', error?.message);
      console.error('[Subscription] Error response:', error?.response);
      console.error('[Subscription] Error status:', error?.response?.status);
      console.error('[Subscription] Error data:', error?.response?.data);
      console.error('[Subscription] Error URL:', error?.config?.url);
      
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update plan. Please try again.';
      alert(errorMessage);
    },
  });

  const handleUpgrade = (planId: string) => {
    console.log('[Subscription] handleUpgrade called with planId:', planId);
    setSelectedPlanId(planId);
    const plan = plans.find((p) => p._id === planId);
    console.log('[Subscription] Found plan:', plan);
    
    // If plan has Stripe price ID, use Stripe checkout
    // Otherwise, directly update the plan (for free plan or plans without Stripe)
    if (plan?.stripePriceId && plan.name !== 'free') {
      console.log('[Subscription] Using Stripe checkout for plan:', plan.name);
      checkoutMutation.mutate({ planId });
    } else {
      // Direct plan update for free plan or plans without Stripe
      console.log('[Subscription] Directly updating plan to:', plan?.name || planId);
      updatePlanMutation.mutate({ planId });
    }
  };

  const handleManageSubscription = () => {
    portalMutation.mutate();
  };

  // Default to free plan if no plan is set
  // Handle both string and object planId formats
  const userPlanId = typeof user?.planId === 'string' 
    ? user.planId 
    : user?.planId?._id || user?.planId;
  
  const currentPlan = userPlanId
    ? plans.find((p) => p._id === userPlanId || p._id?.toString() === userPlanId?.toString()) || plans.find((p) => p.name === 'free')
    : plans.find((p) => p.name === 'free');
  
  console.log('[Subscription] Current user:', user);
  console.log('[Subscription] User planId:', userPlanId);
  console.log('[Subscription] Current plan:', currentPlan);

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) return 'Unlimited';
    return num.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner />
      </div>
    );
  }

  // Show all active plans, not just ones with Stripe
  const activePlans = plans.filter((plan) => plan.isActive);

  return (
    <div className="flex flex-col gap-4 p-1 text-sm text-text-primary">
      <div className="mb-4">
        <h3 className="mb-2 text-lg font-semibold">Subscription Plans</h3>
        {currentPlan && (
          <div className="rounded-lg border border-border-light bg-surface-secondary p-3">
            <p className="text-sm text-text-secondary">
              Current Plan: <span className="font-semibold text-text-primary">{currentPlan.displayName}</span>
            </p>
          </div>
        )}
      </div>

      {user?.stripeCustomerId && (
        <div className="mb-4">
          <Button
            onClick={handleManageSubscription}
            disabled={portalMutation.isLoading}
            className="w-full"
            variant="outline"
          >
            {portalMutation.isLoading ? (
              <>
                <Spinner className="mr-2" />
                Loading...
              </>
            ) : (
              <>
                <ExternalLink className="mr-2 h-4 w-4" />
                Manage Subscription
              </>
            )}
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.filter((plan) => plan.isActive).map((plan) => {
          // Compare plan IDs, handling both string and ObjectId formats
          const planIdMatch = currentPlan?._id === plan._id || 
                             currentPlan?._id?.toString() === plan._id?.toString() ||
                             userPlanId === plan._id ||
                             userPlanId?.toString() === plan._id?.toString();
          const isCurrentPlan = planIdMatch;
          const isSelected = selectedPlanId === plan._id;
          const isUpgrading = checkoutMutation.isLoading && isSelected;
          
          console.log(`[Subscription] Plan ${plan.name}: isCurrentPlan=${isCurrentPlan}, planId=${plan._id}, userPlanId=${userPlanId}`);

          return (
            <div
              key={plan._id}
              className={`relative rounded-lg border-2 p-4 transition-all ${
                isCurrentPlan
                  ? 'border-green-500 bg-surface-secondary'
                  : 'border-border-light bg-surface-primary hover:border-green-400'
              }`}
            >
              {isCurrentPlan && (
                <div className="absolute right-2 top-2">
                  <span className="rounded-full bg-green-500 px-2 py-1 text-xs font-semibold text-white">
                    Current
                  </span>
                </div>
              )}

              <div className="mb-3 flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                <h4 className="text-lg font-semibold">{plan.displayName}</h4>
              </div>

              <div className="mb-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>
                    <strong>{formatNumber(plan.monthlyTokenLimit)}</strong> tokens/month
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>
                    <strong>{formatNumber(plan.dailyRequestLimit)}</strong> requests/day
                  </span>
                </div>
                {plan.allowedEndpoints && plan.allowedEndpoints.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>
                      Endpoints: <strong>{plan.allowedEndpoints.join(', ')}</strong>
                    </span>
                  </div>
                )}
              </div>

              {!isCurrentPlan && (
                <Button
                  onClick={() => handleUpgrade(plan._id)}
                  disabled={checkoutMutation.isLoading || updatePlanMutation.isLoading}
                  className="w-full"
                  variant={isCurrentPlan ? 'outline' : 'default'}
                >
                  {(isUpgrading || (updatePlanMutation.isLoading && selectedPlanId === plan._id)) ? (
                    <>
                      <Spinner className="mr-2" />
                      Processing...
                    </>
                  ) : plan.name === 'free' ? (
                    'Switch to Free'
                  ) : plan.stripePriceId ? (
                    'Upgrade'
                  ) : (
                    'Switch Plan'
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {activePlans.length === 0 && (
        <div className="rounded-lg border border-border-light bg-surface-secondary p-4 text-center">
          <p className="text-text-secondary">No subscription plans available at this time.</p>
        </div>
      )}
    </div>
  );
}

