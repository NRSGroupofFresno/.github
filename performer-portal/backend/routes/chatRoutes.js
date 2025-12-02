import express from 'express';
import { ChatController } from '../controllers/chatController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get chat history
router.get('/:performerId/history', authenticateToken, ChatController.getChatHistory);

// Get active chat sessions
router.get('/:performerId/sessions', authenticateToken, ChatController.getActiveSessions);

// Ban/unban user from chat
router.post('/:performerId/ban', authenticateToken, ChatController.banUser);
router.post('/:performerId/unban', authenticateToken, ChatController.unbanUser);

// Clear chat
router.delete('/:performerId/clear', authenticateToken, ChatController.clearChat);

// Get banned users
router.get('/:performerId/banned', authenticateToken, ChatController.getBannedUsers);

export default router;
