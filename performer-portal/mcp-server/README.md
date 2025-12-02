# Performer Portal MCP Server

A Model Context Protocol (MCP) server providing tools for managing a live streaming performer platform.

## Features

### Profile Management
- Create and update performer profiles
- Manage bio, schedule, and social links
- Configure performance categories

### Tip Menu System
- Configure custom tip actions
- Set amounts and descriptions
- Integrate with Lovense devices
- Custom vibration patterns

### Earnings Tracking
- Record tip transactions
- Filter by date range
- Calculate totals and averages
- Track Stripe payment IDs

### Song Request Management
- Submit song requests with artist/title
- Accept, reject, or queue requests
- Priority requests with tips
- Real-time queue management

### Real-time Chat
- Send and receive chat messages
- Support for replies
- Chat history retrieval
- Moderator controls

## Installation

```bash
cd mcp-server
npm install
```

## Usage

### Running the Server

```bash
npm start
```

### Development Mode (with auto-reload)

```bash
npm run dev
```

## Available Tools

### 1. create_performer_profile
Create or update a performer profile.

**Parameters:**
- `performer_id` (required): Unique identifier
- `display_name` (required): Public display name
- `bio`: Biography text
- `profile_image_url`: Profile image URL
- `social_links`: Object with social media links
- `schedule`: Array of schedule objects
- `categories`: Array of performance categories

### 2. get_performer_profile
Retrieve performer profile information.

**Parameters:**
- `performer_id` (required): Performer to retrieve

### 3. configure_tip_menu
Set up or update tip menu with custom actions.

**Parameters:**
- `performer_id` (required): Performer ID
- `menu_items` (required): Array of tip menu items
  - `item_id`: Unique item identifier
  - `title`: Action title
  - `description`: Item description
  - `amount`: Tip amount in cents
  - `icon`: Emoji or icon
  - `lovense_enabled`: Enable device integration
  - `lovense_pattern`: Vibration pattern

### 4. get_tip_menu
Retrieve current tip menu configuration.

**Parameters:**
- `performer_id` (required): Performer ID

### 5. record_tip
Record a tip transaction for earnings tracking.

**Parameters:**
- `performer_id` (required): Performer ID
- `amount` (required): Tip amount in cents
- `tipper_name`: Name of tipper
- `message`: Optional message
- `tip_item_id`: Associated menu item
- `stripe_payment_id`: Stripe payment intent ID

### 6. get_earnings
Get earnings data with date range filtering.

**Parameters:**
- `performer_id` (required): Performer ID
- `start_date`: Start date (ISO 8601)
- `end_date`: End date (ISO 8601)
- `group_by`: Group by day/week/month

### 7. submit_song_request
Submit a song request to DJ/performer.

**Parameters:**
- `performer_id` (required): Performer/DJ ID
- `requester_name` (required): Requester name
- `song_title` (required): Song title
- `artist` (required): Artist name
- `tip_amount`: Optional tip for priority
- `message`: Optional message

### 8. manage_song_request
Accept, reject, or complete a song request.

**Parameters:**
- `request_id` (required): Request ID
- `action` (required): accept/reject/complete/queue
- `queue_position`: Queue position
- `rejection_reason`: Reason for rejection

### 9. get_song_requests
Get all song requests with filtering.

**Parameters:**
- `performer_id` (required): Performer/DJ ID
- `status`: Filter by pending/accepted/queued/completed/rejected

### 10. send_chat_message
Send a chat message in performer's room.

**Parameters:**
- `performer_id` (required): Performer ID
- `sender_name` (required): Sender name
- `sender_type` (required): performer/viewer/moderator
- `message` (required): Message content
- `reply_to`: Message ID being replied to

### 11. get_chat_history
Retrieve chat history.

**Parameters:**
- `performer_id` (required): Performer ID
- `limit`: Number of messages (default 50)

## Example Usage

```javascript
// Create a performer profile
{
  "performer_id": "dj_awesome",
  "display_name": "DJ Awesome",
  "bio": "Spinning the best tracks every Friday night!",
  "categories": ["DJ", "Electronic"],
  "schedule": [
    {
      "day": "Friday",
      "start_time": "20:00",
      "end_time": "23:00"
    }
  ]
}

// Configure tip menu
{
  "performer_id": "dj_awesome",
  "menu_items": [
    {
      "item_id": "request_song",
      "title": "Request a Song",
      "description": "Request your favorite track",
      "amount": 500,
      "icon": "🎵"
    },
    {
      "item_id": "shoutout",
      "title": "Shoutout",
      "description": "Get a shoutout on stream",
      "amount": 1000,
      "icon": "📢"
    }
  ]
}

// Submit song request
{
  "performer_id": "dj_awesome",
  "requester_name": "MusicFan123",
  "song_title": "One More Time",
  "artist": "Daft Punk",
  "tip_amount": 500,
  "message": "Please play this!"
}
```

## Integration with Claude Code

Add this server to your Claude Code configuration:

```json
{
  "mcpServers": {
    "performer-portal": {
      "command": "node",
      "args": ["/path/to/performer-portal/mcp-server/index.js"]
    }
  }
}
```

## Data Storage

Currently uses in-memory storage for development. For production:
- Replace with PostgreSQL/MongoDB
- Add Redis for caching
- Implement proper authentication
- Add data persistence

## Security Considerations

- Implement JWT authentication
- Validate all inputs
- Rate limit API calls
- Encrypt sensitive data
- Use HTTPS/WSS in production
- Comply with PCI DSS for payments

## Next Steps

1. Connect to real database
2. Implement Stripe integration
3. Add WebSocket support for real-time updates
4. Integrate with Lovense API
5. Connect to Serato for DJ features
6. Add AWS MediaLive for streaming
