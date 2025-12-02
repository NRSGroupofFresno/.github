# Performer Portal MCP Server

A comprehensive Model Context Protocol (MCP) server for managing DJ/Performer portals. This server provides tools for performers to manage their profiles, interact with audiences, accept song requests, and track earnings.

## Features

### Dashboard
- Real-time overview of earnings, live viewers, and tips
- Live session management (start/end streaming)
- Current performance metrics

### Profile Manager
- Create and update performer profiles
- Manage photos and set primary profile image
- Genre selection and music style preferences
- Social media links (Instagram, Spotify, SoundCloud, etc.)
- Performer enrollment status tracking

### Tip Menu Builder
- Create custom tip menus with various amounts and actions
- Dynamic menu item management (add, update, remove, reorder)
- Process incoming tips with menu item associations
- Tip history and analytics

### Live Chat
- Create and manage chat rooms
- Real-time messaging between performers and viewers
- Moderation tools (ban/unban users, delete messages)
- Viewer management and moderator assignments
- System announcements and highlighted messages

### Song Requests
- Accept and manage song requests from viewers
- Queue management with priority ordering
- Customizable request settings (minimum tip, blocked songs, etc.)
- Request status tracking (pending, accepted, playing, completed)
- Automatic priority boost for higher tips

### Earnings Tracker
- Daily, weekly, monthly, and all-time earnings summaries
- Breakdown by earnings type (tips, song requests, subscriptions)
- Top tippers leaderboard
- Period comparison and trend analysis
- Detailed transaction history

## Installation

```bash
npm install
```

## Building

```bash
npm run build
```

## Running

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

## Configuration

Add to your Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "performer-portal": {
      "command": "node",
      "args": ["/path/to/performer-portal-mcp/dist/index.js"]
    }
  }
}
```

## Available Tools

### Dashboard Tools
| Tool | Description |
|------|-------------|
| `get_dashboard_stats` | Get comprehensive dashboard statistics |
| `start_live_session` | Start a new live streaming session |
| `end_live_session` | End an active live streaming session |
| `get_live_session` | Get details of current or specific live session |

### Profile Tools
| Tool | Description |
|------|-------------|
| `create_profile` | Create a new performer profile |
| `get_profile` | Retrieve a performer profile |
| `update_profile` | Update profile information |
| `add_photo` | Add a photo to the profile |
| `remove_photo` | Remove a photo from the profile |
| `set_primary_photo` | Set the primary profile photo |
| `update_social_links` | Update social media links |
| `update_genres` | Update music genre preferences |
| `enroll_performer` | Update enrollment status |

### Tip Menu Tools
| Tool | Description |
|------|-------------|
| `create_tip_menu` | Create a new tip menu |
| `get_tip_menu` | Get the active tip menu |
| `update_tip_menu` | Update tip menu settings |
| `add_tip_menu_item` | Add a new menu item |
| `update_tip_menu_item` | Update an existing menu item |
| `remove_tip_menu_item` | Remove a menu item |
| `reorder_tip_menu_items` | Reorder menu items |
| `process_tip` | Process an incoming tip |
| `get_tips_history` | Get tip history |

### Chat Tools
| Tool | Description |
|------|-------------|
| `create_chat_room` | Create a chat room |
| `get_chat_room` | Get chat room details |
| `close_chat_room` | Close an active chat room |
| `send_message` | Send a chat message |
| `get_messages` | Get chat messages |
| `add_viewer` | Add a viewer to the room |
| `remove_viewer` | Remove a viewer |
| `get_viewers` | Get list of viewers |
| `set_moderator` | Set moderator status |
| `ban_viewer` | Ban a viewer |
| `unban_viewer` | Unban a viewer |
| `delete_message` | Delete a message |
| `send_system_message` | Send a system announcement |

### Song Request Tools
| Tool | Description |
|------|-------------|
| `submit_song_request` | Submit a new song request |
| `get_song_requests` | Get all song requests |
| `get_song_queue` | Get the current queue |
| `update_song_request_status` | Update request status |
| `accept_song_request` | Accept a pending request |
| `decline_song_request` | Decline a request |
| `play_next_song` | Start playing the next song |
| `mark_song_completed` | Mark a song as completed |
| `get_request_settings` | Get request settings |
| `update_request_settings` | Update request settings |
| `reorder_queue` | Reorder the queue |
| `clear_queue` | Clear all pending requests |

### Earnings Tools
| Tool | Description |
|------|-------------|
| `get_earnings_summary` | Get earnings summary for a period |
| `get_earnings_history` | Get detailed earnings history |
| `add_earnings_record` | Add a manual earnings record |
| `get_daily_breakdown` | Get day-by-day breakdown |
| `get_top_tippers` | Get top tippers list |
| `get_earnings_by_type` | Get breakdown by type |
| `compare_periods` | Compare two time periods |

## Resources

The server exposes two resources:

| URI | Description |
|-----|-------------|
| `performer://demo` | Demo performer profile for testing |
| `performer://stats` | Overall portal statistics |

## Demo Data

The server automatically seeds demo data on startup, including:
- A demo performer profile (DJ Stellar)
- Sample tip menu with 5 tiers
- Recent tips from various viewers
- Active chat room with messages
- Song request queue with various statuses
- 30 days of earnings history

Use the demo performer ID returned at startup for testing all features.

## License

MIT
