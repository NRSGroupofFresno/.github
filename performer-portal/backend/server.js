import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import performerRoutes from './routes/performerRoutes.js';
import tipRoutes from './routes/tipRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import songRequestRoutes from './routes/songRequestRoutes.js';
import authRoutes from './routes/authRoutes.js';
import streamRoutes from './routes/streamRoutes.js';

// Import WebSocket handler
import { setupWebSocket } from './websocket/websocketHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
    credentials: true
}));
app.use(compression()); // Compress responses
app.use(morgan('combined')); // Logging
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/performers', performerRoutes);
app.use('/api/tips', tipRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/song-requests', songRequestRoutes);
app.use('/api/stream', streamRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Setup WebSocket
setupWebSocket(wss);

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════╗
║   Performer Portal Backend Server             ║
║   Status: Running                             ║
║   Port: ${PORT}                                  ║
║   Environment: ${process.env.NODE_ENV || 'development'}                   ║
║   WebSocket: Enabled                          ║
╚═══════════════════════════════════════════════╝
    `);
});

export default app;
