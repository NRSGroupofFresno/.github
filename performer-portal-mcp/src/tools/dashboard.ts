// Dashboard Tools - Overview of earnings, live viewers, tips

import { z } from 'zod';
import type { DashboardStats, LiveSession } from '../types/index.js';
import {
  generateId,
  profiles,
  tips,
  songRequests,
  chatMessages,
  chatRooms,
  earnings,
  liveSessions,
  getPerformerById,
  getTipsByPerformerId,
  getSongRequestsByPerformerId,
  getChatRoomByPerformerId,
  getEarningsByPerformerId,
} from '../utils/dataStore.js';

// Input schemas
export const getDashboardStatsSchema = z.object({
  performerId: z.string().describe('The unique identifier of the performer'),
});

export const startLiveSessionSchema = z.object({
  performerId: z.string().describe('The unique identifier of the performer'),
});

export const endLiveSessionSchema = z.object({
  performerId: z.string().describe('The unique identifier of the performer'),
  sessionId: z.string().describe('The unique identifier of the live session'),
});

export const getLiveSessionSchema = z.object({
  performerId: z.string().describe('The unique identifier of the performer'),
  sessionId: z.string().optional().describe('Specific session ID (optional, returns current if not provided)'),
});

// Tool implementations
export function getDashboardStats(input: z.infer<typeof getDashboardStatsSchema>): DashboardStats {
  const { performerId } = input;
  const profile = getPerformerById(performerId);

  if (!profile) {
    throw new Error(`Performer with ID ${performerId} not found`);
  }

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);

  // Calculate tips
  const allTips = getTipsByPerformerId(performerId);
  const tipsToday = allTips
    .filter((t) => t.timestamp >= todayStart)
    .reduce((sum, t) => sum + t.amount, 0);
  const tipsThisWeek = allTips
    .filter((t) => t.timestamp >= weekStart)
    .reduce((sum, t) => sum + t.amount, 0);

  // Count pending song requests
  const requests = getSongRequestsByPerformerId(performerId);
  const pendingRequests = requests.filter((r) => r.status === 'pending' || r.status === 'accepted').length;

  // Count unread messages (messages from last hour as demo)
  const chatRoom = getChatRoomByPerformerId(performerId);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  let unreadMessages = 0;
  let currentViewers = 0;
  let peakViewers = 0;

  if (chatRoom) {
    currentViewers = chatRoom.viewers.length;
    // Get messages from chat room
    for (const msg of chatMessages.values()) {
      if (msg.roomId === chatRoom.id && msg.timestamp >= oneHourAgo && msg.senderType === 'viewer') {
        unreadMessages++;
      }
    }
  }

  // Get live session info
  let streamDuration: number | undefined;
  let lastStreamDate: Date | undefined;

  for (const session of liveSessions.values()) {
    if (session.performerId === performerId) {
      if (!session.endedAt) {
        streamDuration = Math.floor((now.getTime() - session.startedAt.getTime()) / 1000);
        peakViewers = session.peakViewers;
      }
      if (!lastStreamDate || session.startedAt > lastStreamDate) {
        lastStreamDate = session.startedAt;
      }
    }
  }

  return {
    performerId,
    currentViewers,
    peakViewers,
    totalTipsToday: tipsToday,
    totalTipsThisWeek: tipsThisWeek,
    pendingSongRequests: pendingRequests,
    unreadMessages,
    isLive: profile.isLive,
    streamDuration,
    lastStreamDate,
  };
}

export function startLiveSession(input: z.infer<typeof startLiveSessionSchema>): LiveSession {
  const { performerId } = input;
  const profile = getPerformerById(performerId);

  if (!profile) {
    throw new Error(`Performer with ID ${performerId} not found`);
  }

  // Check if already live
  for (const session of liveSessions.values()) {
    if (session.performerId === performerId && !session.endedAt) {
      throw new Error('Performer already has an active live session');
    }
  }

  const sessionId = generateId();
  const session: LiveSession = {
    id: sessionId,
    performerId,
    startedAt: new Date(),
    peakViewers: 0,
    totalViewers: 0,
    totalTips: 0,
    totalSongRequests: 0,
    chatMessageCount: 0,
  };

  liveSessions.set(sessionId, session);

  // Update profile to live status
  profile.isLive = true;
  profile.updatedAt = new Date();
  profiles.set(performerId, profile);

  return session;
}

export function endLiveSession(input: z.infer<typeof endLiveSessionSchema>): LiveSession {
  const { performerId, sessionId } = input;
  const profile = getPerformerById(performerId);

  if (!profile) {
    throw new Error(`Performer with ID ${performerId} not found`);
  }

  const session = liveSessions.get(sessionId);
  if (!session) {
    throw new Error(`Session with ID ${sessionId} not found`);
  }

  if (session.performerId !== performerId) {
    throw new Error('Session does not belong to this performer');
  }

  if (session.endedAt) {
    throw new Error('Session has already ended');
  }

  session.endedAt = new Date();
  liveSessions.set(sessionId, session);

  // Update profile to offline status
  profile.isLive = false;
  profile.updatedAt = new Date();
  profiles.set(performerId, profile);

  return session;
}

export function getLiveSession(input: z.infer<typeof getLiveSessionSchema>): LiveSession | null {
  const { performerId, sessionId } = input;

  if (sessionId) {
    const session = liveSessions.get(sessionId);
    if (session && session.performerId === performerId) {
      return session;
    }
    return null;
  }

  // Find current active session
  for (const session of liveSessions.values()) {
    if (session.performerId === performerId && !session.endedAt) {
      return session;
    }
  }

  return null;
}

// Tool definitions for MCP registration
export const dashboardTools = [
  {
    name: 'get_dashboard_stats',
    description: 'Get comprehensive dashboard statistics including earnings, viewers, tips, and live status for a performer',
    inputSchema: {
      type: 'object',
      properties: {
        performerId: {
          type: 'string',
          description: 'The unique identifier of the performer',
        },
      },
      required: ['performerId'],
    },
  },
  {
    name: 'start_live_session',
    description: 'Start a new live streaming session for the performer',
    inputSchema: {
      type: 'object',
      properties: {
        performerId: {
          type: 'string',
          description: 'The unique identifier of the performer',
        },
      },
      required: ['performerId'],
    },
  },
  {
    name: 'end_live_session',
    description: 'End an active live streaming session',
    inputSchema: {
      type: 'object',
      properties: {
        performerId: {
          type: 'string',
          description: 'The unique identifier of the performer',
        },
        sessionId: {
          type: 'string',
          description: 'The unique identifier of the live session to end',
        },
      },
      required: ['performerId', 'sessionId'],
    },
  },
  {
    name: 'get_live_session',
    description: 'Get details of a specific live session or the current active session',
    inputSchema: {
      type: 'object',
      properties: {
        performerId: {
          type: 'string',
          description: 'The unique identifier of the performer',
        },
        sessionId: {
          type: 'string',
          description: 'Specific session ID (optional, returns current active session if not provided)',
        },
      },
      required: ['performerId'],
    },
  },
];
