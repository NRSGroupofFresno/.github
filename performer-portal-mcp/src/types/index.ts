// Performer Portal MCP Server Types

// ============================================
// PROFILE TYPES
// ============================================
export interface PerformerProfile {
  id: string;
  stageName: string;
  realName?: string;
  bio: string;
  genres: string[];
  photos: Photo[];
  socialLinks: SocialLink[];
  isLive: boolean;
  enrollmentStatus: EnrollmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Photo {
  id: string;
  url: string;
  caption?: string;
  isPrimary: boolean;
  uploadedAt: Date;
}

export interface SocialLink {
  platform: 'instagram' | 'twitter' | 'soundcloud' | 'spotify' | 'youtube' | 'tiktok' | 'other';
  url: string;
}

export type EnrollmentStatus = 'pending' | 'approved' | 'active' | 'suspended';

// ============================================
// TIP MENU TYPES
// ============================================
export interface TipMenu {
  id: string;
  performerId: string;
  name: string;
  items: TipMenuItem[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TipMenuItem {
  id: string;
  amount: number;
  currency: string;
  action: string;
  description?: string;
  isAvailable: boolean;
  sortOrder: number;
}

// ============================================
// TIP TYPES
// ============================================
export interface Tip {
  id: string;
  performerId: string;
  senderId: string;
  senderName: string;
  amount: number;
  currency: string;
  menuItemId?: string;
  action?: string;
  message?: string;
  timestamp: Date;
}

// ============================================
// CHAT TYPES
// ============================================
export interface ChatRoom {
  id: string;
  performerId: string;
  isActive: boolean;
  viewers: Viewer[];
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderType: 'performer' | 'viewer' | 'moderator' | 'system';
  content: string;
  timestamp: Date;
  isHighlighted: boolean;
  tipAmount?: number;
}

export interface Viewer {
  id: string;
  name: string;
  joinedAt: Date;
  isModerator: boolean;
  isBanned: boolean;
  totalTipped: number;
}

// ============================================
// SONG REQUEST TYPES
// ============================================
export interface SongRequest {
  id: string;
  performerId: string;
  requesterId: string;
  requesterName: string;
  songTitle: string;
  artist?: string;
  tipAmount: number;
  status: SongRequestStatus;
  priority: number;
  notes?: string;
  requestedAt: Date;
  processedAt?: Date;
}

export type SongRequestStatus = 'pending' | 'accepted' | 'playing' | 'completed' | 'declined';

export interface SongRequestSettings {
  performerId: string;
  isAcceptingRequests: boolean;
  minimumTip: number;
  priorityTipThreshold: number;
  maxQueueSize: number;
  blockedSongs: string[];
  preferredGenres: string[];
}

// ============================================
// EARNINGS TYPES
// ============================================
export interface EarningsRecord {
  id: string;
  performerId: string;
  amount: number;
  currency: string;
  type: EarningsType;
  source: string;
  description?: string;
  timestamp: Date;
}

export type EarningsType = 'tip' | 'song_request' | 'subscription' | 'donation' | 'other';

export interface EarningsSummary {
  performerId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
  startDate: Date;
  endDate: Date;
  totalEarnings: number;
  currency: string;
  breakdown: {
    tips: number;
    songRequests: number;
    subscriptions: number;
    donations: number;
    other: number;
  };
  transactionCount: number;
  averageTransaction: number;
  topTippers: {
    userId: string;
    userName: string;
    totalAmount: number;
  }[];
}

// ============================================
// DASHBOARD TYPES
// ============================================
export interface DashboardStats {
  performerId: string;
  currentViewers: number;
  peakViewers: number;
  totalTipsToday: number;
  totalTipsThisWeek: number;
  pendingSongRequests: number;
  unreadMessages: number;
  isLive: boolean;
  streamDuration?: number;
  lastStreamDate?: Date;
}

export interface LiveSession {
  id: string;
  performerId: string;
  startedAt: Date;
  endedAt?: Date;
  peakViewers: number;
  totalViewers: number;
  totalTips: number;
  totalSongRequests: number;
  chatMessageCount: number;
}

// ============================================
// NOTIFICATION TYPES
// ============================================
export interface Notification {
  id: string;
  performerId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}

export type NotificationType =
  | 'new_tip'
  | 'song_request'
  | 'new_follower'
  | 'chat_mention'
  | 'milestone'
  | 'system';
