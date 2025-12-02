// Mock data and interactivity for demonstration

// Simulate WebSocket connection
class MockWebSocket {
    constructor() {
        this.connected = false;
        this.listeners = {};
    }

    connect() {
        setTimeout(() => {
            this.connected = true;
            console.log('WebSocket connected');
            this.emit('connected', { status: 'Connected to server' });
        }, 1000);
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    send(event, data) {
        console.log('Sending:', event, data);
        // Simulate server response
        setTimeout(() => {
            this.emit(`${event}_response`, { success: true, data });
        }, 100);
    }
}

const ws = new MockWebSocket();

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeChat();
    initializeSongRequests();
    initializeTipMenu();
    initializeLiveStatus();
    ws.connect();
});

// Navigation
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Time filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateEarningsData(btn.textContent.toLowerCase());
        });
    });
}

// Chat functionality
function initializeChat() {
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    const btnSend = document.querySelector('.btn-send');

    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        const messageEl = createChatMessage({
            username: 'DJ Awesome',
            type: 'performer',
            message: message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        chatMessages.appendChild(messageEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        chatInput.value = '';

        // Send to server
        ws.send('chat_message', {
            performer_id: 'dj_awesome',
            sender_name: 'DJ Awesome',
            sender_type: 'performer',
            message: message
        });
    }

    btnSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Simulate incoming messages
    simulateIncomingMessages();
}

function createChatMessage(data) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${data.type}`;
    messageDiv.innerHTML = `
        <img src="https://via.placeholder.com/32" alt="User">
        <div class="message-content">
            <div class="message-header">
                <span class="username">${data.username}</span>
                <span class="timestamp">${data.timestamp}</span>
            </div>
            <div class="message-text">${data.message}</div>
        </div>
    `;
    return messageDiv;
}

function simulateIncomingMessages() {
    const sampleMessages = [
        { username: 'PartyKing', type: 'viewer', message: 'This is awesome! 🎉', delay: 5000 },
        { username: 'MusicLover', type: 'viewer', message: 'Can you play some 80s classics?', delay: 10000 },
        { username: 'DanceQueen', type: 'viewer', message: 'Love this track!', delay: 15000 }
    ];

    sampleMessages.forEach(msg => {
        setTimeout(() => {
            const chatMessages = document.getElementById('chatMessages');
            const messageEl = createChatMessage({
                ...msg,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
            chatMessages.appendChild(messageEl);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, msg.delay);
    });
}

// Song Requests
function initializeSongRequests() {
    const requestButtons = document.querySelectorAll('.request-actions button');
    requestButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = btn.textContent.toLowerCase().trim();
            const requestItem = btn.closest('.song-request-item');
            const songTitle = requestItem.querySelector('.song-title').textContent;

            handleSongRequestAction(action, songTitle, requestItem);
        });
    });
}

function handleSongRequestAction(action, songTitle, requestItem) {
    const actionMap = {
        'accept': 'accepted',
        'queue': 'queued',
        'reject': 'rejected'
    };

    console.log(`${actionMap[action]} song request: ${songTitle}`);

    // Animate removal
    requestItem.style.transition = 'all 0.3s ease';
    requestItem.style.opacity = '0';
    requestItem.style.transform = 'translateX(-20px)';

    setTimeout(() => {
        requestItem.remove();
        updateRequestCount();

        // Show notification
        showNotification(`Song request ${actionMap[action]}: ${songTitle}`, 'success');

        // If accepted or queued, could add to queue
        if (action === 'accept' || action === 'queue') {
            // addToQueue(songTitle);
        }
    }, 300);

    // Send to server
    ws.send('manage_song_request', {
        request_id: `req_${Date.now()}`,
        action: action
    });
}

function updateRequestCount() {
    const badge = document.querySelector('.section-header .badge');
    const requestItems = document.querySelectorAll('.song-request-item').length;
    badge.textContent = `${requestItems} Pending`;
}

// Tip Menu
function initializeTipMenu() {
    const tipItems = document.querySelectorAll('.tip-menu-item');
    const editButtons = document.querySelectorAll('.tip-menu-item .btn-icon');

    tipItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.btn-icon')) {
                const title = item.querySelector('.tip-item-title').textContent;
                const price = item.querySelector('.tip-item-price').textContent;
                showNotification(`Tip menu item: ${title} - ${price}`, 'info');
            }
        });
    });

    editButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const item = btn.closest('.tip-menu-item');
            const title = item.querySelector('.tip-item-title').textContent;
            showNotification(`Editing: ${title}`, 'info');
            // In production, open modal for editing
        });
    });

    // Add new item button
    const addItemBtn = document.querySelector('.section-header .btn-primary');
    if (addItemBtn) {
        addItemBtn.addEventListener('click', () => {
            showNotification('Opening tip menu item creator...', 'info');
            // In production, open modal for creating new item
        });
    }
}

// Live Status
function initializeLiveStatus() {
    const goLiveBtn = document.querySelector('.btn-live');
    let isLive = false;
    let streamTimer = null;
    let streamSeconds = 0;

    goLiveBtn.addEventListener('click', () => {
        isLive = !isLive;
        const statusBadge = document.querySelector('.status-badge');
        const statusInfo = document.querySelector('.status-info');

        if (isLive) {
            goLiveBtn.innerHTML = '<i class="fas fa-circle pulse"></i> End Stream';
            goLiveBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            statusBadge.textContent = 'Live';
            statusBadge.classList.remove('offline');
            statusBadge.classList.add('live');

            // Start timer
            streamTimer = setInterval(() => {
                streamSeconds++;
                updateStreamTime(streamSeconds);
            }, 1000);

            // Simulate viewers
            simulateViewers();

            showNotification('Stream started! You are now live!', 'success');
        } else {
            goLiveBtn.innerHTML = '<i class="fas fa-circle pulse"></i> Go Live';
            goLiveBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            statusBadge.textContent = 'Offline';
            statusBadge.classList.remove('live');
            statusBadge.classList.add('offline');

            // Stop timer
            clearInterval(streamTimer);
            streamSeconds = 0;

            showNotification('Stream ended. Great job!', 'info');
        }

        ws.send('stream_status', {
            performer_id: 'dj_awesome',
            status: isLive ? 'live' : 'offline'
        });
    });
}

function updateStreamTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const timeStr = `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const timeElement = document.querySelector('.info-item:nth-child(2) span');
    if (timeElement) {
        timeElement.textContent = timeStr;
    }
}

function simulateViewers() {
    let viewers = 0;
    const viewerInterval = setInterval(() => {
        viewers += Math.floor(Math.random() * 5) + 1;
        const viewerElement = document.querySelector('.info-item:nth-child(1) span');
        if (viewerElement) {
            viewerElement.textContent = `${viewers} Viewers`;
        }

        // Stop simulation after a while or if stream is offline
        if (viewers > 100 || !document.querySelector('.status-badge.live')) {
            clearInterval(viewerInterval);
        }
    }, 3000);
}

// Earnings data update
function updateEarningsData(period) {
    console.log(`Updating earnings data for period: ${period}`);
    showNotification(`Loading ${period} earnings data...`, 'info');

    // In production, fetch real data from API
    ws.send('get_earnings', {
        performer_id: 'dj_awesome',
        period: period
    });
}

// Queue management
function initializeQueueManagement() {
    const queueActions = document.querySelectorAll('.queue-actions button');
    queueActions.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.querySelector('i').classList.contains('fa-arrow-up') ? 'up' :
                          btn.querySelector('i').classList.contains('fa-arrow-down') ? 'down' : 'remove';
            const queueItem = btn.closest('.queue-item');
            const songTitle = queueItem.querySelector('.song-title').textContent;

            handleQueueAction(action, songTitle, queueItem);
        });
    });
}

function handleQueueAction(action, songTitle, queueItem) {
    console.log(`Queue action: ${action} for ${songTitle}`);

    if (action === 'remove') {
        queueItem.style.transition = 'all 0.3s ease';
        queueItem.style.opacity = '0';
        queueItem.style.transform = 'translateX(-20px)';
        setTimeout(() => queueItem.remove(), 300);
        showNotification(`Removed from queue: ${songTitle}`, 'info');
    } else if (action === 'up') {
        const prev = queueItem.previousElementSibling;
        if (prev && !prev.classList.contains('now-playing')) {
            queueItem.parentNode.insertBefore(queueItem, prev);
            showNotification(`Moved up: ${songTitle}`, 'success');
        }
    } else if (action === 'down') {
        const next = queueItem.nextElementSibling;
        if (next) {
            queueItem.parentNode.insertBefore(next, queueItem);
            showNotification(`Moved down: ${songTitle}`, 'success');
        }
    }
}

// Initialize queue management
document.addEventListener('DOMContentLoaded', () => {
    initializeQueueManagement();
});

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : type === 'info' ? '#3b82f6' : '#f59e0b'};
        color: white;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Simulate real-time updates
ws.on('tip_received', (data) => {
    console.log('Tip received:', data);
    updateEarningsDisplay(data.amount);
    showNotification(`${data.tipper_name} tipped $${(data.amount / 100).toFixed(2)}!`, 'success');

    // Add to chat
    const chatMessages = document.getElementById('chatMessages');
    const tipNotification = document.createElement('div');
    tipNotification.className = 'chat-message tip-notification';
    tipNotification.innerHTML = `
        <i class="fas fa-gift"></i>
        <span><strong>${data.tipper_name}</strong> tipped $${(data.amount / 100).toFixed(2)}!</span>
    `;
    chatMessages.appendChild(tipNotification);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

function updateEarningsDisplay(amount) {
    const totalEarnings = document.querySelector('.earnings-amount');
    if (totalEarnings) {
        const current = parseFloat(totalEarnings.textContent.replace('$', '').replace(',', ''));
        const newTotal = current + (amount / 100);
        totalEarnings.textContent = `$${newTotal.toFixed(2)}`;
    }

    const todayEarnings = document.querySelector('.stat-value');
    if (todayEarnings) {
        const current = parseFloat(todayEarnings.textContent.replace('$', '').replace(',', ''));
        const newTotal = current + (amount / 100);
        todayEarnings.textContent = `$${newTotal.toFixed(2)}`;
    }
}

// Serato integration simulation
document.querySelector('.btn-secondary')?.addEventListener('click', () => {
    showNotification('Syncing with Serato DJ...', 'info');
    setTimeout(() => {
        showNotification('Successfully synced with Serato!', 'success');
    }, 1500);
});

console.log('Performer Portal initialized successfully!');
