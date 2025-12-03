# Stripe Integration Setup Guide

This guide will help you set up Stripe payment processing for your SaaS plans.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Access to your Stripe Dashboard

## Step 1: Get Your Stripe API Keys

1. Go to https://dashboard.stripe.com/apikeys
2. Copy your **Publishable Key** (starts with `pk_`)
3. Copy your **Secret Key** (starts with `sk_`)
4. For webhooks, you'll also need your **Webhook Signing Secret** (starts with `whsec_`)

## Step 2: Add Stripe Keys to .env

Add these lines to your `.env` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...  # Your Stripe Secret Key
STRIPE_PUBLISHABLE_KEY=pk_test_...  # Your Stripe Publishable Key
STRIPE_WEBHOOK_SECRET=whsec_...  # Your Webhook Signing Secret (get this after setting up webhook)
STRIPE_WEBHOOK_ENDPOINT=/api/stripe/webhook  # Webhook endpoint path
```

**Important:** 
- Use `sk_test_...` and `pk_test_...` for testing
- Use `sk_live_...` and `pk_live_...` for production

## Step 3: Create Products and Prices in Stripe Dashboard

For each plan (Free, Pro, Enterprise), you need to:

1. Go to https://dashboard.stripe.com/products
2. Click **"Add product"**
3. Create products for each plan:

### Free Plan (Optional - usually no payment)
- **Name:** Free Plan
- **Description:** 100k tokens/month, DeepSeek access
- **Pricing:** $0/month (or leave blank if free)

### Pro Plan
- **Name:** Pro Plan
- **Description:** 1M tokens/month, DeepSeek + OpenRouter access
- **Pricing:** Set your price (e.g., $29/month)
- **Billing:** Recurring monthly

### Enterprise Plan
- **Name:** Enterprise Plan
- **Description:** Unlimited tokens, DeepSeek + OpenRouter access
- **Pricing:** Set your price (e.g., $99/month)
- **Billing:** Recurring monthly

4. After creating each product, copy the **Product ID** (starts with `prod_`)
5. Copy the **Price ID** (starts with `price_`) for the recurring price

## Step 4: Update Plans in Admin UI

1. Start your application
2. Log in as an admin
3. Go to **Settings** → **Plans** tab
4. For each plan, click **Edit** and add:
   - **Stripe Product ID:** `prod_...` (from Step 3)
   - **Stripe Price ID:** `price_...` (from Step 3)
5. Click **Save**

Alternatively, you can update plans via the API or directly in MongoDB.

## Step 5: Set Up Stripe Webhook

1. Go to https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. **Endpoint URL:** `https://yourdomain.com/api/stripe/webhook`
   - For local testing: Use `stripe listen` (see below)
4. **Events to send:** Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add it to your `.env` as `STRIPE_WEBHOOK_SECRET`

### Local Testing with Stripe CLI

For local development, use Stripe CLI:

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe listen --forward-to localhost:3080/api/stripe/webhook
```

This will give you a webhook signing secret for local testing.

## Step 6: Install Stripe Package

The Stripe integration code will use the `stripe` npm package. Make sure it's installed:

```bash
cd api
npm install stripe
```

## Step 7: Restart Services

After adding environment variables:

```bash
docker compose restart api
```

## How It Works

1. **User Registration:** User selects a plan during registration
2. **Checkout:** User clicks "Upgrade" → Creates Stripe Checkout Session → Redirects to Stripe
3. **Payment:** User completes payment on Stripe
4. **Webhook:** Stripe sends webhook → Updates user's plan and subscription
5. **Access:** User gets access based on their plan limits

## Testing

1. Use Stripe test cards: https://stripe.com/docs/testing
2. Test card: `4242 4242 4242 4242`
3. Any future expiry date, any CVC

## Production Checklist

- [ ] Switch to live API keys (`sk_live_...`, `pk_live_...`)
- [ ] Update webhook endpoint to production URL
- [ ] Test webhook delivery in Stripe Dashboard
- [ ] Set up webhook retry policy
- [ ] Monitor webhook logs for errors
- [ ] Set up email notifications for failed payments

## Troubleshooting

- **Webhook not receiving events:** Check webhook endpoint URL and signing secret
- **User plan not updating:** Check webhook logs in Stripe Dashboard
- **Payment succeeds but plan doesn't change:** Check webhook handler logs


