// Song Requests Tools - Queue management from viewers

import { z } from 'zod';
import type { SongRequest, SongRequestSettings, SongRequestStatus } from '../types/index.js';
import {
  generateId,
  songRequests,
  songRequestSettings,
  earnings,
  getPerformerById,
  getSongRequestsByPerformerId,
} from '../utils/dataStore.js';

// Input schemas
export const submitSongRequestSchema = z.object({
  performerId: z.string().describe('The unique identifier of the performer'),
  requesterId: z.string().describe('The unique identifier of the requester'),
  requesterName: z.string().describe('Display name of the requester'),
  songTitle: z.string().describe('Title of the requested song'),
  artist: z.string().optional().describe('Artist name'),
  tipAmount: z.number().min(0).describe('Tip amount for the request'),
  notes: z.string().optional().describe('Additional notes for the DJ'),
});

export const getSongRequestsSchema = z.object({
  performerId: z.string().describe('The unique identifier of the performer'),
  status: z.enum(['pending', 'accepted', 'playing', 'completed', 'declined']).optional().describe('Filter by status'),
  limit: z.number().optional().default(50).describe('Maximum number of requests to return'),
});

export const getSongQueueSchema = z.object({
  performerId: z.string().describe('The unique identifier of the performer'),
});

export const updateSongRequestStatusSchema = z.object({
  requestId: z.string().describe('The unique identifier of the song request'),
  status: z.enum(['pending', 'accepted', 'playing', 'completed', 'declined']).describe('New status'),
});

export const acceptSongRequestSchema = z.object({
  requestId: z.string().describe('The unique identifier of the song request'),
});

export const declineSongRequestSchema = z.object({
  requestId: z.string().describe('The unique identifier of the song request'),
  reason: z.string().optional().describe('Reason for declining'),
});

export const playNextSongSchema = z.object({
  performerId: z.string().describe('The unique identifier of the performer'),
});

export const markSongCompletedSchema = z.object({
  requestId: z.string().describe('The unique identifier of the song request'),
});

export const getRequestSettingsSchema = z.object({
  performerId: z.string().describe('The unique identifier of the performer'),
});

export const updateRequestSettingsSchema = z.object({
  performerId: z.string().describe('The unique identifier of the performer'),
  isAcceptingRequests: z.boolean().optional().describe('Whether accepting requests'),
  minimumTip: z.number().optional().describe('Minimum tip for requests'),
  priorityTipThreshold: z.number().optional().describe('Tip amount for priority placement'),
  maxQueueSize: z.number().optional().describe('Maximum queue size'),
  blockedSongs: z.array(z.string()).optional().describe('List of blocked songs'),
  preferredGenres: z.array(z.string()).optional().describe('Preferred genres'),
});

export const reorderQueueSchema = z.object({
  performerId: z.string().describe('The unique identifier of the performer'),
  requestIds: z.array(z.string()).describe('Ordered list of request IDs'),
});

export const clearQueueSchema = z.object({
  performerId: z.string().describe('The unique identifier of the performer'),
  markAsCompleted: z.boolean().optional().default(false).describe('Mark all as completed instead of declining'),
});

// Tool implementations
export function submitSongRequest(input: z.infer<typeof submitSongRequestSchema>): SongRequest {
  const profile = getPerformerById(input.performerId);
  if (!profile) {
    throw new Error(`Performer with ID ${input.performerId} not found`);
  }

  // Check settings
  const settings = songRequestSettings.get(input.performerId);
  if (settings) {
    if (!settings.isAcceptingRequests) {
      throw new Error('This performer is not currently accepting song requests');
    }

    if (input.tipAmount < settings.minimumTip) {
      throw new Error(`Minimum tip for song requests is $${settings.minimumTip}`);
    }

    // Check queue size
    const currentQueue = getSongRequestsByPerformerId(input.performerId)
      .filter((r) => r.status === 'pending' || r.status === 'accepted');
    if (currentQueue.length >= settings.maxQueueSize) {
      throw new Error('Song request queue is full. Please try again later.');
    }

    // Check blocked songs
    if (settings.blockedSongs.some((blocked) =>
      input.songTitle.toLowerCase().includes(blocked.toLowerCase())
    )) {
      throw new Error('This song is not available for requests');
    }
  }

  const requestId = generateId();
  const now = new Date();

  // Determine priority based on tip amount
  let priority = 1;
  if (settings && input.tipAmount >= settings.priorityTipThreshold) {
    priority = 2;
  }

  const request: SongRequest = {
    id: requestId,
    performerId: input.performerId,
    requesterId: input.requesterId,
    requesterName: input.requesterName,
    songTitle: input.songTitle,
    artist: input.artist,
    tipAmount: input.tipAmount,
    status: 'pending',
    priority,
    notes: input.notes,
    requestedAt: now,
  };

  songRequests.set(requestId, request);

  // Record earnings
  if (input.tipAmount > 0) {
    const earningsId = generateId();
    earnings.set(earningsId, {
      id: earningsId,
      performerId: input.performerId,
      amount: input.tipAmount,
      currency: 'USD',
      type: 'song_request',
      source: `Song request from ${input.requesterName}`,
      description: `${input.songTitle}${input.artist ? ` by ${input.artist}` : ''}`,
      timestamp: now,
    });
  }

  return request;
}

export function getSongRequests(input: z.infer<typeof getSongRequestsSchema>): SongRequest[] {
  let requests = getSongRequestsByPerformerId(input.performerId);

  if (input.status) {
    requests = requests.filter((r) => r.status === input.status);
  }

  return requests.slice(0, input.limit || 50);
}

export function getSongQueue(input: z.infer<typeof getSongQueueSchema>): SongRequest[] {
  return getSongRequestsByPerformerId(input.performerId)
    .filter((r) => r.status === 'pending' || r.status === 'accepted' || r.status === 'playing')
    .sort((a, b) => {
      // Playing songs first
      if (a.status === 'playing' && b.status !== 'playing') return -1;
      if (b.status === 'playing' && a.status !== 'playing') return 1;

      // Then by priority (higher first)
      if (a.priority !== b.priority) return b.priority - a.priority;

      // Then by request time (older first)
      return a.requestedAt.getTime() - b.requestedAt.getTime();
    });
}

export function updateSongRequestStatus(input: z.infer<typeof updateSongRequestStatusSchema>): SongRequest {
  const request = songRequests.get(input.requestId);
  if (!request) {
    throw new Error(`Song request with ID ${input.requestId} not found`);
  }

  request.status = input.status;
  if (input.status === 'completed' || input.status === 'declined') {
    request.processedAt = new Date();
  }

  songRequests.set(input.requestId, request);
  return request;
}

export function acceptSongRequest(input: z.infer<typeof acceptSongRequestSchema>): SongRequest {
  const request = songRequests.get(input.requestId);
  if (!request) {
    throw new Error(`Song request with ID ${input.requestId} not found`);
  }

  if (request.status !== 'pending') {
    throw new Error(`Cannot accept request in ${request.status} status`);
  }

  request.status = 'accepted';
  songRequests.set(input.requestId, request);

  return request;
}

export function declineSongRequest(input: z.infer<typeof declineSongRequestSchema>): SongRequest {
  const request = songRequests.get(input.requestId);
  if (!request) {
    throw new Error(`Song request with ID ${input.requestId} not found`);
  }

  request.status = 'declined';
  request.processedAt = new Date();
  if (input.reason) {
    request.notes = `Declined: ${input.reason}`;
  }

  songRequests.set(input.requestId, request);
  return request;
}

export function playNextSong(input: z.infer<typeof playNextSongSchema>): SongRequest | null {
  const queue = getSongQueue({ performerId: input.performerId });

  // Mark current playing as completed
  const currentlyPlaying = queue.find((r) => r.status === 'playing');
  if (currentlyPlaying) {
    currentlyPlaying.status = 'completed';
    currentlyPlaying.processedAt = new Date();
    songRequests.set(currentlyPlaying.id, currentlyPlaying);
  }

  // Find next song to play (accepted or pending, highest priority)
  const nextSong = queue.find((r) => r.status === 'accepted' || r.status === 'pending');
  if (nextSong) {
    nextSong.status = 'playing';
    songRequests.set(nextSong.id, nextSong);
    return nextSong;
  }

  return null;
}

export function markSongCompleted(input: z.infer<typeof markSongCompletedSchema>): SongRequest {
  const request = songRequests.get(input.requestId);
  if (!request) {
    throw new Error(`Song request with ID ${input.requestId} not found`);
  }

  request.status = 'completed';
  request.processedAt = new Date();
  songRequests.set(input.requestId, request);

  return request;
}

export function getRequestSettings(input: z.infer<typeof getRequestSettingsSchema>): SongRequestSettings {
  let settings = songRequestSettings.get(input.performerId);

  if (!settings) {
    // Create default settings
    settings = {
      performerId: input.performerId,
      isAcceptingRequests: true,
      minimumTip: 5,
      priorityTipThreshold: 20,
      maxQueueSize: 25,
      blockedSongs: [],
      preferredGenres: [],
    };
    songRequestSettings.set(input.performerId, settings);
  }

  return settings;
}

export function updateRequestSettings(input: z.infer<typeof updateRequestSettingsSchema>): SongRequestSettings {
  let settings = songRequestSettings.get(input.performerId);

  if (!settings) {
    settings = {
      performerId: input.performerId,
      isAcceptingRequests: true,
      minimumTip: 5,
      priorityTipThreshold: 20,
      maxQueueSize: 25,
      blockedSongs: [],
      preferredGenres: [],
    };
  }

  if (input.isAcceptingRequests !== undefined) settings.isAcceptingRequests = input.isAcceptingRequests;
  if (input.minimumTip !== undefined) settings.minimumTip = input.minimumTip;
  if (input.priorityTipThreshold !== undefined) settings.priorityTipThreshold = input.priorityTipThreshold;
  if (input.maxQueueSize !== undefined) settings.maxQueueSize = input.maxQueueSize;
  if (input.blockedSongs !== undefined) settings.blockedSongs = input.blockedSongs;
  if (input.preferredGenres !== undefined) settings.preferredGenres = input.preferredGenres;

  songRequestSettings.set(input.performerId, settings);
  return settings;
}

export function reorderQueue(input: z.infer<typeof reorderQueueSchema>): SongRequest[] {
  const queue = getSongQueue({ performerId: input.performerId });

  // Validate all IDs exist
  for (const requestId of input.requestIds) {
    if (!queue.find((r) => r.id === requestId)) {
      throw new Error(`Song request with ID ${requestId} not found in queue`);
    }
  }

  // Update priorities based on order
  input.requestIds.forEach((requestId, index) => {
    const request = songRequests.get(requestId);
    if (request && request.status !== 'playing') {
      // Use priority to maintain order (higher = play first)
      request.priority = input.requestIds.length - index;
      songRequests.set(requestId, request);
    }
  });

  return getSongQueue({ performerId: input.performerId });
}

export function clearQueue(input: z.infer<typeof clearQueueSchema>): number {
  const queue = getSongQueue({ performerId: input.performerId });
  const status: SongRequestStatus = input.markAsCompleted ? 'completed' : 'declined';
  let count = 0;

  for (const request of queue) {
    if (request.status !== 'playing') {
      request.status = status;
      request.processedAt = new Date();
      songRequests.set(request.id, request);
      count++;
    }
  }

  return count;
}

// Tool definitions for MCP registration
export const songRequestTools = [
  {
    name: 'submit_song_request',
    description: 'Submit a new song request from a viewer',
    inputSchema: {
      type: 'object',
      properties: {
        performerId: { type: 'string', description: 'The unique identifier of the performer' },
        requesterId: { type: 'string', description: 'The unique identifier of the requester' },
        requesterName: { type: 'string', description: 'Display name of the requester' },
        songTitle: { type: 'string', description: 'Title of the requested song' },
        artist: { type: 'string', description: 'Artist name' },
        tipAmount: { type: 'number', description: 'Tip amount for the request' },
        notes: { type: 'string', description: 'Additional notes for the DJ' },
      },
      required: ['performerId', 'requesterId', 'requesterName', 'songTitle', 'tipAmount'],
    },
  },
  {
    name: 'get_song_requests',
    description: 'Get all song requests for a performer with optional status filter',
    inputSchema: {
      type: 'object',
      properties: {
        performerId: { type: 'string', description: 'The unique identifier of the performer' },
        status: {
          type: 'string',
          enum: ['pending', 'accepted', 'playing', 'completed', 'declined'],
          description: 'Filter by status',
        },
        limit: { type: 'number', description: 'Maximum number of requests to return' },
      },
      required: ['performerId'],
    },
  },
  {
    name: 'get_song_queue',
    description: 'Get the current song request queue (pending, accepted, and playing)',
    inputSchema: {
      type: 'object',
      properties: {
        performerId: { type: 'string', description: 'The unique identifier of the performer' },
      },
      required: ['performerId'],
    },
  },
  {
    name: 'update_song_request_status',
    description: 'Update the status of a song request',
    inputSchema: {
      type: 'object',
      properties: {
        requestId: { type: 'string', description: 'The unique identifier of the song request' },
        status: {
          type: 'string',
          enum: ['pending', 'accepted', 'playing', 'completed', 'declined'],
          description: 'New status',
        },
      },
      required: ['requestId', 'status'],
    },
  },
  {
    name: 'accept_song_request',
    description: 'Accept a pending song request',
    inputSchema: {
      type: 'object',
      properties: {
        requestId: { type: 'string', description: 'The unique identifier of the song request' },
      },
      required: ['requestId'],
    },
  },
  {
    name: 'decline_song_request',
    description: 'Decline a song request with optional reason',
    inputSchema: {
      type: 'object',
      properties: {
        requestId: { type: 'string', description: 'The unique identifier of the song request' },
        reason: { type: 'string', description: 'Reason for declining' },
      },
      required: ['requestId'],
    },
  },
  {
    name: 'play_next_song',
    description: 'Mark current song as completed and start playing the next song in queue',
    inputSchema: {
      type: 'object',
      properties: {
        performerId: { type: 'string', description: 'The unique identifier of the performer' },
      },
      required: ['performerId'],
    },
  },
  {
    name: 'mark_song_completed',
    description: 'Mark a song request as completed',
    inputSchema: {
      type: 'object',
      properties: {
        requestId: { type: 'string', description: 'The unique identifier of the song request' },
      },
      required: ['requestId'],
    },
  },
  {
    name: 'get_request_settings',
    description: 'Get song request settings for a performer',
    inputSchema: {
      type: 'object',
      properties: {
        performerId: { type: 'string', description: 'The unique identifier of the performer' },
      },
      required: ['performerId'],
    },
  },
  {
    name: 'update_request_settings',
    description: 'Update song request settings (minimum tip, queue size, blocked songs, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        performerId: { type: 'string', description: 'The unique identifier of the performer' },
        isAcceptingRequests: { type: 'boolean', description: 'Whether accepting requests' },
        minimumTip: { type: 'number', description: 'Minimum tip for requests' },
        priorityTipThreshold: { type: 'number', description: 'Tip amount for priority placement' },
        maxQueueSize: { type: 'number', description: 'Maximum queue size' },
        blockedSongs: { type: 'array', items: { type: 'string' }, description: 'List of blocked songs' },
        preferredGenres: { type: 'array', items: { type: 'string' }, description: 'Preferred genres' },
      },
      required: ['performerId'],
    },
  },
  {
    name: 'reorder_queue',
    description: 'Reorder the song request queue manually',
    inputSchema: {
      type: 'object',
      properties: {
        performerId: { type: 'string', description: 'The unique identifier of the performer' },
        requestIds: { type: 'array', items: { type: 'string' }, description: 'Ordered list of request IDs' },
      },
      required: ['performerId', 'requestIds'],
    },
  },
  {
    name: 'clear_queue',
    description: 'Clear all pending and accepted song requests from the queue',
    inputSchema: {
      type: 'object',
      properties: {
        performerId: { type: 'string', description: 'The unique identifier of the performer' },
        markAsCompleted: { type: 'boolean', description: 'Mark all as completed instead of declining' },
      },
      required: ['performerId'],
    },
  },
];
