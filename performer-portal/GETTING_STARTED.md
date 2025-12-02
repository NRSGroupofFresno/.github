# Getting Started with Performer Portal

This guide will help you get the Performer Portal up and running for demonstration or development purposes.

## 🎯 What You'll Build

A complete live streaming platform featuring:
- Interactive frontend dashboard for performers
- Real-time WebSocket communication
- Stripe payment integration for tips
- Song request management system
- MCP server for backend operations

## 📋 Prerequisites

Before you begin, ensure you have:
- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- A text editor (VS Code, Sublime, etc.)
- A modern web browser (Chrome, Firefox, Safari)

## 🚀 Step-by-Step Setup

### Step 1: View the Frontend Prototype

The quickest way to see the platform is to open the frontend prototype:

1. Navigate to the frontend directory:
   ```bash
   cd performer-portal/frontend
   ```

2. Open `index.html` in your browser, or start a simple HTTP server:
   ```bash
   # Using Python 3
   python -m http.server 8080

   # Using Python 2
   python -m SimpleHTTPServer 8080

   # Using Node.js http-server (install first: npm install -g http-server)
   http-server -p 8080
   ```

3. Open http://localhost:8080 in your browser

4. Explore the features:
   - Click "Go Live" to simulate streaming
   - Try the tip menu items
   - Send chat messages
   - Accept/reject song requests
   - View the earnings dashboard

### Step 2: Set Up the MCP Server

The MCP server provides backend tools for managing the platform:

1. Navigate to the MCP server directory:
   ```bash
   cd performer-portal/mcp-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. The MCP server is now running and provides tools for:
   - Creating performer profiles
   - Managing tip menus
   - Recording tips
   - Handling song requests
   - Chat management

### Step 3: Set Up the Backend API

For full functionality, set up the Express backend:

1. Navigate to the backend directory:
   ```bash
   cd performer-portal/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment configuration:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` file with your settings (for demo, the defaults work):
   ```env
   NODE_ENV=development
   PORT=3000
   JWT_SECRET=demo-secret-key
   STRIPE_SECRET_KEY=sk_test_your_key_here
   ```

5. Start the backend server:
   ```bash
   npm start
   ```

6. The server will start on http://localhost:3000

## 🧪 Testing the Platform

### Test the API

1. Health check:
   ```bash
   curl http://localhost:3000/health
   ```

2. Get performers:
   ```bash
   curl http://localhost:3000/api/performers
   ```

### Test WebSocket Connection

Open your browser's console on the frontend page and run:

```javascript
const ws = new WebSocket('ws://localhost:3000');
ws.onopen = () => {
  console.log('Connected to WebSocket');
  ws.send(JSON.stringify({
    type: 'join_room',
    data: { performer_id: 'dj_awesome' }
  }));
};
ws.onmessage = (event) => {
  console.log('Received:', JSON.parse(event.data));
};
```

## 🎨 Frontend Features to Explore

### Dashboard
- View earnings overview with statistics
- See real-time viewer count (when live)
- Monitor today's earnings

### Tip Menu
- View configured tip items
- See popularity statistics
- Lovense-enabled items (pink highlight)

### Song Requests
- Accept/reject/queue requests
- See priority requests (with tips)
- Manage request queue

### Live Chat
- Send and receive messages
- View tip notifications
- Real-time engagement

### Stream Controls
- Click "Go Live" to start simulation
- View stream timer
- Monitor viewer count

## 🔧 Customization

### Add Your Own Tip Menu Items

Edit `frontend/script.js` and modify the tip menu initialization:

```javascript
const customTipItems = [
  {
    icon: '🎸',
    title: 'Guitar Solo',
    price: '$15.00'
  },
  {
    icon: '🎤',
    title: 'Karaoke Request',
    price: '$20.00'
  }
];
```

### Change Theme Colors

Edit `frontend/styles.css` and modify CSS variables:

```css
:root {
    --primary-color: #6366f1;  /* Change to your brand color */
    --success-color: #10b981;
    --danger-color: #ef4444;
}
```

### Add Your Performer Profile

In the frontend, update the profile information:

```javascript
const performerProfile = {
  name: 'Your Name',
  bio: 'Your bio here',
  categories: ['Your', 'Categories']
};
```

## 🌐 Connecting to Stripe (Optional)

To enable real payments:

1. Sign up at https://stripe.com
2. Get your test API keys
3. Add to `.env`:
   ```env
   STRIPE_SECRET_KEY=sk_test_your_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_key
   ```
4. Update frontend with publishable key

## 🎥 Streaming Setup (Optional)

To enable actual video streaming:

1. Set up AWS MediaLive:
   - Create an AWS account
   - Set up MediaLive channel
   - Get access credentials

2. Update `.env`:
   ```env
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_MEDIALIVE_CHANNEL_ID=your_channel
   ```

3. Use OBS or similar software with RTMP URL

## 📱 Mobile Testing

The frontend is responsive and works on mobile:

1. Find your local IP address:
   ```bash
   # On Mac/Linux
   ifconfig | grep "inet "

   # On Windows
   ipconfig
   ```

2. Access from mobile browser:
   ```
   http://YOUR_IP_ADDRESS:8080
   ```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000 (Mac/Linux)
lsof -ti:3000 | xargs kill -9

# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### WebSocket Connection Failed
- Ensure backend is running on port 3000
- Check firewall settings
- Try using 127.0.0.1 instead of localhost

### npm install Fails
```bash
# Clear npm cache
npm cache clean --force

# Try with legacy peer deps
npm install --legacy-peer-deps
```

## 📚 Next Steps

1. **Explore the Code**
   - Check out `backend/routes/` for API endpoints
   - Look at `backend/websocket/` for real-time features
   - Review `mcp-server/index.js` for MCP tools

2. **Add Database**
   - Set up PostgreSQL or MongoDB
   - Create schema from README
   - Connect to backend

3. **Deploy to Production**
   - Choose hosting provider
   - Set up SSL certificates
   - Configure environment variables
   - Enable monitoring

4. **Customize for Your Needs**
   - Add your branding
   - Modify features
   - Integrate additional APIs

## 💡 Demo Scenarios

### Scenario 1: DJ Streaming
1. Go live with "Go Live" button
2. Accept song requests from queue
3. Receive tips for requests
4. Engage in chat with viewers

### Scenario 2: Earnings Tracking
1. View earnings dashboard
2. Check tip statistics
3. See top tippers leaderboard
4. Track growth over time

### Scenario 3: Tip Menu Management
1. Configure custom tip items
2. Set prices and descriptions
3. Enable Lovense integration
4. Track popular items

## 🎓 Learning Resources

- **Express.js**: https://expressjs.com/
- **WebSocket**: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
- **Stripe API**: https://stripe.com/docs/api
- **AWS MediaLive**: https://aws.amazon.com/medialive/

## 🤝 Need Help?

- Check the main [README.md](./README.md)
- Review [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- Open an issue on GitHub
- Join our community Discord

---

**Ready to show investors?** Open `frontend/index.html` in a browser and click "Go Live" to demonstrate the interactive features!
