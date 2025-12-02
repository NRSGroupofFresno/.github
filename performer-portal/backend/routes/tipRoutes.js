import express from 'express';
import { TipController } from '../controllers/tipController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create payment intent for tip
router.post('/create-payment-intent', TipController.createPaymentIntent);

// Process tip (after successful payment)
router.post('/process', authenticateToken, TipController.processTip);

// Get tip history
router.get('/history/:performerId', authenticateToken, TipController.getTipHistory);

// Get tip leaderboard
router.get('/leaderboard/:performerId', TipController.getLeaderboard);

// Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), TipController.handleWebhook);

// Get tip statistics
router.get('/stats/:performerId', authenticateToken, TipController.getTipStats);

export default router;
