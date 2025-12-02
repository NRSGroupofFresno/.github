import express from 'express';
import { SongRequestController } from '../controllers/songRequestController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Submit song request
router.post('/submit', authenticateToken, SongRequestController.submitRequest);

// Get song requests for performer
router.get('/:performerId', authenticateToken, SongRequestController.getRequests);

// Manage request (accept/reject/queue)
router.patch('/:requestId/status', authenticateToken, SongRequestController.updateStatus);

// Delete request
router.delete('/:requestId', authenticateToken, SongRequestController.deleteRequest);

// Get queue
router.get('/:performerId/queue', SongRequestController.getQueue);

// Reorder queue
router.patch('/:performerId/queue/reorder', authenticateToken, SongRequestController.reorderQueue);

// Serato integration
router.post('/:performerId/serato/sync', authenticateToken, SongRequestController.syncWithSerato);
router.get('/:performerId/serato/now-playing', SongRequestController.getNowPlaying);

export default router;
