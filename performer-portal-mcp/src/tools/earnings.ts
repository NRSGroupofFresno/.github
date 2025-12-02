// Earnings Tracker Tools - Daily/weekly/monthly stats

import { z } from 'zod';
import type { EarningsRecord, EarningsSummary, EarningsType } from '../types/index.js';
import {
  generateId,
  earnings,
  tips,
  getPerformerById,
  getEarningsByPerformerId,
  getTipsByPerformerId,
} from '../utils/dataStore.js';

// Input schemas
export const getEarningsSummarySchema = z.object({
  performerId: z.string().describe('The unique identifier of the performer'),
  period: z.enum(['daily', 'weekly', 'monthly', 'all_time']).describe('Time period for the summary'),
  customStartDate: z.string().optional().describe('Custom start date (ISO format) for filtering'),
  customEndDate: z.string().optional().describe('Custom end date (ISO format) for filtering'),
});

export const getEarningsHistorySchema = z.object({
  performerId: z.string().describe('The unique identifier of the performer'),
  startDate: z.string().optional().describe('Filter earnings from this date (ISO format)'),
  endDate: z.string().optional().describe('Filter earnings until this date (ISO format)'),
  type: z.enum(['tip', 'song_request', 'subscription', 'donation', 'other']).optional().describe('Filter by earnings type'),
  limit: z.number().optional().default(100).describe('Maximum number of records to return'),
});

export const addEarningsRecordSchema = z.object({
  performerId: z.string().describe('The unique identifier of the performer'),
  amount: z.number().positive().describe('Earnings amount'),
  currency: z.string().default('USD').describe('Currency code'),
  type: z.enum(['tip', 'song_request', 'subscription', 'donation', 'other']).describe('Type of earnings'),
  source: z.string().describe('Source of the earnings'),
  description: z.string().optional().describe('Additional description'),
});

export const getDailyBreakdownSchema = z.object({
  performerId: z.string().describe('The unique identifier of the performer'),
  days: z.number().optional().default(30).describe('Number of days to include'),
});

export const getTopTippersSchema = z.object({
  performerId: z.string().describe('The unique identifier of the performer'),
  period: z.enum(['daily', 'weekly', 'monthly', 'all_time']).describe('Time period'),
  limit: z.number().optional().default(10).describe('Maximum number of tippers to return'),
});

export const getEarningsByTypeSchema = z.object({
  performerId: z.string().describe('The unique identifier of the performer'),
  period: z.enum(['daily', 'weekly', 'monthly', 'all_time']).describe('Time period'),
});

export const comparePeriodsSchema = z.object({
  performerId: z.string().describe('The unique identifier of the performer'),
  period1Start: z.string().describe('Start date of first period (ISO format)'),
  period1End: z.string().describe('End date of first period (ISO format)'),
  period2Start: z.string().describe('Start date of second period (ISO format)'),
  period2End: z.string().describe('End date of second period (ISO format)'),
});

// Helper functions
function getPeriodDates(period: 'daily' | 'weekly' | 'monthly' | 'all_time'): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  switch (period) {
    case 'daily':
      // Today
      break;
    case 'weekly':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'monthly':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case 'all_time':
      startDate.setFullYear(2020, 0, 1); // Set to a very early date
      break;
  }

  return { startDate, endDate };
}

// Tool implementations
export function getEarningsSummary(input: z.infer<typeof getEarningsSummarySchema>): EarningsSummary {
  const profile = getPerformerById(input.performerId);
  if (!profile) {
    throw new Error(`Performer with ID ${input.performerId} not found`);
  }

  let startDate: Date;
  let endDate: Date;

  if (input.customStartDate && input.customEndDate) {
    startDate = new Date(input.customStartDate);
    endDate = new Date(input.customEndDate);
  } else {
    const dates = getPeriodDates(input.period);
    startDate = dates.startDate;
    endDate = dates.endDate;
  }

  const earningsRecords = getEarningsByPerformerId(input.performerId, startDate, endDate);

  // Calculate breakdown by type
  const breakdown = {
    tips: 0,
    songRequests: 0,
    subscriptions: 0,
    donations: 0,
    other: 0,
  };

  let totalEarnings = 0;
  for (const record of earningsRecords) {
    totalEarnings += record.amount;
    switch (record.type) {
      case 'tip':
        breakdown.tips += record.amount;
        break;
      case 'song_request':
        breakdown.songRequests += record.amount;
        break;
      case 'subscription':
        breakdown.subscriptions += record.amount;
        break;
      case 'donation':
        breakdown.donations += record.amount;
        break;
      case 'other':
        breakdown.other += record.amount;
        break;
    }
  }

  // Get top tippers
  const tipsList = getTipsByPerformerId(input.performerId)
    .filter((t) => t.timestamp >= startDate && t.timestamp <= endDate);

  const tipperTotals: Map<string, { id: string; name: string; total: number }> = new Map();
  for (const tip of tipsList) {
    const existing = tipperTotals.get(tip.senderId);
    if (existing) {
      existing.total += tip.amount;
    } else {
      tipperTotals.set(tip.senderId, {
        id: tip.senderId,
        name: tip.senderName,
        total: tip.amount,
      });
    }
  }

  const topTippers = Array.from(tipperTotals.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map((t) => ({
      userId: t.id,
      userName: t.name,
      totalAmount: t.total,
    }));

  return {
    performerId: input.performerId,
    period: input.period,
    startDate,
    endDate,
    totalEarnings,
    currency: 'USD',
    breakdown,
    transactionCount: earningsRecords.length,
    averageTransaction: earningsRecords.length > 0 ? totalEarnings / earningsRecords.length : 0,
    topTippers,
  };
}

export function getEarningsHistory(input: z.infer<typeof getEarningsHistorySchema>): EarningsRecord[] {
  const startDate = input.startDate ? new Date(input.startDate) : undefined;
  const endDate = input.endDate ? new Date(input.endDate) : undefined;

  let records = getEarningsByPerformerId(input.performerId, startDate, endDate);

  if (input.type) {
    records = records.filter((r) => r.type === input.type);
  }

  // Sort by most recent first
  records.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return records.slice(0, input.limit || 100);
}

export function addEarningsRecord(input: z.infer<typeof addEarningsRecordSchema>): EarningsRecord {
  const profile = getPerformerById(input.performerId);
  if (!profile) {
    throw new Error(`Performer with ID ${input.performerId} not found`);
  }

  const recordId = generateId();
  const record: EarningsRecord = {
    id: recordId,
    performerId: input.performerId,
    amount: input.amount,
    currency: input.currency || 'USD',
    type: input.type,
    source: input.source,
    description: input.description,
    timestamp: new Date(),
  };

  earnings.set(recordId, record);
  return record;
}

export function getDailyBreakdown(input: z.infer<typeof getDailyBreakdownSchema>): Array<{
  date: string;
  total: number;
  tips: number;
  songRequests: number;
  other: number;
  transactionCount: number;
}> {
  const days = input.days || 30;
  const result: Array<{
    date: string;
    total: number;
    tips: number;
    songRequests: number;
    other: number;
    transactionCount: number;
  }> = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < days; i++) {
    const dayStart = new Date(today);
    dayStart.setDate(dayStart.getDate() - i);

    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const dayEarnings = getEarningsByPerformerId(input.performerId, dayStart, dayEnd);

    let total = 0;
    let tipTotal = 0;
    let songRequestTotal = 0;
    let otherTotal = 0;

    for (const record of dayEarnings) {
      total += record.amount;
      switch (record.type) {
        case 'tip':
          tipTotal += record.amount;
          break;
        case 'song_request':
          songRequestTotal += record.amount;
          break;
        default:
          otherTotal += record.amount;
      }
    }

    result.push({
      date: dayStart.toISOString().split('T')[0],
      total,
      tips: tipTotal,
      songRequests: songRequestTotal,
      other: otherTotal,
      transactionCount: dayEarnings.length,
    });
  }

  return result;
}

export function getTopTippers(input: z.infer<typeof getTopTippersSchema>): Array<{
  userId: string;
  userName: string;
  totalAmount: number;
  tipCount: number;
  averageTip: number;
}> {
  const { startDate, endDate } = getPeriodDates(input.period);

  const tipsList = getTipsByPerformerId(input.performerId)
    .filter((t) => t.timestamp >= startDate && t.timestamp <= endDate);

  const tipperStats: Map<string, {
    id: string;
    name: string;
    total: number;
    count: number;
  }> = new Map();

  for (const tip of tipsList) {
    const existing = tipperStats.get(tip.senderId);
    if (existing) {
      existing.total += tip.amount;
      existing.count++;
    } else {
      tipperStats.set(tip.senderId, {
        id: tip.senderId,
        name: tip.senderName,
        total: tip.amount,
        count: 1,
      });
    }
  }

  return Array.from(tipperStats.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, input.limit || 10)
    .map((t) => ({
      userId: t.id,
      userName: t.name,
      totalAmount: t.total,
      tipCount: t.count,
      averageTip: t.total / t.count,
    }));
}

export function getEarningsByType(input: z.infer<typeof getEarningsByTypeSchema>): Record<EarningsType, {
  total: number;
  count: number;
  average: number;
  percentage: number;
}> {
  const { startDate, endDate } = getPeriodDates(input.period);
  const earningsRecords = getEarningsByPerformerId(input.performerId, startDate, endDate);

  const typeStats: Record<EarningsType, { total: number; count: number }> = {
    tip: { total: 0, count: 0 },
    song_request: { total: 0, count: 0 },
    subscription: { total: 0, count: 0 },
    donation: { total: 0, count: 0 },
    other: { total: 0, count: 0 },
  };

  let grandTotal = 0;

  for (const record of earningsRecords) {
    typeStats[record.type].total += record.amount;
    typeStats[record.type].count++;
    grandTotal += record.amount;
  }

  const result: Record<EarningsType, { total: number; count: number; average: number; percentage: number }> = {} as any;

  for (const type of Object.keys(typeStats) as EarningsType[]) {
    const stats = typeStats[type];
    result[type] = {
      total: stats.total,
      count: stats.count,
      average: stats.count > 0 ? stats.total / stats.count : 0,
      percentage: grandTotal > 0 ? (stats.total / grandTotal) * 100 : 0,
    };
  }

  return result;
}

export function comparePeriods(input: z.infer<typeof comparePeriodsSchema>): {
  period1: { total: number; count: number; average: number };
  period2: { total: number; count: number; average: number };
  difference: { total: number; percentage: number };
  trend: 'up' | 'down' | 'stable';
} {
  const period1Start = new Date(input.period1Start);
  const period1End = new Date(input.period1End);
  const period2Start = new Date(input.period2Start);
  const period2End = new Date(input.period2End);

  const period1Earnings = getEarningsByPerformerId(input.performerId, period1Start, period1End);
  const period2Earnings = getEarningsByPerformerId(input.performerId, period2Start, period2End);

  const period1Total = period1Earnings.reduce((sum, e) => sum + e.amount, 0);
  const period2Total = period2Earnings.reduce((sum, e) => sum + e.amount, 0);

  const difference = period2Total - period1Total;
  const percentageChange = period1Total > 0 ? ((period2Total - period1Total) / period1Total) * 100 : 0;

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (percentageChange > 5) trend = 'up';
  else if (percentageChange < -5) trend = 'down';

  return {
    period1: {
      total: period1Total,
      count: period1Earnings.length,
      average: period1Earnings.length > 0 ? period1Total / period1Earnings.length : 0,
    },
    period2: {
      total: period2Total,
      count: period2Earnings.length,
      average: period2Earnings.length > 0 ? period2Total / period2Earnings.length : 0,
    },
    difference: {
      total: difference,
      percentage: percentageChange,
    },
    trend,
  };
}

// Tool definitions for MCP registration
export const earningsTools = [
  {
    name: 'get_earnings_summary',
    description: 'Get a comprehensive earnings summary for a time period (daily, weekly, monthly, or all-time)',
    inputSchema: {
      type: 'object',
      properties: {
        performerId: { type: 'string', description: 'The unique identifier of the performer' },
        period: {
          type: 'string',
          enum: ['daily', 'weekly', 'monthly', 'all_time'],
          description: 'Time period for the summary',
        },
        customStartDate: { type: 'string', description: 'Custom start date (ISO format)' },
        customEndDate: { type: 'string', description: 'Custom end date (ISO format)' },
      },
      required: ['performerId', 'period'],
    },
  },
  {
    name: 'get_earnings_history',
    description: 'Get detailed earnings history with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        performerId: { type: 'string', description: 'The unique identifier of the performer' },
        startDate: { type: 'string', description: 'Filter earnings from this date (ISO format)' },
        endDate: { type: 'string', description: 'Filter earnings until this date (ISO format)' },
        type: {
          type: 'string',
          enum: ['tip', 'song_request', 'subscription', 'donation', 'other'],
          description: 'Filter by earnings type',
        },
        limit: { type: 'number', description: 'Maximum number of records to return' },
      },
      required: ['performerId'],
    },
  },
  {
    name: 'add_earnings_record',
    description: 'Manually add an earnings record (for external payments, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        performerId: { type: 'string', description: 'The unique identifier of the performer' },
        amount: { type: 'number', description: 'Earnings amount' },
        currency: { type: 'string', description: 'Currency code' },
        type: {
          type: 'string',
          enum: ['tip', 'song_request', 'subscription', 'donation', 'other'],
          description: 'Type of earnings',
        },
        source: { type: 'string', description: 'Source of the earnings' },
        description: { type: 'string', description: 'Additional description' },
      },
      required: ['performerId', 'amount', 'type', 'source'],
    },
  },
  {
    name: 'get_daily_breakdown',
    description: 'Get day-by-day earnings breakdown for the specified number of days',
    inputSchema: {
      type: 'object',
      properties: {
        performerId: { type: 'string', description: 'The unique identifier of the performer' },
        days: { type: 'number', description: 'Number of days to include (default: 30)' },
      },
      required: ['performerId'],
    },
  },
  {
    name: 'get_top_tippers',
    description: 'Get list of top tippers for a time period with statistics',
    inputSchema: {
      type: 'object',
      properties: {
        performerId: { type: 'string', description: 'The unique identifier of the performer' },
        period: {
          type: 'string',
          enum: ['daily', 'weekly', 'monthly', 'all_time'],
          description: 'Time period',
        },
        limit: { type: 'number', description: 'Maximum number of tippers to return' },
      },
      required: ['performerId', 'period'],
    },
  },
  {
    name: 'get_earnings_by_type',
    description: 'Get earnings breakdown by type (tips, song requests, subscriptions, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        performerId: { type: 'string', description: 'The unique identifier of the performer' },
        period: {
          type: 'string',
          enum: ['daily', 'weekly', 'monthly', 'all_time'],
          description: 'Time period',
        },
      },
      required: ['performerId', 'period'],
    },
  },
  {
    name: 'compare_periods',
    description: 'Compare earnings between two time periods to see growth/decline',
    inputSchema: {
      type: 'object',
      properties: {
        performerId: { type: 'string', description: 'The unique identifier of the performer' },
        period1Start: { type: 'string', description: 'Start date of first period (ISO format)' },
        period1End: { type: 'string', description: 'End date of first period (ISO format)' },
        period2Start: { type: 'string', description: 'Start date of second period (ISO format)' },
        period2End: { type: 'string', description: 'End date of second period (ISO format)' },
      },
      required: ['performerId', 'period1Start', 'period1End', 'period2Start', 'period2End'],
    },
  },
];
