# Performer Portal

A comprehensive live streaming platform for performers (DJs, musicians, dancers) with real-time chat, tipping, song requests, and interactive features.

## 🎯 Features

### For Performers
- **Live Streaming** - Stream performances with AWS MediaLive integration
- **Profile Management** - Customizable profiles with bio, schedule, and categories
- **Tip Menu** - Configure custom tip actions with amounts and descriptions
- **Earnings Dashboard** - Track tips, subscriptions, and payouts in real-time
- **Song Request Management** - Accept, queue, or reject song requests from audience
- **Real-time Chat** - Engage with audience through live chat with moderation tools
- **Lovense Integration** - Interactive device triggers based on tips
- **Serato Integration** - Sync DJ playlists and track information

### For Viewers
- **Live Stream Viewing** - High-quality video streaming
- **Interactive Tipping** - Support performers with custom tip options
- **Song Requests** - Request favorite tracks with optional priority tipping
- **Real-time Chat** - Engage with performers and other viewers
- **Subscriptions** - Subscribe to favorite performers for exclusive content

## 🏗️ Architecture

```
performer-portal/
├── mcp-server/          # MCP server for management tools
├── frontend/            # HTML/CSS/JS frontend prototype
├── backend/             # Node.js/Express backend
│   ├── controllers/     # Request handlers
│   ├── routes/          # API routes
│   ├── models/          # Data models
│   ├── websocket/       # WebSocket handlers
│   └── middleware/      # Authentication & validation
└── docs/                # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL or MongoDB
- Redis (for session management)
- Stripe account (for payments)
- AWS account (for MediaLive streaming)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd performer-portal
   ```

2. **Set up MCP Server**
   ```bash
   cd mcp-server
   npm install
   npm start
   ```

3. **Set up Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm start
   ```

4. **Set up Frontend**
   ```bash
   cd frontend
   # Open index.html in a web browser
   # Or use a simple HTTP server:
   python -m http.server 8080
   ```

### Configuration

Edit `backend/.env` with your settings:

```env
# Required
STRIPE_SECRET_KEY=sk_test_your_key
JWT_SECRET=your_secret_key
DB_HOST=localhost

# Optional
AWS_ACCESS_KEY_ID=your_aws_key
LOVENSE_API_KEY=your_lovense_key
SERATO_API_KEY=your_serato_key
```

## 📡 API Documentation

### Authentication
```bash
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
```

### Performers
```bash
GET    /api/performers              # List all performers
GET    /api/performers/:id          # Get performer profile
POST   /api/performers              # Create profile (auth required)
PUT    /api/performers/:id          # Update profile (auth required)
GET    /api/performers/:id/earnings # Get earnings (auth required)
```

### Tips
```bash
POST   /api/tips/create-payment-intent  # Create Stripe payment
POST   /api/tips/process                # Process tip after payment
GET    /api/tips/history/:performerId   # Get tip history
GET    /api/tips/leaderboard/:performerId # Get top tippers
```

### Song Requests
```bash
POST   /api/song-requests/submit         # Submit song request
GET    /api/song-requests/:performerId   # Get requests
PATCH  /api/song-requests/:id/status     # Accept/reject/queue
GET    /api/song-requests/:id/queue      # Get current queue
```

### Streaming
```bash
POST   /api/stream/start                 # Start stream
POST   /api/stream/end                   # End stream
GET    /api/stream/:performerId/status   # Get stream status
GET    /api/stream/key                   # Get streaming key
```

## 🔌 WebSocket Events

### Client → Server
```javascript
{
  type: 'join_room',
  data: { performer_id: 'dj_awesome' }
}

{
  type: 'chat_message',
  data: {
    performer_id: 'dj_awesome',
    message: 'Hello!',
    sender_name: 'User123'
  }
}

{
  type: 'tip',
  data: {
    performer_id: 'dj_awesome',
    amount: 500,
    tipper_name: 'User123'
  }
}
```

### Server → Client
```javascript
{
  type: 'chat_message',
  message_id: 'msg_123',
  sender_name: 'User123',
  message: 'Hello!',
  timestamp: '2024-01-01T12:00:00Z'
}

{
  type: 'tip_received',
  tip_id: 'tip_123',
  amount: 500,
  tipper_name: 'User123',
  timestamp: '2024-01-01T12:00:00Z'
}

{
  type: 'viewer_count',
  count: 42
}
```

## 💳 Stripe Integration

### Setup
1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Dashboard
3. Set up webhook endpoint: `https://your-domain.com/api/tips/webhook`
4. Add webhook secret to `.env`

### Payment Flow
1. Frontend creates payment intent via `/api/tips/create-payment-intent`
2. User completes payment with Stripe.js
3. Backend processes tip via `/api/tips/process`
4. WebSocket notification sent to all viewers
5. Lovense trigger (if applicable)

## 🎮 Lovense Integration

Configure interactive device responses to tips:

```javascript
{
  "tip_item_id": "vibe_control",
  "title": "Vibe Control",
  "amount": 2000,
  "lovense_enabled": true,
  "lovense_pattern": "pulse",
  "duration": 5000,
  "intensity": 80
}
```

## 🎵 Serato Integration

Sync with Serato DJ for:
- Current track information
- Playlist synchronization
- Song request matching

## 📊 Database Schema

### Users
```sql
CREATE TABLE users (
  user_id VARCHAR PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  username VARCHAR UNIQUE NOT NULL,
  user_type VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Performers
```sql
CREATE TABLE performers (
  performer_id VARCHAR PRIMARY KEY,
  user_id VARCHAR REFERENCES users(user_id),
  display_name VARCHAR NOT NULL,
  bio TEXT,
  profile_image_url VARCHAR,
  is_live BOOLEAN DEFAULT FALSE,
  streaming_key VARCHAR UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tips
```sql
CREATE TABLE tips (
  tip_id VARCHAR PRIMARY KEY,
  performer_id VARCHAR REFERENCES performers(performer_id),
  amount INTEGER NOT NULL,
  tipper_name VARCHAR,
  message TEXT,
  stripe_payment_id VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔒 Security

- JWT authentication for API endpoints
- HTTPS/WSS encryption for all connections
- Rate limiting to prevent abuse
- Input validation and sanitization
- PCI DSS compliance via Stripe
- Helmet.js security headers
- CORS configuration

## 🚢 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secrets
- [ ] Configure database connection pooling
- [ ] Set up Redis for session storage
- [ ] Configure AWS MediaLive channels
- [ ] Set up CDN for static assets
- [ ] Enable SSL certificates
- [ ] Configure backup strategy
- [ ] Set up monitoring and logging
- [ ] Configure Stripe webhook endpoint

### Recommended Services
- **Hosting**: AWS EC2, DigitalOcean, Heroku
- **Database**: AWS RDS (PostgreSQL), MongoDB Atlas
- **Cache**: AWS ElastiCache (Redis)
- **Streaming**: AWS MediaLive + CloudFront
- **CDN**: CloudFlare, AWS CloudFront
- **Monitoring**: DataDog, New Relic

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run integration tests
npm run test:integration

# Run load tests
npm run test:load
```

## 📈 Performance Optimization

- **WebSocket**: Efficient real-time communication
- **Redis**: Fast session and cache storage
- **CDN**: Distribute static assets globally
- **Database Indexing**: Optimize query performance
- **Connection Pooling**: Reuse database connections
- **Compression**: Gzip/Brotli compression
- **Lazy Loading**: Load resources on demand

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support, email support@performerportal.com or join our Discord community.

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core platform architecture
- ✅ MCP server implementation
- ✅ Frontend prototype
- ✅ Backend API structure
- ✅ WebSocket real-time features
- ✅ Stripe integration

### Phase 2 (Next)
- [ ] Database implementation
- [ ] User authentication system
- [ ] AWS MediaLive integration
- [ ] Mobile responsive design
- [ ] Admin dashboard
- [ ] Analytics and reporting

### Phase 3 (Future)
- [ ] Mobile apps (iOS/Android)
- [ ] Advanced moderation tools
- [ ] Multi-streaming support
- [ ] Virtual gifts and animations
- [ ] Affiliate program
- [ ] White-label solution

## 💡 Use Cases

- **DJs**: Stream DJ sets with song requests and interactive features
- **Musicians**: Live performances with tip-based requests
- **Dancers**: Interactive performances with viewer engagement
- **Fitness Instructors**: Live classes with subscriber access
- **Educators**: Live teaching sessions with Q&A

## 🔗 Additional Resources

- [MCP Server Documentation](./mcp-server/README.md)
- [Architecture Overview](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API.md)
- [WebSocket Protocol](./docs/WEBSOCKET.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

---

Built with ❤️ for performers and their communities
