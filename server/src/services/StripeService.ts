import Stripe from 'stripe';
import { config } from '../config';
import { AppDataSource } from '../database/dataSource';
import {
  User,
  SubscriptionPlan,
  Subscription,
  Payment,
  UserCharityPreference,
} from '../entities';
import { SubscriptionStatus, PaymentStatus, PlanInterval } from '../constants';
import { CharityService } from './CharityService';

export class StripeService {
  private stripe: Stripe;
  private userRepo = AppDataSource.getRepository(User);
  private planRepo = AppDataSource.getRepository(SubscriptionPlan);
  private subRepo = AppDataSource.getRepository(Subscription);
  private paymentRepo = AppDataSource.getRepository(Payment);
  private prefRepo = AppDataSource.getRepository(UserCharityPreference);
  private charityService = new CharityService();

  constructor() {
    this.stripe = new Stripe(config.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia' as any,
    });
  }

  /**
   * Helper that retrieves or automatically creates a real Stripe Product & recurring Price.
   * Eliminates "No such price" errors in local development.
   */
  async getOrCreateStripePrice(plan: SubscriptionPlan): Promise<string> {
    // If it's already a real Stripe price ID, verify it exists
    if (plan.stripePriceId && !plan.stripePriceId.includes('sample')) {
      try {
        const existingPrice = await this.stripe.prices.retrieve(plan.stripePriceId);
        if (existingPrice && existingPrice.active) {
          return existingPrice.id;
        }
      } catch {
        // Price doesn't exist in user's Stripe account, proceed to create it
      }
    }

    // Check if product exists in Stripe or create it
    let productId = plan.stripeProductId;
    if (!productId || productId.includes('sample')) {
      const product = await this.stripe.products.create({
        name: plan.name,
        description: `Golf Charity Platform - ${plan.name}`,
      });
      productId = product.id;
      plan.stripeProductId = productId;
    }

    // Create recurring price in Stripe
    const newPrice = await this.stripe.prices.create({
      product: productId,
      unit_amount: Number(plan.amountCents),
      currency: plan.currency.toLowerCase(),
      recurring: {
        interval: plan.interval === PlanInterval.YEAR ? 'year' : 'month',
      },
    });

    // Update the database record with the real Stripe Price ID
    plan.stripePriceId = newPrice.id;
    await this.planRepo.save(plan);

    console.log(`Created Stripe Price ${newPrice.id} for plan "${plan.name}" ($${(plan.amountCents / 100).toFixed(2)})`);
    return newPrice.id;
  }

  async createCheckoutSession(
    userId: string,
    planId: string
  ): Promise<{ sessionId: string; checkoutUrl: string }> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new Error('User not found.');
    }

    const plan = await this.planRepo.findOne({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      throw new Error('Selected subscription plan is invalid or inactive.');
    }

    // If placeholder key is used in development without real Stripe credentials
    const isPlaceholder = config.STRIPE_SECRET_KEY.includes('placeholder');
    if (isPlaceholder) {
      const mockSessionId = `cs_test_mock_${Date.now()}`;
      return {
        sessionId: mockSessionId,
        checkoutUrl: `${config.STRIPE_SUCCESS_URL.replace('{CHECKOUT_SESSION_ID}', mockSessionId)}`,
      };
    }

    // Ensure Stripe Customer exists
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await this.userRepo.save(user);
    }

    // Get or auto-create the real Stripe recurring Price
    const priceId = await this.getOrCreateStripePrice(plan);

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: config.STRIPE_SUCCESS_URL,
      cancel_url: config.STRIPE_CANCEL_URL,
      metadata: { userId: user.id, planId: plan.id },
    });

    return {
      sessionId: session.id,
      checkoutUrl: session.url || '',
    };
  }

  /**
   * Synchronizes and verifies a checkout session directly from Stripe API.
   * Essential for local development where Stripe webhooks cannot reach localhost.
   */
  async syncCheckoutSession(userId: string, sessionId: string): Promise<Subscription> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found.');
    }

    // Handle mock sessions if running offline
    if (sessionId.startsWith('cs_test_mock_')) {
      const plan = await this.planRepo.findOne({ where: { isActive: true } });
      if (!plan) throw new Error('No plan available.');

      const currentPeriodStart = new Date();
      const currentPeriodEnd = new Date();
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

      let sub = await this.subRepo.findOne({ where: { userId }, relations: ['plan'] });
      if (!sub) {
        sub = this.subRepo.create({
          userId,
          planId: plan.id,
          stripeSubscriptionId: `sub_mock_${Date.now()}`,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart,
          currentPeriodEnd,
        });
      } else {
        sub.status = SubscriptionStatus.ACTIVE;
        sub.currentPeriodStart = currentPeriodStart;
        sub.currentPeriodEnd = currentPeriodEnd;
      }
      const saved = await this.subRepo.save(sub);
      saved.plan = plan;
      return saved;
    }

    // Retrieve real session from Stripe API
    const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });

    if (!session || !session.subscription) {
      throw new Error('Checkout session or subscription not found in Stripe.');
    }

    const stripeSub = typeof session.subscription === 'string'
      ? await this.stripe.subscriptions.retrieve(session.subscription)
      : (session.subscription as Stripe.Subscription);

    const planId = session.metadata?.planId;
    let plan = planId ? await this.planRepo.findOne({ where: { id: planId } }) : null;
    if (!plan) {
      plan = await this.planRepo.findOne({ where: { isActive: true } });
    }
    if (!plan) {
      throw new Error('Associated subscription plan not found.');
    }

    const currentPeriodStart = (stripeSub as any).current_period_start
      ? new Date((stripeSub as any).current_period_start * 1000)
      : new Date();
    const currentPeriodEnd = (stripeSub as any).current_period_end
      ? new Date((stripeSub as any).current_period_end * 1000)
      : new Date(Date.now() + 30 * 86400000);

    let sub = await this.subRepo.findOne({
      where: { stripeSubscriptionId: stripeSub.id },
      relations: ['plan'],
    });

    if (!sub) {
      sub = this.subRepo.create({
        userId: user.id,
        planId: plan.id,
        stripeSubscriptionId: stripeSub.id,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: stripeSub.cancel_at_period_end || false,
      });
    } else {
      sub.status = SubscriptionStatus.ACTIVE;
      sub.currentPeriodStart = currentPeriodStart;
      sub.currentPeriodEnd = currentPeriodEnd;
      sub.cancelAtPeriodEnd = stripeSub.cancel_at_period_end || false;
    }

    const savedSub = await this.subRepo.save(sub);
    savedSub.plan = plan;

    // Record Payment if not already recorded
    const existingPayment = await this.paymentRepo.findOne({
      where: { idempotencyKey: sessionId },
    });

    if (!existingPayment) {
      const amountCents = plan.amountCents;
      const feeCents = Math.floor(amountCents * 0.029) + 30;
      const netCents = amountCents - feeCents;

      const payment = this.paymentRepo.create({
        userId: user.id,
        subscriptionId: savedSub.id,
        amountCents,
        feeCents,
        netCents,
        currency: plan.currency,
        status: PaymentStatus.SUCCEEDED,
        paymentMethodType: 'card',
        idempotencyKey: sessionId,
      });
      await this.paymentRepo.save(payment);

      // Allocate Charity contribution
      const pref = await this.prefRepo.findOne({ where: { userId: user.id } });
      const charityPct = pref ? pref.percentage : 10.0;
      const charityCents = Math.floor((amountCents * charityPct) / 100);

      if (pref) {
        await this.charityService.recordDonation(
          pref.charityId,
          charityCents,
          user.id,
          payment.id,
          'SUBSCRIPTION_PERCENTAGE'
        );
      }
    }

    return savedSub;
  }

  /**
   * Idempotent Webhook Processor.
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<{ received: boolean; processed: boolean }> {
    const eventId = event.id;

    // Check if event already processed in Payment table idempotencyKey
    const existing = await this.paymentRepo.findOne({
      where: { idempotencyKey: eventId },
    });
    if (existing) {
      return { received: true, processed: false };
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;

        if (userId && planId && session.subscription) {
          const subscriptionId = typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription.id;

          const plan = await this.planRepo.findOne({ where: { id: planId } });
          const user = await this.userRepo.findOne({ where: { id: userId } });

          if (user && plan) {
            const currentPeriodStart = new Date();
            const currentPeriodEnd = new Date();
            if (plan.interval === PlanInterval.YEAR) {
              currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
            } else {
              currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
            }

            let sub = await this.subRepo.findOne({
              where: { stripeSubscriptionId: subscriptionId },
            });

            if (!sub) {
              sub = this.subRepo.create({
                userId: user.id,
                planId: plan.id,
                stripeSubscriptionId: subscriptionId,
                status: SubscriptionStatus.ACTIVE,
                currentPeriodStart,
                currentPeriodEnd,
                cancelAtPeriodEnd: false,
              });
            } else {
              sub.status = SubscriptionStatus.ACTIVE;
              sub.currentPeriodStart = currentPeriodStart;
              sub.currentPeriodEnd = currentPeriodEnd;
            }
            await this.subRepo.save(sub);
          }
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = typeof (invoice as any).subscription === 'string'
          ? (invoice as any).subscription
          : (invoice as any).subscription?.id;

        if (subscriptionId) {
          const sub = await this.subRepo.findOne({
            where: { stripeSubscriptionId: subscriptionId },
            relations: ['plan'],
          });

          if (sub) {
            const amountCents = (invoice as any).amount_paid || sub.plan.amountCents;
            const feeCents = Math.floor(amountCents * 0.029) + 30; // 2.9% + 30c
            const netCents = amountCents - feeCents;

            const payment = this.paymentRepo.create({
              userId: sub.userId,
              subscriptionId: sub.id,
              stripeInvoiceId: invoice.id,
              stripePaymentIntentId: (invoice as any).payment_intent as string || null,
              amountCents,
              feeCents,
              netCents,
              currency: invoice.currency?.toUpperCase() || 'USD',
              status: PaymentStatus.SUCCEEDED,
              paymentMethodType: 'card',
              receiptUrl: (invoice as any).hosted_invoice_url || null,
              idempotencyKey: eventId,
            });
            await this.paymentRepo.save(payment);

            // Automatically allocate Charity percentage (minimum 10%)
            const pref = await this.prefRepo.findOne({ where: { userId: sub.userId } });
            const charityPct = pref ? pref.percentage : 10.0;
            const charityCents = Math.floor((amountCents * charityPct) / 100);

            if (pref) {
              await this.charityService.recordDonation(
                pref.charityId,
                charityCents,
                sub.userId,
                payment.id,
                'SUBSCRIPTION_PERCENTAGE'
              );
            }
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = typeof (invoice as any).subscription === 'string'
          ? (invoice as any).subscription
          : (invoice as any).subscription?.id;

        if (subscriptionId) {
          await this.subRepo.update(
            { stripeSubscriptionId: subscriptionId },
            { status: SubscriptionStatus.PAST_DUE }
          );
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const stripeSub = event.data.object as Stripe.Subscription;
        await this.subRepo.update(
          { stripeSubscriptionId: stripeSub.id },
          { status: SubscriptionStatus.CANCELED, canceledAt: new Date() }
        );
        break;
      }
    }

    return { received: true, processed: true };
  }
}
