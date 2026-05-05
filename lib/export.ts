/**
 * Excel export functionality for journal entries
 */

import * as XLSX from 'xlsx';
import { JournalEntry, WeeklyStats, MonthlyStats } from './types';
import {
  groupByMonth,
  calculateMonthlyStats,
  groupByWeek,
  calculateWeeklyStats,
} from './analytics';

interface ExportData {
  entries: JournalEntry[];
}

export function exportToExcel({ entries }: ExportData) {
  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Sheet 1: All Entries
  const entriesData = entries.map((entry) => ({
    Date: entry.date,
    Index: entry.index,
    Direction: entry.direction.toUpperCase(),
    'Entry Price': entry.entryPrice,
    'Exit Price': entry.exitPrice,
    'P&L': entry.pnl,
    'Execution Quality': entry.executionQuality,
    Notes: entry.notes,
  }));

  const entriesSheet = XLSX.utils.json_to_sheet(entriesData);
  XLSX.utils.book_append_sheet(workbook, entriesSheet, 'Entries');

  // Sheet 2: Monthly Summary
  const entriesByMonth = groupByMonth(entries);
  const monthlySummary = Object.entries(entriesByMonth)
    .map(([month, monthEntries]) => {
      const stats = calculateMonthlyStats(monthEntries);
      return {
        Month: month,
        'Total P&L': stats.pnl,
        Profit: stats.profit,
        Loss: -stats.loss,
        Trades: stats.tradesCount,
        'Win Rate %': stats.winRate.toFixed(2),
      };
    })
    .sort((a, b) => a.Month.localeCompare(b.Month));

  const monthlySummarySheet = XLSX.utils.json_to_sheet(monthlySummary);
  XLSX.utils.book_append_sheet(workbook, monthlySummarySheet, 'Monthly Summary');

  // Sheet 3: Weekly Summary
  const entriesByWeek = groupByWeek(entries);
  const weeklySummary = Object.entries(entriesByWeek)
    .map(([weekStart, weekEntries]) => {
      const stats = calculateWeeklyStats(weekEntries);
      return {
        'Week Start': stats.weekStart,
        'Week End': stats.weekEnd,
        'Total P&L': stats.pnl,
        Profit: stats.profit,
        Loss: -stats.loss,
        Trades: stats.tradesCount,
        'Win Rate %': stats.winRate.toFixed(2),
      };
    })
    .sort((a, b) => a['Week Start'].localeCompare(b['Week Start']));

  const weeklySummarySheet = XLSX.utils.json_to_sheet(weeklySummary);
  XLSX.utils.book_append_sheet(workbook, weeklySummarySheet, 'Weekly Summary');

  // Generate file
  const fileName = `trading-journal-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
