// Tip Menu Builder Tools - Custom tip amounts and actions

import { z } from 'zod';
import type { TipMenu, TipMenuItem, Tip } from '../types/index.js';
import {
  generateId,
  tipMenus,
  tips,
  earnings,
  getPerformerById,
  getTipMenuByPerformerId,
  getTipsByPerformerId,
} from '../utils/dataStore.js';

// Input schemas
export const createTipMenuSchema = z.object({
  performerId: z.string().describe('The unique identifier of the performer'),
  name: z.string().describe('Name of the tip menu'),
  items: z.array(
    z.object({
      amount: z.number().positive().describe('Tip amount'),
      currency: z.string().default('USD').describe('Currency code'),
      action: z.string().describe('Action/reward for this tip'),
      description: z.string().optional().describe('Detailed description of the action'),
      isAvailable: z.boolean().default(true).describe('Whether this item is currently available'),
    })
  ).describe('List of tip menu items'),
});

export const getTipMenuSchema = z.object({
  performerId: z.string().describe('The unique identifier of the performer'),
});

export const updateTipMenuSchema = z.object({
  menuId: z.string().describe('The unique identifier of the tip menu'),
  name: z.string().optional().describe('Updated menu name'),
  isActive: z.boolean().optional().describe('Whether the menu is active'),
});

export const addTipMenuItemSchema = z.object({
  menuId: z.string().describe('The unique identifier of the tip menu'),
  amount: z.number().positive().describe('Tip amount'),
  currency: z.string().default('USD').describe('Currency code'),
  action: z.string().describe('Action/reward for this tip'),
  description: z.string().optional().describe('Detailed description'),
  isAvailable: z.boolean().default(true).describe('Whether this item is available'),
});

export const updateTipMenuItemSchema = z.object({
  menuId: z.string().describe('The unique identifier of the tip menu'),
  itemId: z.string().describe('The unique identifier of the menu item'),
  amount: z.number().positive().optional().describe('Updated tip amount'),
  action: z.string().optional().describe('Updated action/reward'),
  description: z.string().optional().describe('Updated description'),
  isAvailable: z.boolean().optional().describe('Updated availability status'),
});

export const removeTipMenuItemSchema = z.object({
  menuId: z.string().describe('The unique identifier of the tip menu'),
  itemId: z.string().describe('The unique identifier of the menu item to remove'),
});

export const reorderTipMenuItemsSchema = z.object({
  menuId: z.string().describe('The unique identifier of the tip menu'),
  itemIds: z.array(z.string()).describe('Ordered list of item IDs'),
});

export const processTipSchema = z.object({
  performerId: z.string().describe('The unique identifier of the performer'),
  senderId: z.string().describe('The unique identifier of the tipper'),
  senderName: z.string().describe('Display name of the tipper'),
  amount: z.number().positive().describe('Tip amount'),
  currency: z.string().default('USD').describe('Currency code'),
  menuItemId: z.string().optional().describe('ID of the selected menu item'),
  message: z.string().optional().describe('Message from the tipper'),
});

export const getTipsHistorySchema = z.object({
  performerId: z.string().describe('The unique identifier of the performer'),
  limit: z.number().optional().default(50).describe('Maximum number of tips to return'),
  startDate: z.string().optional().describe('Filter tips from this date (ISO format)'),
  endDate: z.string().optional().describe('Filter tips until this date (ISO format)'),
});

// Tool implementations
export function createTipMenu(input: z.infer<typeof createTipMenuSchema>): TipMenu {
  const profile = getPerformerById(input.performerId);
  if (!profile) {
    throw new Error(`Performer with ID ${input.performerId} not found`);
  }

  // Deactivate any existing menus for this performer
  for (const [id, menu] of tipMenus) {
    if (menu.performerId === input.performerId && menu.isActive) {
      menu.isActive = false;
      tipMenus.set(id, menu);
    }
  }

  const menuId = generateId();
  const now = new Date();

  const items: TipMenuItem[] = input.items.map((item, index) => ({
    id: generateId(),
    amount: item.amount,
    currency: item.currency || 'USD',
    action: item.action,
    description: item.description,
    isAvailable: item.isAvailable ?? true,
    sortOrder: index + 1,
  }));

  const tipMenu: TipMenu = {
    id: menuId,
    performerId: input.performerId,
    name: input.name,
    items,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  tipMenus.set(menuId, tipMenu);
  return tipMenu;
}

export function getTipMenu(input: z.infer<typeof getTipMenuSchema>): TipMenu | null {
  const menu = getTipMenuByPerformerId(input.performerId);
  return menu || null;
}

export function updateTipMenu(input: z.infer<typeof updateTipMenuSchema>): TipMenu {
  const menu = tipMenus.get(input.menuId);
  if (!menu) {
    throw new Error(`Tip menu with ID ${input.menuId} not found`);
  }

  if (input.name !== undefined) menu.name = input.name;
  if (input.isActive !== undefined) menu.isActive = input.isActive;

  menu.updatedAt = new Date();
  tipMenus.set(input.menuId, menu);

  return menu;
}

export function addTipMenuItem(input: z.infer<typeof addTipMenuItemSchema>): TipMenu {
  const menu = tipMenus.get(input.menuId);
  if (!menu) {
    throw new Error(`Tip menu with ID ${input.menuId} not found`);
  }

  const maxSortOrder = Math.max(...menu.items.map((i) => i.sortOrder), 0);

  const item: TipMenuItem = {
    id: generateId(),
    amount: input.amount,
    currency: input.currency || 'USD',
    action: input.action,
    description: input.description,
    isAvailable: input.isAvailable ?? true,
    sortOrder: maxSortOrder + 1,
  };

  menu.items.push(item);
  menu.updatedAt = new Date();
  tipMenus.set(input.menuId, menu);

  return menu;
}

export function updateTipMenuItem(input: z.infer<typeof updateTipMenuItemSchema>): TipMenu {
  const menu = tipMenus.get(input.menuId);
  if (!menu) {
    throw new Error(`Tip menu with ID ${input.menuId} not found`);
  }

  const item = menu.items.find((i) => i.id === input.itemId);
  if (!item) {
    throw new Error(`Menu item with ID ${input.itemId} not found`);
  }

  if (input.amount !== undefined) item.amount = input.amount;
  if (input.action !== undefined) item.action = input.action;
  if (input.description !== undefined) item.description = input.description;
  if (input.isAvailable !== undefined) item.isAvailable = input.isAvailable;

  menu.updatedAt = new Date();
  tipMenus.set(input.menuId, menu);

  return menu;
}

export function removeTipMenuItem(input: z.infer<typeof removeTipMenuItemSchema>): TipMenu {
  const menu = tipMenus.get(input.menuId);
  if (!menu) {
    throw new Error(`Tip menu with ID ${input.menuId} not found`);
  }

  const itemIndex = menu.items.findIndex((i) => i.id === input.itemId);
  if (itemIndex === -1) {
    throw new Error(`Menu item with ID ${input.itemId} not found`);
  }

  menu.items.splice(itemIndex, 1);
  menu.updatedAt = new Date();
  tipMenus.set(input.menuId, menu);

  return menu;
}

export function reorderTipMenuItems(input: z.infer<typeof reorderTipMenuItemsSchema>): TipMenu {
  const menu = tipMenus.get(input.menuId);
  if (!menu) {
    throw new Error(`Tip menu with ID ${input.menuId} not found`);
  }

  // Validate all item IDs exist
  for (const itemId of input.itemIds) {
    if (!menu.items.find((i) => i.id === itemId)) {
      throw new Error(`Menu item with ID ${itemId} not found`);
    }
  }

  // Reorder items
  input.itemIds.forEach((itemId, index) => {
    const item = menu.items.find((i) => i.id === itemId);
    if (item) {
      item.sortOrder = index + 1;
    }
  });

  menu.items.sort((a, b) => a.sortOrder - b.sortOrder);
  menu.updatedAt = new Date();
  tipMenus.set(input.menuId, menu);

  return menu;
}

export function processTip(input: z.infer<typeof processTipSchema>): Tip {
  const profile = getPerformerById(input.performerId);
  if (!profile) {
    throw new Error(`Performer with ID ${input.performerId} not found`);
  }

  let action: string | undefined;
  if (input.menuItemId) {
    const menu = getTipMenuByPerformerId(input.performerId);
    if (menu) {
      const item = menu.items.find((i) => i.id === input.menuItemId);
      if (item) {
        action = item.action;
      }
    }
  }

  const tipId = generateId();
  const now = new Date();

  const tip: Tip = {
    id: tipId,
    performerId: input.performerId,
    senderId: input.senderId,
    senderName: input.senderName,
    amount: input.amount,
    currency: input.currency || 'USD',
    menuItemId: input.menuItemId,
    action,
    message: input.message,
    timestamp: now,
  };

  tips.set(tipId, tip);

  // Also record as earnings
  const earningsId = generateId();
  earnings.set(earningsId, {
    id: earningsId,
    performerId: input.performerId,
    amount: input.amount,
    currency: input.currency || 'USD',
    type: 'tip',
    source: `Tip from ${input.senderName}`,
    description: action || input.message,
    timestamp: now,
  });

  return tip;
}

export function getTipsHistory(input: z.infer<typeof getTipsHistorySchema>): Tip[] {
  let tipsList = getTipsByPerformerId(input.performerId);

  if (input.startDate) {
    const startDate = new Date(input.startDate);
    tipsList = tipsList.filter((t) => t.timestamp >= startDate);
  }

  if (input.endDate) {
    const endDate = new Date(input.endDate);
    tipsList = tipsList.filter((t) => t.timestamp <= endDate);
  }

  // Sort by most recent first
  tipsList.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return tipsList.slice(0, input.limit || 50);
}

// Tool definitions for MCP registration
export const tipMenuTools = [
  {
    name: 'create_tip_menu',
    description: 'Create a new tip menu with custom amounts and actions for the performer',
    inputSchema: {
      type: 'object',
      properties: {
        performerId: { type: 'string', description: 'The unique identifier of the performer' },
        name: { type: 'string', description: 'Name of the tip menu' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              amount: { type: 'number', description: 'Tip amount' },
              currency: { type: 'string', description: 'Currency code (default: USD)' },
              action: { type: 'string', description: 'Action/reward for this tip' },
              description: { type: 'string', description: 'Detailed description' },
              isAvailable: { type: 'boolean', description: 'Whether this item is available' },
            },
            required: ['amount', 'action'],
          },
          description: 'List of tip menu items',
        },
      },
      required: ['performerId', 'name', 'items'],
    },
  },
  {
    name: 'get_tip_menu',
    description: 'Get the active tip menu for a performer',
    inputSchema: {
      type: 'object',
      properties: {
        performerId: { type: 'string', description: 'The unique identifier of the performer' },
      },
      required: ['performerId'],
    },
  },
  {
    name: 'update_tip_menu',
    description: 'Update tip menu name or active status',
    inputSchema: {
      type: 'object',
      properties: {
        menuId: { type: 'string', description: 'The unique identifier of the tip menu' },
        name: { type: 'string', description: 'Updated menu name' },
        isActive: { type: 'boolean', description: 'Whether the menu is active' },
      },
      required: ['menuId'],
    },
  },
  {
    name: 'add_tip_menu_item',
    description: 'Add a new item to an existing tip menu',
    inputSchema: {
      type: 'object',
      properties: {
        menuId: { type: 'string', description: 'The unique identifier of the tip menu' },
        amount: { type: 'number', description: 'Tip amount' },
        currency: { type: 'string', description: 'Currency code' },
        action: { type: 'string', description: 'Action/reward for this tip' },
        description: { type: 'string', description: 'Detailed description' },
        isAvailable: { type: 'boolean', description: 'Whether this item is available' },
      },
      required: ['menuId', 'amount', 'action'],
    },
  },
  {
    name: 'update_tip_menu_item',
    description: 'Update an existing tip menu item',
    inputSchema: {
      type: 'object',
      properties: {
        menuId: { type: 'string', description: 'The unique identifier of the tip menu' },
        itemId: { type: 'string', description: 'The unique identifier of the menu item' },
        amount: { type: 'number', description: 'Updated tip amount' },
        action: { type: 'string', description: 'Updated action/reward' },
        description: { type: 'string', description: 'Updated description' },
        isAvailable: { type: 'boolean', description: 'Updated availability' },
      },
      required: ['menuId', 'itemId'],
    },
  },
  {
    name: 'remove_tip_menu_item',
    description: 'Remove an item from the tip menu',
    inputSchema: {
      type: 'object',
      properties: {
        menuId: { type: 'string', description: 'The unique identifier of the tip menu' },
        itemId: { type: 'string', description: 'The unique identifier of the menu item to remove' },
      },
      required: ['menuId', 'itemId'],
    },
  },
  {
    name: 'reorder_tip_menu_items',
    description: 'Reorder items in the tip menu',
    inputSchema: {
      type: 'object',
      properties: {
        menuId: { type: 'string', description: 'The unique identifier of the tip menu' },
        itemIds: { type: 'array', items: { type: 'string' }, description: 'Ordered list of item IDs' },
      },
      required: ['menuId', 'itemIds'],
    },
  },
  {
    name: 'process_tip',
    description: 'Process a new tip from a viewer',
    inputSchema: {
      type: 'object',
      properties: {
        performerId: { type: 'string', description: 'The unique identifier of the performer' },
        senderId: { type: 'string', description: 'The unique identifier of the tipper' },
        senderName: { type: 'string', description: 'Display name of the tipper' },
        amount: { type: 'number', description: 'Tip amount' },
        currency: { type: 'string', description: 'Currency code' },
        menuItemId: { type: 'string', description: 'ID of the selected menu item' },
        message: { type: 'string', description: 'Message from the tipper' },
      },
      required: ['performerId', 'senderId', 'senderName', 'amount'],
    },
  },
  {
    name: 'get_tips_history',
    description: 'Get history of tips received by the performer',
    inputSchema: {
      type: 'object',
      properties: {
        performerId: { type: 'string', description: 'The unique identifier of the performer' },
        limit: { type: 'number', description: 'Maximum number of tips to return' },
        startDate: { type: 'string', description: 'Filter tips from this date (ISO format)' },
        endDate: { type: 'string', description: 'Filter tips until this date (ISO format)' },
      },
      required: ['performerId'],
    },
  },
];
