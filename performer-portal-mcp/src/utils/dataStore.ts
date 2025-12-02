// In-memory data store for the MCP server
// In production, this would be replaced with a real database

import { v4 as uuidv4 } from 'uuid';
import type {
  PerformerProfile,
  TipMenu,
  TipMenuItem,
  Tip,
  ChatRoom,
  ChatMessage,
  Viewer,
  SongRequest,
  SongRequestSettings,
  EarningsRecord,
  DashboardStats,
  LiveSession,
  Notification,
} from '../types/index.js';

// ============================================
// DATA STORES
// ============================================
export const profiles: Map<string, PerformerProfile> = new Map();
export const tipMenus: Map<string, TipMenu> = new Map();
export const tips: Map<string, Tip> = new Map();
export const chatRooms: Map<string, ChatRoom> = new Map();
export const chatMessages: Map<string, ChatMessage> = new Map();
export const songRequests: Map<string, SongRequest> = new Map();
export const songRequestSettings: Map<string, SongRequestSettings> = new Map();
export const earnings: Map<string, EarningsRecord> = new Map();
export const liveSessions: Map<string, LiveSession> = new Map();
export const notifications: Map<string, Notification> = new Map();

// ============================================
// HELPER FUNCTIONS
// ============================================

export function generateId(): string {
  return uuidv4();
}

export function getPerformerById(performerId: string): PerformerProfile | undefined {
  return profiles.get(performerId);
}

export function getTipMenuByPerformerId(performerId: string): TipMenu | undefined {
  for (const menu of tipMenus.values()) {
    if (menu.performerId === performerId && menu.isActive) {
      return menu;
    }
  }
  return undefined;
}

export function getTipsByPerformerId(performerId: string): Tip[] {
  return Array.from(tips.values()).filter((tip) => tip.performerId === performerId);
}

export function getChatRoomByPerformerId(performerId: string): ChatRoom | undefined {
  for (const room of chatRooms.values()) {
    if (room.performerId === performerId && room.isActive) {
      return room;
    }
  }
  return undefined;
}

export function getMessagesByRoomId(roomId: string): ChatMessage[] {
  return Array.from(chatMessages.values())
    .filter((msg) => msg.roomId === roomId)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

export function getSongRequestsByPerformerId(performerId: string): SongRequest[] {
  return Array.from(songRequests.values())
    .filter((req) => req.performerId === performerId)
    .sort((a, b) => b.priority - a.priority || a.requestedAt.getTime() - b.requestedAt.getTime());
}

export function getEarningsByPerformerId(
  performerId: string,
  startDate?: Date,
  endDate?: Date
): EarningsRecord[] {
  return Array.from(earnings.values()).filter((earning) => {
    if (earning.performerId !== performerId) return false;
    if (startDate && earning.timestamp < startDate) return false;
    if (endDate && earning.timestamp > endDate) return false;
    return true;
  });
}

export function getNotificationsByPerformerId(
  performerId: string,
  unreadOnly = false
): Notification[] {
  return Array.from(notifications.values())
    .filter((n) => n.performerId === performerId && (!unreadOnly || !n.isRead))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// ============================================
// SEED DATA FUNCTION
// ============================================
export function seedDemoData(): string {
  const performerId = generateId();
  const now = new Date();

  // Create demo performer profile
  const profile: PerformerProfile = {
    id: performerId,
    stageName: 'DJ Stellar',
    realName: 'Alex Johnson',
    bio: 'Electronic music producer and live DJ. Specializing in house, techno, and ambient sets. Taking requests and spinning your favorites!',
    genres: ['House', 'Techno', 'Electronic', 'Ambient'],
    photos: [
      {
        id: generateId(),
        url: '/images/profile-main.jpg',
        caption: 'Live at Club Nebula',
        isPrimary: true,
        uploadedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        id: generateId(),
        url: '/images/profile-booth.jpg',
        caption: 'In the booth',
        isPrimary: false,
        uploadedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      },
    ],
    socialLinks: [
      { platform: 'instagram', url: 'https://instagram.com/djstellar' },
      { platform: 'soundcloud', url: 'https://soundcloud.com/djstellar' },
      { platform: 'spotify', url: 'https://open.spotify.com/artist/djstellar' },
    ],
    isLive: true,
    enrollmentStatus: 'active',
    createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
    updatedAt: now,
  };
  profiles.set(performerId, profile);

  // Create tip menu
  const tipMenuId = generateId();
  const tipMenu: TipMenu = {
    id: tipMenuId,
    performerId,
    name: 'DJ Stellar Tip Menu',
    items: [
      {
        id: generateId(),
        amount: 5,
        currency: 'USD',
        action: 'Shoutout',
        description: "I'll give you a shoutout on stream!",
        isAvailable: true,
        sortOrder: 1,
      },
      {
        id: generateId(),
        amount: 10,
        currency: 'USD',
        action: 'Song Request',
        description: 'Request any song (genre must match)',
        isAvailable: true,
        sortOrder: 2,
      },
      {
        id: generateId(),
        amount: 25,
        currency: 'USD',
        action: 'Priority Request',
        description: 'Your song plays next!',
        isAvailable: true,
        sortOrder: 3,
      },
      {
        id: generateId(),
        amount: 50,
        currency: 'USD',
        action: 'Dedication',
        description: 'Dedicate a song to someone special',
        isAvailable: true,
        sortOrder: 4,
      },
      {
        id: generateId(),
        amount: 100,
        currency: 'USD',
        action: 'VIP Mix',
        description: '15-minute custom mix just for you',
        isAvailable: true,
        sortOrder: 5,
      },
    ],
    isActive: true,
    createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
    updatedAt: now,
  };
  tipMenus.set(tipMenuId, tipMenu);

  // Create demo tips
  const tipAmounts = [5, 10, 25, 10, 5, 50, 5, 10, 25, 100];
  const tipperNames = ['CoolCat', 'MusicLover', 'NightOwl', 'BeatDropper', 'VibeChecker'];

  for (let i = 0; i < 10; i++) {
    const tipId = generateId();
    const tip: Tip = {
      id: tipId,
      performerId,
      senderId: generateId(),
      senderName: tipperNames[i % tipperNames.length],
      amount: tipAmounts[i],
      currency: 'USD',
      message: i % 3 === 0 ? 'Love your music!' : undefined,
      timestamp: new Date(now.getTime() - (10 - i) * 30 * 60 * 1000),
    };
    tips.set(tipId, tip);
  }

  // Create chat room
  const chatRoomId = generateId();
  const chatRoom: ChatRoom = {
    id: chatRoomId,
    performerId,
    isActive: true,
    viewers: [
      { id: generateId(), name: 'CoolCat', joinedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), isModerator: false, isBanned: false, totalTipped: 45 },
      { id: generateId(), name: 'MusicLover', joinedAt: new Date(now.getTime() - 1.5 * 60 * 60 * 1000), isModerator: true, isBanned: false, totalTipped: 120 },
      { id: generateId(), name: 'NightOwl', joinedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000), isModerator: false, isBanned: false, totalTipped: 30 },
    ],
    createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
  };
  chatRooms.set(chatRoomId, chatRoom);

  // Create chat messages
  const messages = [
    { sender: 'MusicLover', content: 'This track is fire!', type: 'viewer' as const },
    { sender: 'DJ Stellar', content: 'Thanks everyone for being here tonight!', type: 'performer' as const },
    { sender: 'CoolCat', content: 'Can you play some deep house?', type: 'viewer' as const },
    { sender: 'NightOwl', content: 'Been waiting for this set all week', type: 'viewer' as const },
    { sender: 'System', content: 'MusicLover tipped $25 for Priority Request', type: 'system' as const },
  ];

  messages.forEach((msg, i) => {
    const msgId = generateId();
    const chatMessage: ChatMessage = {
      id: msgId,
      roomId: chatRoomId,
      senderId: generateId(),
      senderName: msg.sender,
      senderType: msg.type,
      content: msg.content,
      timestamp: new Date(now.getTime() - (5 - i) * 5 * 60 * 1000),
      isHighlighted: msg.type === 'system',
    };
    chatMessages.set(msgId, chatMessage);
  });

  // Create song requests
  const songRequestData = [
    { title: 'Strobe', artist: 'Deadmau5', status: 'pending' as const, tip: 10 },
    { title: 'Opus', artist: 'Eric Prydz', status: 'accepted' as const, tip: 25 },
    { title: 'Sandstorm', artist: 'Darude', status: 'playing' as const, tip: 25 },
    { title: 'Levels', artist: 'Avicii', status: 'completed' as const, tip: 10 },
  ];

  songRequestData.forEach((req, i) => {
    const reqId = generateId();
    const songRequest: SongRequest = {
      id: reqId,
      performerId,
      requesterId: generateId(),
      requesterName: tipperNames[i % tipperNames.length],
      songTitle: req.title,
      artist: req.artist,
      tipAmount: req.tip,
      status: req.status,
      priority: req.tip >= 25 ? 2 : 1,
      requestedAt: new Date(now.getTime() - (4 - i) * 15 * 60 * 1000),
    };
    songRequests.set(reqId, songRequest);
  });

  // Create song request settings
  const settings: SongRequestSettings = {
    performerId,
    isAcceptingRequests: true,
    minimumTip: 10,
    priorityTipThreshold: 25,
    maxQueueSize: 20,
    blockedSongs: ['Baby Shark'],
    preferredGenres: ['House', 'Techno', 'Electronic'],
  };
  songRequestSettings.set(performerId, settings);

  // Create earnings records
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let day = 0; day < 30; day++) {
    const dayDate = new Date(today.getTime() - day * 24 * 60 * 60 * 1000);
    const dailyTips = Math.floor(Math.random() * 200) + 50;
    const dailySongRequests = Math.floor(Math.random() * 100) + 20;

    const tipEarning: EarningsRecord = {
      id: generateId(),
      performerId,
      amount: dailyTips,
      currency: 'USD',
      type: 'tip',
      source: 'Live Stream Tips',
      timestamp: dayDate,
    };
    earnings.set(tipEarning.id, tipEarning);

    const songEarning: EarningsRecord = {
      id: generateId(),
      performerId,
      amount: dailySongRequests,
      currency: 'USD',
      type: 'song_request',
      source: 'Song Requests',
      timestamp: dayDate,
    };
    earnings.set(songEarning.id, songEarning);
  }

  // Create live session
  const sessionId = generateId();
  const liveSession: LiveSession = {
    id: sessionId,
    performerId,
    startedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    peakViewers: 156,
    totalViewers: 312,
    totalTips: 245,
    totalSongRequests: 12,
    chatMessageCount: 487,
  };
  liveSessions.set(sessionId, liveSession);

  return performerId;
}
