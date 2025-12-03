#!/bin/bash

# Stripe Setup Script for HULYAS
# This script helps you set up Stripe integration

echo "=========================================="
echo "Stripe Integration Setup for HULYAS"
echo "=========================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file first."
    exit 1
fi

# Check if stripe package is installed
if ! grep -q '"stripe"' api/package.json; then
    echo "📦 Installing Stripe package..."
    cd api
    npm install stripe
    cd ..
    echo "✅ Stripe package installed"
else
    echo "✅ Stripe package already installed"
fi

echo ""
echo "=========================================="
echo "Step 1: Add Stripe Keys to .env"
echo "=========================================="
echo ""
echo "You need to add these variables to your .env file:"
echo ""
echo "STRIPE_SECRET_KEY=sk_test_..."
echo "STRIPE_PUBLISHABLE_KEY=pk_test_..."
echo "STRIPE_WEBHOOK_SECRET=whsec_..."
echo ""
echo "Get your keys from: https://dashboard.stripe.com/apikeys"
echo ""

# Check if STRIPE_SECRET_KEY is already in .env
if grep -q "STRIPE_SECRET_KEY" .env 2>/dev/null; then
    echo "✅ STRIPE_SECRET_KEY found in .env"
else
    echo "⚠️  STRIPE_SECRET_KEY not found in .env"
    echo ""
    read -p "Do you want to add Stripe keys now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your Stripe Secret Key (sk_test_... or sk_live_...): " STRIPE_SECRET
        read -p "Enter your Stripe Publishable Key (pk_test_... or pk_live_...): " STRIPE_PUBLISHABLE
        read -p "Enter your Stripe Webhook Secret (whsec_...): " STRIPE_WEBHOOK
        
        echo "" >> .env
        echo "# Stripe Configuration" >> .env
        echo "STRIPE_SECRET_KEY=$STRIPE_SECRET" >> .env
        echo "STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE" >> .env
        echo "STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK" >> .env
        
        echo "✅ Stripe keys added to .env"
    fi
fi

echo ""
echo "=========================================="
echo "Step 2: Create Products in Stripe Dashboard"
echo "=========================================="
echo ""
echo "1. Go to: https://dashboard.stripe.com/products"
echo "2. Create products for each plan:"
echo "   - Free Plan (optional, $0/month)"
echo "   - Pro Plan (set your price, e.g., \$29/month)"
echo "   - Enterprise Plan (set your price, e.g., \$99/month)"
echo "3. Copy the Product ID (prod_...) and Price ID (price_...)"
echo ""

echo "=========================================="
echo "Step 3: Update Plans in Admin UI"
echo "=========================================="
echo ""
echo "1. Start your application: docker compose up"
echo "2. Log in as admin"
echo "3. Go to Settings → Plans tab"
echo "4. Edit each plan and add:"
echo "   - Stripe Product ID"
echo "   - Stripe Price ID"
echo "5. Save changes"
echo ""

echo "=========================================="
echo "Step 4: Set Up Webhook"
echo "=========================================="
echo ""
echo "For local testing:"
echo "  stripe listen --forward-to localhost:3080/api/stripe/webhook"
echo ""
echo "For production:"
echo "1. Go to: https://dashboard.stripe.com/webhooks"
echo "2. Add endpoint: https://yourdomain.com/api/stripe/webhook"
echo "3. Select events:"
echo "   - checkout.session.completed"
echo "   - customer.subscription.created"
echo "   - customer.subscription.updated"
echo "   - customer.subscription.deleted"
echo "   - invoice.payment_succeeded"
echo "   - invoice.payment_failed"
echo "4. Copy the Signing Secret and add to .env as STRIPE_WEBHOOK_SECRET"
echo ""

echo "=========================================="
echo "Next Steps"
echo "=========================================="
echo ""
echo "1. Restart your API: docker compose restart api"
echo "2. Test with Stripe test card: 4242 4242 4242 4242"
echo "3. Check webhook logs in Stripe Dashboard"
echo ""
echo "For detailed instructions, see: STRIPE_SETUP.md"
echo ""
echo "✅ Setup script completed!"


