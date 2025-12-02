#!/usr/bin/env node

/**
 * Performer Portal MCP Server
 *
 * A comprehensive MCP server for DJ/Performer portal management featuring:
 * - Dashboard: Overview of earnings, live viewers, tips
 * - Profile Manager: Bio, photos, genre selection
 * - Tip Menu Builder: Custom tip amounts and actions
 * - Live Chat: Real-time audience messaging
 * - Song Requests: Queue management from viewers
 * - Earnings Tracker: Daily/weekly/monthly stats
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Import tool definitions and implementations
import {
  dashboardTools,
  getDashboardStats,
  startLiveSession,
  endLiveSession,
  getLiveSession,
} from './tools/dashboard.js';

import {
  profileTools,
  createProfile,
  getProfile,
  updateProfile,
  addPhoto,
  removePhoto,
  setPrimaryPhoto,
  updateSocialLinks,
  updateGenres,
  enrollPerformer,
} from './tools/profile.js';

import {
  tipMenuTools,
  createTipMenu,
  getTipMenu,
  updateTipMenu,
  addTipMenuItem,
  updateTipMenuItem,
  removeTipMenuItem,
  reorderTipMenuItems,
  processTip,
  getTipsHistory,
} from './tools/tipMenu.js';

import {
  chatTools,
  createChatRoom,
  getChatRoom,
  closeChatRoom,
  sendMessage,
  getMessages,
  addViewer,
  removeViewer,
  getViewers,
  setModerator,
  banViewer,
  unbanViewer,
  deleteMessage,
  sendSystemMessage,
} from './tools/chat.js';

import {
  songRequestTools,
  submitSongRequest,
  getSongRequests,
  getSongQueue,
  updateSongRequestStatus,
  acceptSongRequest,
  declineSongRequest,
  playNextSong,
  markSongCompleted,
  getRequestSettings,
  updateRequestSettings,
  reorderQueue,
  clearQueue,
} from './tools/songRequests.js';

import {
  earningsTools,
  getEarningsSummary,
  getEarningsHistory,
  addEarningsRecord,
  getDailyBreakdown,
  getTopTippers,
  getEarningsByType,
  comparePeriods,
} from './tools/earnings.js';

import { seedDemoData, profiles, tipMenus, chatRooms, songRequests, earnings } from './utils/dataStore.js';

// Create the MCP server
const server = new Server(
  {
    name: 'performer-portal-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Seed demo data and store the performer ID
const demoPerformerId = seedDemoData();

// Combine all tools
const allTools = [
  ...dashboardTools,
  ...profileTools,
  ...tipMenuTools,
  ...chatTools,
  ...songRequestTools,
  ...earningsTools,
];

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: allTools,
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: unknown;

    switch (name) {
      // Dashboard tools
      case 'get_dashboard_stats':
        result = getDashboardStats(args as any);
        break;
      case 'start_live_session':
        result = startLiveSession(args as any);
        break;
      case 'end_live_session':
        result = endLiveSession(args as any);
        break;
      case 'get_live_session':
        result = getLiveSession(args as any);
        break;

      // Profile tools
      case 'create_profile':
        result = createProfile(args as any);
        break;
      case 'get_profile':
        result = getProfile(args as any);
        break;
      case 'update_profile':
        result = updateProfile(args as any);
        break;
      case 'add_photo':
        result = addPhoto(args as any);
        break;
      case 'remove_photo':
        result = removePhoto(args as any);
        break;
      case 'set_primary_photo':
        result = setPrimaryPhoto(args as any);
        break;
      case 'update_social_links':
        result = updateSocialLinks(args as any);
        break;
      case 'update_genres':
        result = updateGenres(args as any);
        break;
      case 'enroll_performer':
        result = enrollPerformer(args as any);
        break;

      // Tip menu tools
      case 'create_tip_menu':
        result = createTipMenu(args as any);
        break;
      case 'get_tip_menu':
        result = getTipMenu(args as any);
        break;
      case 'update_tip_menu':
        result = updateTipMenu(args as any);
        break;
      case 'add_tip_menu_item':
        result = addTipMenuItem(args as any);
        break;
      case 'update_tip_menu_item':
        result = updateTipMenuItem(args as any);
        break;
      case 'remove_tip_menu_item':
        result = removeTipMenuItem(args as any);
        break;
      case 'reorder_tip_menu_items':
        result = reorderTipMenuItems(args as any);
        break;
      case 'process_tip':
        result = processTip(args as any);
        break;
      case 'get_tips_history':
        result = getTipsHistory(args as any);
        break;

      // Chat tools
      case 'create_chat_room':
        result = createChatRoom(args as any);
        break;
      case 'get_chat_room':
        result = getChatRoom(args as any);
        break;
      case 'close_chat_room':
        result = closeChatRoom(args as any);
        break;
      case 'send_message':
        result = sendMessage(args as any);
        break;
      case 'get_messages':
        result = getMessages(args as any);
        break;
      case 'add_viewer':
        result = addViewer(args as any);
        break;
      case 'remove_viewer':
        result = removeViewer(args as any);
        break;
      case 'get_viewers':
        result = getViewers(args as any);
        break;
      case 'set_moderator':
        result = setModerator(args as any);
        break;
      case 'ban_viewer':
        result = banViewer(args as any);
        break;
      case 'unban_viewer':
        result = unbanViewer(args as any);
        break;
      case 'delete_message':
        result = deleteMessage(args as any);
        break;
      case 'send_system_message':
        result = sendSystemMessage(args as any);
        break;

      // Song request tools
      case 'submit_song_request':
        result = submitSongRequest(args as any);
        break;
      case 'get_song_requests':
        result = getSongRequests(args as any);
        break;
      case 'get_song_queue':
        result = getSongQueue(args as any);
        break;
      case 'update_song_request_status':
        result = updateSongRequestStatus(args as any);
        break;
      case 'accept_song_request':
        result = acceptSongRequest(args as any);
        break;
      case 'decline_song_request':
        result = declineSongRequest(args as any);
        break;
      case 'play_next_song':
        result = playNextSong(args as any);
        break;
      case 'mark_song_completed':
        result = markSongCompleted(args as any);
        break;
      case 'get_request_settings':
        result = getRequestSettings(args as any);
        break;
      case 'update_request_settings':
        result = updateRequestSettings(args as any);
        break;
      case 'reorder_queue':
        result = reorderQueue(args as any);
        break;
      case 'clear_queue':
        result = clearQueue(args as any);
        break;

      // Earnings tools
      case 'get_earnings_summary':
        result = getEarningsSummary(args as any);
        break;
      case 'get_earnings_history':
        result = getEarningsHistory(args as any);
        break;
      case 'add_earnings_record':
        result = addEarningsRecord(args as any);
        break;
      case 'get_daily_breakdown':
        result = getDailyBreakdown(args as any);
        break;
      case 'get_top_tippers':
        result = getTopTippers(args as any);
        break;
      case 'get_earnings_by_type':
        result = getEarningsByType(args as any);
        break;
      case 'compare_periods':
        result = comparePeriods(args as any);
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: errorMessage }),
        },
      ],
      isError: true,
    };
  }
});

// Handle resource listing
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'performer://demo',
        name: 'Demo Performer',
        description: 'Demo performer profile for testing the portal features',
        mimeType: 'application/json',
      },
      {
        uri: 'performer://stats',
        name: 'Portal Statistics',
        description: 'Overall portal statistics and counts',
        mimeType: 'application/json',
      },
    ],
  };
});

// Handle resource reading
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  switch (uri) {
    case 'performer://demo':
      const demoProfile = profiles.get(demoPerformerId);
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                performerId: demoPerformerId,
                profile: demoProfile,
                message: 'Use this performerId for testing all tools',
              },
              null,
              2
            ),
          },
        ],
      };

    case 'performer://stats':
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                totalProfiles: profiles.size,
                totalTipMenus: tipMenus.size,
                activeChatRooms: Array.from(chatRooms.values()).filter((r) => r.isActive).length,
                pendingSongRequests: Array.from(songRequests.values()).filter(
                  (r) => r.status === 'pending'
                ).length,
                totalEarningsRecords: earnings.size,
              },
              null,
              2
            ),
          },
        ],
      };

    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Performer Portal MCP Server running on stdio');
  console.error(`Demo performer ID: ${demoPerformerId}`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
