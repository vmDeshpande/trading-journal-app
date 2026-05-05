/**
 * Analytics and calculation utilities for journal entries
 */

import { JournalEntry, WeeklyStats, MonthlyStats, DailyStats } from './types';

/**
 * Get the start of week (Monday) for a given date
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  return new Date(d.setDate(diff));
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get ISO week string (YYYY-Www)
 */
export function getISOWeek(date: Date): string {
  const d = new Date(date);
  const weekStart = getWeekStart(d);
  return formatDate(weekStart);
}

/**
 * Calculate daily statistics
 */
export function calculateDailyStats(entries: JournalEntry[]): DailyStats {
  if (entries.length === 0) {
    return {
      date: '',
      pnl: 0,
      tradesCount: 0,
      avgExecutionQuality: 0,
    };
  }

  const pnl = entries.reduce((sum, e) => sum + e.pnl, 0);
  const avgQuality = entries.reduce((sum, e) => sum + e.executionQuality, 0) / entries.length;

  return {
    date: entries[0].date,
    pnl,
    tradesCount: entries.length,
    avgExecutionQuality: avgQuality,
  };
}

/**
 * Calculate weekly statistics
 */
export function calculateWeeklyStats(entries: JournalEntry[]): WeeklyStats {
  if (entries.length === 0) {
    const today = new Date();
    const weekStart = getWeekStart(today);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    return {
      weekStart: formatDate(weekStart),
      weekEnd: formatDate(weekEnd),
      pnl: 0,
      profit: 0,
      loss: 0,
      tradesCount: 0,
      winRate: 0,
    };
  }

  const pnl = entries.reduce((sum, e) => sum + e.pnl, 0);
  const profit = entries.filter((e) => e.pnl > 0).reduce((sum, e) => sum + e.pnl, 0);
  const loss = Math.abs(entries.filter((e) => e.pnl < 0).reduce((sum, e) => sum + e.pnl, 0));

  const weekStart = getWeekStart(new Date(entries[0].date));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const winCount = entries.filter((e) => e.pnl > 0).length;
  const winRate = entries.length > 0 ? (winCount / entries.length) * 100 : 0;

  return {
    weekStart: formatDate(weekStart),
    weekEnd: formatDate(weekEnd),
    pnl,
    profit,
    loss,
    tradesCount: entries.length,
    winRate,
  };
}

/**
 * Calculate monthly statistics
 */
export function calculateMonthlyStats(entries: JournalEntry[]): MonthlyStats {
  if (entries.length === 0) {
    const now = new Date();
    return {
      month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
      pnl: 0,
      profit: 0,
      loss: 0,
      tradesCount: 0,
      winRate: 0,
    };
  }

  const pnl = entries.reduce((sum, e) => sum + e.pnl, 0);
  const profit = entries.filter((e) => e.pnl > 0).reduce((sum, e) => sum + e.pnl, 0);
  const loss = Math.abs(entries.filter((e) => e.pnl < 0).reduce((sum, e) => sum + e.pnl, 0));

  const date = new Date(entries[0].date);
  const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

  const winCount = entries.filter((e) => e.pnl > 0).length;
  const winRate = entries.length > 0 ? (winCount / entries.length) * 100 : 0;

  return {
    month,
    pnl,
    profit,
    loss,
    tradesCount: entries.length,
    winRate,
  };
}

/**
 * Group entries by week
 */
export function groupByWeek(entries: JournalEntry[]): Record<string, JournalEntry[]> {
  const grouped: Record<string, JournalEntry[]> = {};

  entries.forEach((entry) => {
    const weekStart = getISOWeek(new Date(entry.date));
    if (!grouped[weekStart]) {
      grouped[weekStart] = [];
    }
    grouped[weekStart].push(entry);
  });

  return grouped;
}

/**
 * Group entries by month
 */
export function groupByMonth(entries: JournalEntry[]): Record<string, JournalEntry[]> {
  const grouped: Record<string, JournalEntry[]> = {};

  entries.forEach((entry) => {
    const [year, month] = entry.date.split('-').slice(0, 2);
    const monthKey = `${year}-${month}`;
    if (!grouped[monthKey]) {
      grouped[monthKey] = [];
    }
    grouped[monthKey].push(entry);
  });

  return grouped;
}

/**
 * Get all entries for current week
 */
export function getCurrentWeekEntries(entries: JournalEntry[]): JournalEntry[] {
  const today = new Date();
  const weekStart = getWeekStart(today);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const startStr = formatDate(weekStart);
  const endStr = formatDate(weekEnd);

  return entries.filter((e) => e.date >= startStr && e.date <= endStr);
}

/**
 * Get all entries for current month
 */
export function getCurrentMonthEntries(entries: JournalEntry[]): JournalEntry[] {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const startStr = formatDate(monthStart);
  const endStr = formatDate(monthEnd);

  return entries.filter((e) => e.date >= startStr && e.date <= endStr);
}
