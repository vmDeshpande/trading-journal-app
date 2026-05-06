'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { JournalEntry } from '@/lib/types';
import {
  getCurrentMonthEntries,
  getCurrentWeekEntries,
  calculateMonthlyStats,
  calculateWeeklyStats,
} from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportToExcel } from '@/lib/export';

interface AnalyticsDashboardProps {
  entries: JournalEntry[];
}

const COLORS = {
  profit: '#22c55e',
  loss: '#ef4444',
};

export function AnalyticsDashboard({ entries }: AnalyticsDashboardProps) {
  const weekEntries = useMemo(() => getCurrentWeekEntries(entries), [entries]);
  const monthEntries = useMemo(() => getCurrentMonthEntries(entries), [entries]);

  const weekStats = useMemo(() => calculateWeeklyStats(weekEntries), [weekEntries]);
  const monthStats = useMemo(() => calculateMonthlyStats(monthEntries), [monthEntries]);

  const weekChartData = useMemo(
    () => [
      { name: 'Profit', value: Math.max(0, weekStats.profit) },
      { name: 'Loss', value: Math.max(0, weekStats.loss) },
    ].filter((item) => item.value > 0),
    [weekStats]
  );

  const monthChartData = useMemo(
    () => [
      { name: 'Profit', value: Math.max(0, monthStats.profit) },
      { name: 'Loss', value: Math.max(0, monthStats.loss) },
    ].filter((item) => item.value > 0),
    [monthStats]
  );

  const handleExport = () => {
    exportToExcel({ entries });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
        <Button
          onClick={handleExport}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Download className="h-4 w-4" />
          Export to Excel
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Week P&L */}
        <Card className="p-6 bg-card space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Weekly P&L</p>
          <div
            className={`text-3xl font-bold ${
              weekStats.pnl >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {weekStats.pnl >= 0 ? '+' : ''}{weekStats.pnl.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">{weekStats.tradesCount} trades</p>
        </Card>

        {/* Month P&L */}
        <Card className="p-6 bg-card space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Monthly P&L</p>
          <div
            className={`text-3xl font-bold ${
              monthStats.pnl >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {monthStats.pnl >= 0 ? '+' : ''}{monthStats.pnl.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">{monthStats.tradesCount} trades</p>
        </Card>

        {/* Week Win Rate */}
        <Card className="p-6 bg-card space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Weekly Win Rate</p>
          <div className="text-3xl font-bold text-blue-600">
            {weekStats.winRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            {weekEntries.length > 0 ? weekEntries.filter((e) => e.pnl > 0).length : 0}W /{' '}
            {weekEntries.length > 0 ? weekEntries.filter((e) => e.pnl < 0).length : 0}L
          </p>
        </Card>

        {/* Month Win Rate */}
        <Card className="p-6 bg-card space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Monthly Win Rate</p>
          <div className="text-3xl font-bold text-blue-600">
            {monthStats.winRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            {monthEntries.length > 0 ? monthEntries.filter((e) => e.pnl > 0).length : 0}W /{' '}
            {monthEntries.length > 0 ? monthEntries.filter((e) => e.pnl < 0).length : 0}L
          </p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Chart */}
        <Card className="p-6 bg-card">
          <h2 className="text-xl font-bold text-foreground mb-4">Weekly Breakdown</h2>
          {weekChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={weekChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ₹${value.toFixed(2)}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={800}
                >
                  <Cell fill={COLORS.profit} />
                  <Cell fill={COLORS.loss} />
                </Pie>
                <Tooltip
                  formatter={(value) => `₹${(value as number).toFixed(2)}`}
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    color: '#fff',
                    borderRadius: '0.5rem',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              No trades this week
            </div>
          )}
        </Card>

        {/* Monthly Chart */}
        <Card className="p-6 bg-card">
          <h2 className="text-xl font-bold text-foreground mb-4">Monthly Breakdown</h2>
          {monthChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={monthChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ₹${value.toFixed(2)}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={800}
                >
                  <Cell fill={COLORS.profit} />
                  <Cell fill={COLORS.loss} />
                </Pie>
                <Tooltip
                  formatter={(value) => `₹${(value as number).toFixed(2)}`}
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    color: '#fff',
                    borderRadius: '0.5rem',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              No trades this month
            </div>
          )}
        </Card>
      </div>

      {/* Recent Trades */}
      {entries.length > 0 && (
        <Card className="p-6 bg-card">
          <h2 className="text-xl font-bold text-foreground mb-4">Recent Entries</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Index</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Direction</th>
                  <th className="text-right py-3 px-4 font-semibold text-foreground">P&L</th>
                  <th className="text-center py-3 px-4 font-semibold text-foreground">Quality</th>
                </tr>
              </thead>
              <tbody>
                {entries
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 10)
                  .map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-foreground">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground">{entry.index}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            entry.direction === 'buy'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {entry.direction.toUpperCase()}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-bold ${
                          entry.pnl > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {entry.pnl > 0 ? '+' : ''}{entry.pnl.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center text-muted-foreground">
                        {entry.executionQuality}/5
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
