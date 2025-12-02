import jwt from 'jsonwebtoken';

// Store active connections
const connections = new Map();
const rooms = new Map(); // performer_id -> Set of client ids

export function setupWebSocket(wss) {
    wss.on('connection', (ws, req) => {
        const clientId = generateClientId();
        connections.set(clientId, ws);

        console.log(`WebSocket client connected: ${clientId}`);

        // Handle authentication
        ws.on('message', async (data) => {
            try {
                const message = JSON.parse(data.toString());
                await handleMessage(ws, clientId, message);
            } catch (error) {
                console.error('WebSocket message error:', error);
                ws.send(JSON.stringify({
                    type: 'error',
                    error: 'Invalid message format'
                }));
            }
        });

        ws.on('close', () => {
            console.log(`WebSocket client disconnected: ${clientId}`);
            handleDisconnect(clientId);
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });

        // Send welcome message
        ws.send(JSON.stringify({
            type: 'connected',
            clientId: clientId,
            timestamp: new Date().toISOString()
        }));
    });
}

async function handleMessage(ws, clientId, message) {
    const { type, data, token } = message;

    // Authenticate user if token provided
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            ws.userId = decoded.userId;
            ws.userType = decoded.userType; // 'performer' or 'viewer'
        } catch (error) {
            ws.send(JSON.stringify({
                type: 'error',
                error: 'Invalid authentication token'
            }));
            return;
        }
    }

    switch (type) {
        case 'join_room':
            handleJoinRoom(ws, clientId, data);
            break;

        case 'leave_room':
            handleLeaveRoom(ws, clientId, data);
            break;

        case 'chat_message':
            handleChatMessage(ws, clientId, data);
            break;

        case 'tip':
            handleTip(ws, clientId, data);
            break;

        case 'song_request':
            handleSongRequest(ws, clientId, data);
            break;

        case 'stream_status':
            handleStreamStatus(ws, clientId, data);
            break;

        case 'viewer_count':
            handleViewerCount(ws, clientId, data);
            break;

        case 'lovense_trigger':
            handleLovenseTrigger(ws, clientId, data);
            break;

        default:
            ws.send(JSON.stringify({
                type: 'error',
                error: 'Unknown message type'
            }));
    }
}

function handleJoinRoom(ws, clientId, data) {
    const { performer_id } = data;

    if (!rooms.has(performer_id)) {
        rooms.set(performer_id, new Set());
    }

    rooms.get(performer_id).add(clientId);
    ws.currentRoom = performer_id;

    console.log(`Client ${clientId} joined room: ${performer_id}`);

    // Notify user
    ws.send(JSON.stringify({
        type: 'room_joined',
        performer_id: performer_id,
        viewer_count: rooms.get(performer_id).size
    }));

    // Notify others in room
    broadcastToRoom(performer_id, {
        type: 'viewer_joined',
        viewer_count: rooms.get(performer_id).size
    }, clientId);
}

function handleLeaveRoom(ws, clientId, data) {
    const { performer_id } = data;

    if (rooms.has(performer_id)) {
        rooms.get(performer_id).delete(clientId);
        console.log(`Client ${clientId} left room: ${performer_id}`);

        // Notify others in room
        broadcastToRoom(performer_id, {
            type: 'viewer_left',
            viewer_count: rooms.get(performer_id).size
        });

        if (rooms.get(performer_id).size === 0) {
            rooms.delete(performer_id);
        }
    }
}

function handleChatMessage(ws, clientId, data) {
    const { performer_id, message, sender_name, sender_type } = data;

    const chatMessage = {
        type: 'chat_message',
        message_id: generateMessageId(),
        performer_id,
        sender_name,
        sender_type,
        message,
        timestamp: new Date().toISOString()
    };

    // Broadcast to all in room
    broadcastToRoom(performer_id, chatMessage);

    // TODO: Save to database
    console.log(`Chat message in room ${performer_id}: ${message}`);
}

function handleTip(ws, clientId, data) {
    const { performer_id, amount, tipper_name, message, tip_item_id } = data;

    const tipNotification = {
        type: 'tip_received',
        tip_id: generateTipId(),
        performer_id,
        amount,
        tipper_name,
        message,
        tip_item_id,
        timestamp: new Date().toISOString()
    };

    // Broadcast to all in room
    broadcastToRoom(performer_id, tipNotification);

    // Send confirmation to tipper
    ws.send(JSON.stringify({
        type: 'tip_confirmed',
        ...tipNotification
    }));

    // TODO: Process payment with Stripe
    // TODO: Save to database
    // TODO: Trigger Lovense if applicable

    console.log(`Tip received: ${tipper_name} tipped $${amount / 100} to ${performer_id}`);
}

function handleSongRequest(ws, clientId, data) {
    const { performer_id, requester_name, song_title, artist, tip_amount, message } = data;

    const songRequest = {
        type: 'song_request',
        request_id: generateRequestId(),
        performer_id,
        requester_name,
        song_title,
        artist,
        tip_amount: tip_amount || 0,
        message: message || '',
        status: 'pending',
        timestamp: new Date().toISOString()
    };

    // Send to performer only
    notifyPerformer(performer_id, songRequest);

    // Send confirmation to requester
    ws.send(JSON.stringify({
        type: 'song_request_submitted',
        ...songRequest
    }));

    // TODO: Save to database

    console.log(`Song request: ${song_title} by ${artist} (requested by ${requester_name})`);
}

function handleStreamStatus(ws, clientId, data) {
    const { performer_id, status } = data;

    const statusUpdate = {
        type: 'stream_status_update',
        performer_id,
        status, // 'live' or 'offline'
        timestamp: new Date().toISOString()
    };

    // Broadcast to all in room
    broadcastToRoom(performer_id, statusUpdate);

    // TODO: Update database
    // TODO: Send notifications to subscribers

    console.log(`Stream status update: ${performer_id} is now ${status}`);
}

function handleViewerCount(ws, clientId, data) {
    const { performer_id } = data;

    const count = rooms.has(performer_id) ? rooms.get(performer_id).size : 0;

    ws.send(JSON.stringify({
        type: 'viewer_count',
        performer_id,
        count
    }));
}

function handleLovenseTrigger(ws, clientId, data) {
    const { performer_id, pattern, duration, intensity } = data;

    // Only allow if sender is authorized
    if (ws.userType !== 'viewer' && ws.userType !== 'performer') {
        ws.send(JSON.stringify({
            type: 'error',
            error: 'Unauthorized'
        }));
        return;
    }

    const lovenseTrigger = {
        type: 'lovense_trigger',
        performer_id,
        pattern,
        duration,
        intensity,
        timestamp: new Date().toISOString()
    };

    // Send to performer's device
    notifyPerformer(performer_id, lovenseTrigger);

    // TODO: Call Lovense API

    console.log(`Lovense trigger: ${pattern} for ${duration}ms at ${intensity}%`);
}

function handleDisconnect(clientId) {
    const ws = connections.get(clientId);

    if (ws && ws.currentRoom) {
        handleLeaveRoom(ws, clientId, { performer_id: ws.currentRoom });
    }

    connections.delete(clientId);
}

// Broadcast to all clients in a room
function broadcastToRoom(performerId, message, excludeClientId = null) {
    if (!rooms.has(performerId)) return;

    const roomClients = rooms.get(performerId);
    const messageStr = JSON.stringify(message);

    roomClients.forEach(clientId => {
        if (clientId !== excludeClientId) {
            const ws = connections.get(clientId);
            if (ws && ws.readyState === 1) { // WebSocket.OPEN
                ws.send(messageStr);
            }
        }
    });
}

// Send message to performer only
function notifyPerformer(performerId, message) {
    // In a real implementation, you'd track which connection belongs to the performer
    // For now, broadcast to room and let performer client filter
    broadcastToRoom(performerId, {
        ...message,
        performer_only: true
    });
}

// Utility functions
function generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateTipId() {
    return `tip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get room stats (for monitoring)
export function getRoomStats() {
    const stats = {};
    rooms.forEach((clients, performerId) => {
        stats[performerId] = {
            viewer_count: clients.size,
            clients: Array.from(clients)
        };
    });
    return stats;
}

// Get total connection count
export function getConnectionCount() {
    return connections.size;
}
