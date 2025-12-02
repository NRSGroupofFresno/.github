import express from 'express';
import { StreamController } from '../controllers/streamController.js';
import { authenticateToken, isPerformer } from '../middleware/auth.js';

const router = express.Router();

// Start stream
router.post('/start', authenticateToken, isPerformer, StreamController.startStream);

// End stream
router.post('/end', authenticateToken, isPerformer, StreamController.endStream);

// Get stream status
router.get('/:performerId/status', StreamController.getStreamStatus);

// Get stream URL (for viewers)
router.get('/:performerId/url', StreamController.getStreamUrl);

// Get streaming key (for performers)
router.get('/key', authenticateToken, isPerformer, StreamController.getStreamingKey);

// Regenerate streaming key
router.post('/key/regenerate', authenticateToken, isPerformer, StreamController.regenerateStreamingKey);

// AWS MediaLive integration
router.post('/medialive/start', authenticateToken, isPerformer, StreamController.startMediaLive);
router.post('/medialive/stop', authenticateToken, isPerformer, StreamController.stopMediaLive);
router.get('/medialive/status', authenticateToken, isPerformer, StreamController.getMediaLiveStatus);

// Stream analytics
router.get('/:performerId/analytics', authenticateToken, StreamController.getStreamAnalytics);

// Record stream
router.post('/:performerId/record', authenticateToken, isPerformer, StreamController.toggleRecording);

export default router;
