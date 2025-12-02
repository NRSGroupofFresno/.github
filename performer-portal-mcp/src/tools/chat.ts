// Live Chat Tools - Real-time audience messaging

import { z } from 'zod';
import type { ChatRoom, ChatMessage, Viewer } from '../types/index.js';
import {
  generateId,
  chatRooms,
  chatMessages,
  getPerformerById,
  getChatRoomByPerformerId,
  getMessagesByRoomId,
} from '../utils/dataStore.js';

// Input schemas
export const createChatRoomSchema = z.object({
  performerId: z.string().describe('The unique identifier of the performer'),
});

export const getChatRoomSchema = z.object({
  performerId: z.string().describe('The unique identifier of the performer'),
});

export const closeChatRoomSchema = z.object({
  roomId: z.string().describe('The unique identifier of the chat room'),
});

export const sendMessageSchema = z.object({
  roomId: z.string().describe('The unique identifier of the chat room'),
  senderId: z.string().describe('The unique identifier of the sender'),
  senderName: z.string().describe('Display name of the sender'),
  senderType: z.enum(['performer', 'viewer', 'moderator', 'system']).describe('Type of sender'),
  content: z.string().describe('Message content'),
  isHighlighted: z.boolean().optional().default(false).describe('Whether to highlight this message'),
  tipAmount: z.number().optional().describe('Tip amount if this is a tip message'),
});

export const getMessagesSchema = z.object({
  roomId: z.string().describe('The unique identifier of the chat room'),
  limit: z.number().optional().default(100).describe('Maximum number of messages to return'),
  beforeId: z.string().optional().describe('Get messages before this message ID'),
  afterId: z.string().optional().describe('Get messages after this message ID'),
});

export const addViewerSchema = z.object({
  roomId: z.string().describe('The unique identifier of the chat room'),
  viewerId: z.string().describe('The unique identifier of the viewer'),
  viewerName: z.string().describe('Display name of the viewer'),
});

export const removeViewerSchema = z.object({
  roomId: z.string().describe('The unique identifier of the chat room'),
  viewerId: z.string().describe('The unique identifier of the viewer'),
});

export const getViewersSchema = z.object({
  roomId: z.string().describe('The unique identifier of the chat room'),
});

export const setModeratorSchema = z.object({
  roomId: z.string().describe('The unique identifier of the chat room'),
  viewerId: z.string().describe('The unique identifier of the viewer'),
  isModerator: z.boolean().describe('Whether to grant or revoke moderator status'),
});

export const banViewerSchema = z.object({
  roomId: z.string().describe('The unique identifier of the chat room'),
  viewerId: z.string().describe('The unique identifier of the viewer to ban'),
  reason: z.string().optional().describe('Reason for the ban'),
});

export const unbanViewerSchema = z.object({
  roomId: z.string().describe('The unique identifier of the chat room'),
  viewerId: z.string().describe('The unique identifier of the viewer to unban'),
});

export const deleteMessageSchema = z.object({
  messageId: z.string().describe('The unique identifier of the message to delete'),
});

export const sendSystemMessageSchema = z.object({
  roomId: z.string().describe('The unique identifier of the chat room'),
  content: z.string().describe('System message content'),
  isHighlighted: z.boolean().optional().default(true).describe('Whether to highlight this message'),
});

// Tool implementations
export function createChatRoom(input: z.infer<typeof createChatRoomSchema>): ChatRoom {
  const profile = getPerformerById(input.performerId);
  if (!profile) {
    throw new Error(`Performer with ID ${input.performerId} not found`);
  }

  // Check if room already exists
  const existingRoom = getChatRoomByPerformerId(input.performerId);
  if (existingRoom) {
    return existingRoom;
  }

  const roomId = generateId();
  const room: ChatRoom = {
    id: roomId,
    performerId: input.performerId,
    isActive: true,
    viewers: [],
    createdAt: new Date(),
  };

  chatRooms.set(roomId, room);

  // Send system welcome message
  const welcomeMsg: ChatMessage = {
    id: generateId(),
    roomId,
    senderId: 'system',
    senderName: 'System',
    senderType: 'system',
    content: `Welcome to ${profile.stageName}'s chat room!`,
    timestamp: new Date(),
    isHighlighted: true,
  };
  chatMessages.set(welcomeMsg.id, welcomeMsg);

  return room;
}

export function getChatRoom(input: z.infer<typeof getChatRoomSchema>): ChatRoom | null {
  return getChatRoomByPerformerId(input.performerId) || null;
}

export function closeChatRoom(input: z.infer<typeof closeChatRoomSchema>): ChatRoom {
  const room = chatRooms.get(input.roomId);
  if (!room) {
    throw new Error(`Chat room with ID ${input.roomId} not found`);
  }

  room.isActive = false;
  chatRooms.set(input.roomId, room);

  // Send closing message
  const closingMsg: ChatMessage = {
    id: generateId(),
    roomId: input.roomId,
    senderId: 'system',
    senderName: 'System',
    senderType: 'system',
    content: 'Chat room has been closed. Thanks for joining!',
    timestamp: new Date(),
    isHighlighted: true,
  };
  chatMessages.set(closingMsg.id, closingMsg);

  return room;
}

export function sendMessage(input: z.infer<typeof sendMessageSchema>): ChatMessage {
  const room = chatRooms.get(input.roomId);
  if (!room) {
    throw new Error(`Chat room with ID ${input.roomId} not found`);
  }

  if (!room.isActive) {
    throw new Error('Chat room is closed');
  }

  // Check if viewer is banned
  if (input.senderType === 'viewer') {
    const viewer = room.viewers.find((v) => v.id === input.senderId);
    if (viewer?.isBanned) {
      throw new Error('You are banned from this chat room');
    }
  }

  const message: ChatMessage = {
    id: generateId(),
    roomId: input.roomId,
    senderId: input.senderId,
    senderName: input.senderName,
    senderType: input.senderType,
    content: input.content,
    timestamp: new Date(),
    isHighlighted: input.isHighlighted || false,
    tipAmount: input.tipAmount,
  };

  chatMessages.set(message.id, message);
  return message;
}

export function getMessages(input: z.infer<typeof getMessagesSchema>): ChatMessage[] {
  const room = chatRooms.get(input.roomId);
  if (!room) {
    throw new Error(`Chat room with ID ${input.roomId} not found`);
  }

  let messages = getMessagesByRoomId(input.roomId);

  if (input.afterId) {
    const afterMsg = chatMessages.get(input.afterId);
    if (afterMsg) {
      messages = messages.filter((m) => m.timestamp > afterMsg.timestamp);
    }
  }

  if (input.beforeId) {
    const beforeMsg = chatMessages.get(input.beforeId);
    if (beforeMsg) {
      messages = messages.filter((m) => m.timestamp < beforeMsg.timestamp);
    }
  }

  // Return most recent messages
  return messages.slice(-1 * (input.limit || 100));
}

export function addViewer(input: z.infer<typeof addViewerSchema>): ChatRoom {
  const room = chatRooms.get(input.roomId);
  if (!room) {
    throw new Error(`Chat room with ID ${input.roomId} not found`);
  }

  // Check if viewer already exists
  const existingViewer = room.viewers.find((v) => v.id === input.viewerId);
  if (existingViewer) {
    return room;
  }

  const viewer: Viewer = {
    id: input.viewerId,
    name: input.viewerName,
    joinedAt: new Date(),
    isModerator: false,
    isBanned: false,
    totalTipped: 0,
  };

  room.viewers.push(viewer);
  chatRooms.set(input.roomId, room);

  return room;
}

export function removeViewer(input: z.infer<typeof removeViewerSchema>): ChatRoom {
  const room = chatRooms.get(input.roomId);
  if (!room) {
    throw new Error(`Chat room with ID ${input.roomId} not found`);
  }

  const viewerIndex = room.viewers.findIndex((v) => v.id === input.viewerId);
  if (viewerIndex !== -1) {
    room.viewers.splice(viewerIndex, 1);
    chatRooms.set(input.roomId, room);
  }

  return room;
}

export function getViewers(input: z.infer<typeof getViewersSchema>): Viewer[] {
  const room = chatRooms.get(input.roomId);
  if (!room) {
    throw new Error(`Chat room with ID ${input.roomId} not found`);
  }

  return room.viewers;
}

export function setModerator(input: z.infer<typeof setModeratorSchema>): ChatRoom {
  const room = chatRooms.get(input.roomId);
  if (!room) {
    throw new Error(`Chat room with ID ${input.roomId} not found`);
  }

  const viewer = room.viewers.find((v) => v.id === input.viewerId);
  if (!viewer) {
    throw new Error(`Viewer with ID ${input.viewerId} not found in this room`);
  }

  viewer.isModerator = input.isModerator;
  chatRooms.set(input.roomId, room);

  // Send system message
  const modMsg: ChatMessage = {
    id: generateId(),
    roomId: input.roomId,
    senderId: 'system',
    senderName: 'System',
    senderType: 'system',
    content: input.isModerator
      ? `${viewer.name} is now a moderator!`
      : `${viewer.name} is no longer a moderator.`,
    timestamp: new Date(),
    isHighlighted: true,
  };
  chatMessages.set(modMsg.id, modMsg);

  return room;
}

export function banViewer(input: z.infer<typeof banViewerSchema>): ChatRoom {
  const room = chatRooms.get(input.roomId);
  if (!room) {
    throw new Error(`Chat room with ID ${input.roomId} not found`);
  }

  const viewer = room.viewers.find((v) => v.id === input.viewerId);
  if (!viewer) {
    throw new Error(`Viewer with ID ${input.viewerId} not found in this room`);
  }

  viewer.isBanned = true;
  chatRooms.set(input.roomId, room);

  // Send system message
  const banMsg: ChatMessage = {
    id: generateId(),
    roomId: input.roomId,
    senderId: 'system',
    senderName: 'System',
    senderType: 'system',
    content: `${viewer.name} has been banned from the chat.`,
    timestamp: new Date(),
    isHighlighted: true,
  };
  chatMessages.set(banMsg.id, banMsg);

  return room;
}

export function unbanViewer(input: z.infer<typeof unbanViewerSchema>): ChatRoom {
  const room = chatRooms.get(input.roomId);
  if (!room) {
    throw new Error(`Chat room with ID ${input.roomId} not found`);
  }

  const viewer = room.viewers.find((v) => v.id === input.viewerId);
  if (!viewer) {
    throw new Error(`Viewer with ID ${input.viewerId} not found in this room`);
  }

  viewer.isBanned = false;
  chatRooms.set(input.roomId, room);

  return room;
}

export function deleteMessage(input: z.infer<typeof deleteMessageSchema>): boolean {
  const message = chatMessages.get(input.messageId);
  if (!message) {
    throw new Error(`Message with ID ${input.messageId} not found`);
  }

  chatMessages.delete(input.messageId);
  return true;
}

export function sendSystemMessage(input: z.infer<typeof sendSystemMessageSchema>): ChatMessage {
  const room = chatRooms.get(input.roomId);
  if (!room) {
    throw new Error(`Chat room with ID ${input.roomId} not found`);
  }

  const message: ChatMessage = {
    id: generateId(),
    roomId: input.roomId,
    senderId: 'system',
    senderName: 'System',
    senderType: 'system',
    content: input.content,
    timestamp: new Date(),
    isHighlighted: input.isHighlighted ?? true,
  };

  chatMessages.set(message.id, message);
  return message;
}

// Tool definitions for MCP registration
export const chatTools = [
  {
    name: 'create_chat_room',
    description: 'Create a new chat room for the performer to interact with their audience',
    inputSchema: {
      type: 'object',
      properties: {
        performerId: { type: 'string', description: 'The unique identifier of the performer' },
      },
      required: ['performerId'],
    },
  },
  {
    name: 'get_chat_room',
    description: 'Get the active chat room for a performer',
    inputSchema: {
      type: 'object',
      properties: {
        performerId: { type: 'string', description: 'The unique identifier of the performer' },
      },
      required: ['performerId'],
    },
  },
  {
    name: 'close_chat_room',
    description: 'Close an active chat room',
    inputSchema: {
      type: 'object',
      properties: {
        roomId: { type: 'string', description: 'The unique identifier of the chat room' },
      },
      required: ['roomId'],
    },
  },
  {
    name: 'send_message',
    description: 'Send a message to the chat room',
    inputSchema: {
      type: 'object',
      properties: {
        roomId: { type: 'string', description: 'The unique identifier of the chat room' },
        senderId: { type: 'string', description: 'The unique identifier of the sender' },
        senderName: { type: 'string', description: 'Display name of the sender' },
        senderType: {
          type: 'string',
          enum: ['performer', 'viewer', 'moderator', 'system'],
          description: 'Type of sender',
        },
        content: { type: 'string', description: 'Message content' },
        isHighlighted: { type: 'boolean', description: 'Whether to highlight this message' },
        tipAmount: { type: 'number', description: 'Tip amount if this is a tip message' },
      },
      required: ['roomId', 'senderId', 'senderName', 'senderType', 'content'],
    },
  },
  {
    name: 'get_messages',
    description: 'Get chat messages from a room with optional pagination',
    inputSchema: {
      type: 'object',
      properties: {
        roomId: { type: 'string', description: 'The unique identifier of the chat room' },
        limit: { type: 'number', description: 'Maximum number of messages to return' },
        beforeId: { type: 'string', description: 'Get messages before this message ID' },
        afterId: { type: 'string', description: 'Get messages after this message ID' },
      },
      required: ['roomId'],
    },
  },
  {
    name: 'add_viewer',
    description: 'Add a viewer to the chat room',
    inputSchema: {
      type: 'object',
      properties: {
        roomId: { type: 'string', description: 'The unique identifier of the chat room' },
        viewerId: { type: 'string', description: 'The unique identifier of the viewer' },
        viewerName: { type: 'string', description: 'Display name of the viewer' },
      },
      required: ['roomId', 'viewerId', 'viewerName'],
    },
  },
  {
    name: 'remove_viewer',
    description: 'Remove a viewer from the chat room',
    inputSchema: {
      type: 'object',
      properties: {
        roomId: { type: 'string', description: 'The unique identifier of the chat room' },
        viewerId: { type: 'string', description: 'The unique identifier of the viewer' },
      },
      required: ['roomId', 'viewerId'],
    },
  },
  {
    name: 'get_viewers',
    description: 'Get list of current viewers in the chat room',
    inputSchema: {
      type: 'object',
      properties: {
        roomId: { type: 'string', description: 'The unique identifier of the chat room' },
      },
      required: ['roomId'],
    },
  },
  {
    name: 'set_moderator',
    description: 'Grant or revoke moderator status for a viewer',
    inputSchema: {
      type: 'object',
      properties: {
        roomId: { type: 'string', description: 'The unique identifier of the chat room' },
        viewerId: { type: 'string', description: 'The unique identifier of the viewer' },
        isModerator: { type: 'boolean', description: 'Whether to grant or revoke moderator status' },
      },
      required: ['roomId', 'viewerId', 'isModerator'],
    },
  },
  {
    name: 'ban_viewer',
    description: 'Ban a viewer from the chat room',
    inputSchema: {
      type: 'object',
      properties: {
        roomId: { type: 'string', description: 'The unique identifier of the chat room' },
        viewerId: { type: 'string', description: 'The unique identifier of the viewer to ban' },
        reason: { type: 'string', description: 'Reason for the ban' },
      },
      required: ['roomId', 'viewerId'],
    },
  },
  {
    name: 'unban_viewer',
    description: 'Unban a previously banned viewer',
    inputSchema: {
      type: 'object',
      properties: {
        roomId: { type: 'string', description: 'The unique identifier of the chat room' },
        viewerId: { type: 'string', description: 'The unique identifier of the viewer to unban' },
      },
      required: ['roomId', 'viewerId'],
    },
  },
  {
    name: 'delete_message',
    description: 'Delete a chat message (moderation)',
    inputSchema: {
      type: 'object',
      properties: {
        messageId: { type: 'string', description: 'The unique identifier of the message to delete' },
      },
      required: ['messageId'],
    },
  },
  {
    name: 'send_system_message',
    description: 'Send a system announcement to the chat room',
    inputSchema: {
      type: 'object',
      properties: {
        roomId: { type: 'string', description: 'The unique identifier of the chat room' },
        content: { type: 'string', description: 'System message content' },
        isHighlighted: { type: 'boolean', description: 'Whether to highlight this message' },
      },
      required: ['roomId', 'content'],
    },
  },
];
