import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_your_key_here');

export class TipController {
    // Create Stripe payment intent for tip
    static async createPaymentIntent(req, res) {
        try {
            const { amount, currency = 'usd', performer_id, tip_item_id } = req.body;

            // Validate amount
            if (!amount || amount < 50) { // Minimum $0.50
                return res.status(400).json({
                    error: 'Invalid amount',
                    message: 'Amount must be at least $0.50'
                });
            }

            // Create payment intent
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount), // Amount in cents
                currency: currency,
                metadata: {
                    performer_id,
                    tip_item_id: tip_item_id || '',
                    platform: 'performer-portal'
                },
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            res.json({
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            });
        } catch (error) {
            console.error('Create payment intent error:', error);
            res.status(500).json({
                error: 'Payment intent creation failed',
                message: error.message
            });
        }
    }

    // Process tip after successful payment
    static async processTip(req, res) {
        try {
            const {
                payment_intent_id,
                performer_id,
                amount,
                tipper_name,
                message,
                tip_item_id
            } = req.body;

            // Verify payment intent with Stripe
            const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

            if (paymentIntent.status !== 'succeeded') {
                return res.status(400).json({
                    error: 'Payment not completed',
                    status: paymentIntent.status
                });
            }

            // TODO: Save tip to database
            const tip = {
                tip_id: `tip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                performer_id,
                amount,
                tipper_name: tipper_name || 'Anonymous',
                message: message || '',
                tip_item_id,
                stripe_payment_id: payment_intent_id,
                status: 'completed',
                created_at: new Date().toISOString()
            };

            // Calculate platform fee (e.g., 10%)
            const platformFee = Math.round(amount * 0.10);
            const performerPayout = amount - platformFee;

            // TODO: Update performer earnings
            // TODO: Trigger Lovense if applicable
            // TODO: Send WebSocket notification

            res.json({
                success: true,
                tip,
                performer_payout: performerPayout,
                platform_fee: platformFee
            });
        } catch (error) {
            console.error('Process tip error:', error);
            res.status(500).json({
                error: 'Tip processing failed',
                message: error.message
            });
        }
    }

    // Get tip history for a performer
    static async getTipHistory(req, res) {
        try {
            const { performerId } = req.params;
            const { start_date, end_date, limit = 50, offset = 0 } = req.query;

            // TODO: Query database
            const tips = []; // Placeholder

            res.json({
                performer_id: performerId,
                tips,
                count: tips.length,
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
        } catch (error) {
            console.error('Get tip history error:', error);
            res.status(500).json({
                error: 'Failed to retrieve tip history',
                message: error.message
            });
        }
    }

    // Get tip leaderboard
    static async getLeaderboard(req, res) {
        try {
            const { performerId } = req.params;
            const { period = 'week', limit = 10 } = req.query;

            // TODO: Query database and calculate leaderboard
            const leaderboard = [
                {
                    rank: 1,
                    tipper_name: 'MusicFan99',
                    total_amount: 12700,
                    tip_count: 15
                },
                {
                    rank: 2,
                    tipper_name: 'DanceLover',
                    total_amount: 8500,
                    tip_count: 12
                }
            ]; // Placeholder

            res.json({
                performer_id: performerId,
                period,
                leaderboard
            });
        } catch (error) {
            console.error('Get leaderboard error:', error);
            res.status(500).json({
                error: 'Failed to retrieve leaderboard',
                message: error.message
            });
        }
    }

    // Handle Stripe webhooks
    static async handleWebhook(req, res) {
        const sig = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        let event;

        try {
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log('PaymentIntent succeeded:', paymentIntent.id);
                // TODO: Process tip, update database, trigger notifications
                break;

            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                console.log('PaymentIntent failed:', failedPayment.id);
                // TODO: Handle failed payment
                break;

            case 'charge.refunded':
                const refund = event.data.object;
                console.log('Charge refunded:', refund.id);
                // TODO: Process refund
                break;

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.json({ received: true });
    }

    // Get tip statistics
    static async getTipStats(req, res) {
        try {
            const { performerId } = req.params;
            const { period = 'week' } = req.query;

            // TODO: Calculate statistics from database
            const stats = {
                performer_id: performerId,
                period,
                total_earnings: 124750, // In cents
                tip_count: 87,
                average_tip: 1434,
                highest_tip: 5000,
                unique_tippers: 42,
                top_tip_items: [
                    { item_id: 'request_song', title: 'Request a Song', count: 23, total: 11500 },
                    { item_id: 'shoutout', title: 'Shoutout', count: 8, total: 8000 }
                ]
            };

            res.json(stats);
        } catch (error) {
            console.error('Get tip stats error:', error);
            res.status(500).json({
                error: 'Failed to retrieve tip statistics',
                message: error.message
            });
        }
    }

    // Create subscription with Stripe
    static async createSubscription(req, res) {
        try {
            const { performer_id, price_id, customer_id } = req.body;

            const subscription = await stripe.subscriptions.create({
                customer: customer_id,
                items: [{ price: price_id }],
                metadata: {
                    performer_id,
                    platform: 'performer-portal'
                }
            });

            res.json({
                subscription_id: subscription.id,
                status: subscription.status,
                current_period_end: subscription.current_period_end
            });
        } catch (error) {
            console.error('Create subscription error:', error);
            res.status(500).json({
                error: 'Subscription creation failed',
                message: error.message
            });
        }
    }

    // Cancel subscription
    static async cancelSubscription(req, res) {
        try {
            const { subscription_id } = req.body;

            const subscription = await stripe.subscriptions.cancel(subscription_id);

            res.json({
                success: true,
                subscription_id: subscription.id,
                status: subscription.status
            });
        } catch (error) {
            console.error('Cancel subscription error:', error);
            res.status(500).json({
                error: 'Subscription cancellation failed',
                message: error.message
            });
        }
    }
}
