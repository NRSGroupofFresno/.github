import express from 'express';
import { PerformerController } from '../controllers/performerController.js';
import { authenticateToken, isPerformer } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', PerformerController.getAllPerformers);
router.get('/:id', PerformerController.getPerformerById);
router.get('/:id/schedule', PerformerController.getSchedule);
router.get('/:id/tip-menu', PerformerController.getTipMenu);

// Protected routes (require authentication)
router.use(authenticateToken);
router.use(isPerformer);

router.post('/', PerformerController.createProfile);
router.put('/:id', PerformerController.updateProfile);
router.delete('/:id', PerformerController.deleteProfile);

// Tip menu management
router.post('/:id/tip-menu', PerformerController.updateTipMenu);
router.delete('/:id/tip-menu/:itemId', PerformerController.deleteTipMenuItem);

// Schedule management
router.post('/:id/schedule', PerformerController.updateSchedule);

// Analytics
router.get('/:id/analytics', PerformerController.getAnalytics);
router.get('/:id/earnings', PerformerController.getEarnings);

export default router;
