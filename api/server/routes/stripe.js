const express = require('express');
const { logger } = require('@librechat/data-schemas');
const { requireJwtAuth } = require('~/server/middleware');
const { getPlanById } = require('~/models/Plan');
const { User } = require('~/db/models');
const { updateUser } = require('~/models');

const router = express.Router();

// Initialize Stripe
let stripe;
try {
  const Stripe = require('stripe');
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (stripeSecretKey) {
    stripe = new Stripe(stripeSecretKey);
  } else {
    logger.warn('[Stripe] STRIPE_SECRET_KEY not set, Stripe integration disabled');
  }
} catch (error) {
  logger.error('[Stripe] Failed to initialize Stripe:', error);
}

/**
 * POST /api/stripe/create-checkout-session
 * Create a Stripe Checkout Session for plan upgrade
 */
router.post('/create-checkout-session', requireJwtAuth, async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ message: 'Stripe integration not configured' });
  }

  try {
    const { planId } = req.body;
    const userId = req.user.id;

    if (!planId) {
      return res.status(400).json({ message: 'Plan ID is required' });
    }

    // Get plan details
    const plan = await getPlanById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    if (!plan.stripePriceId) {
      return res.status(400).json({ message: 'Plan does not have a Stripe price configured' });
    }

    // Get or create Stripe customer
    let customerId = req.user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
        metadata: {
          userId: userId,
        },
      });
      customerId = customer.id;
      
      // Save customer ID to user
      await updateUser(userId, { stripeCustomerId: customerId });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.DOMAIN_SERVER || 'http://localhost:3080'}/settings?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.DOMAIN_SERVER || 'http://localhost:3080'}/settings?canceled=true`,
      metadata: {
        userId: userId,
        planId: planId,
      },
    });

    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    logger.error('[Stripe] Error creating checkout session:', error);
    res.status(500).json({ message: 'Error creating checkout session', error: error.message });
  }
});

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ message: 'Stripe integration not configured' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.error('[Stripe] STRIPE_WEBHOOK_SECRET not set');
    return res.status(500).json({ message: 'Webhook secret not configured' });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    logger.error('[Stripe] Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;

        if (userId && planId) {
          // Update user's plan
          await updateUser(userId, {
            planId: planId,
            stripeCustomerId: session.customer,
          });
          logger.info(`[Stripe] Updated user ${userId} to plan ${planId} after checkout`);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Find user by Stripe customer ID
        const user = await User.findOne({ stripeCustomerId: customerId });
        if (user && subscription.metadata?.planId) {
          await updateUser(user._id, {
            planId: subscription.metadata.planId,
            stripeSubscriptionId: subscription.id,
          });
          logger.info(`[Stripe] Updated subscription for user ${user._id}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Find user and assign free plan
        const user = await User.findOne({ stripeCustomerId: customerId });
        if (user) {
          const { getPlanByName } = require('~/models/Plan');
          const freePlan = await getPlanByName('free');
          if (freePlan) {
            await updateUser(user._id, {
              planId: freePlan._id,
              stripeSubscriptionId: null,
            });
            logger.info(`[Stripe] Downgraded user ${user._id} to free plan after subscription cancellation`);
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        logger.info(`[Stripe] Payment succeeded for customer ${invoice.customer}`);
        // You can add additional logic here, like sending confirmation emails
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        logger.warn(`[Stripe] Payment failed for customer ${invoice.customer}`);
        // You can add logic here to notify the user or downgrade their plan
        break;
      }

      default:
        logger.debug(`[Stripe] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('[Stripe] Error processing webhook:', error);
    res.status(500).json({ message: 'Error processing webhook', error: error.message });
  }
});

/**
 * GET /api/stripe/customer-portal
 * Create a Stripe Customer Portal session for managing subscription
 */
router.post('/customer-portal', requireJwtAuth, async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ message: 'Stripe integration not configured' });
  }

  try {
    const userId = req.user.id;
    let customerId = req.user.stripeCustomerId;

    if (!customerId) {
      return res.status(400).json({ message: 'No Stripe customer found for this user' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.DOMAIN_SERVER || 'http://localhost:3080'}/settings`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    logger.error('[Stripe] Error creating customer portal session:', error);
    res.status(500).json({ message: 'Error creating customer portal session', error: error.message });
  }
});

module.exports = router;


