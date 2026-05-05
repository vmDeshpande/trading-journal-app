'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { JournalEntry } from '@/lib/types';
import { getPnLColor, formatPnL, calculateDailyPnL } from '@/lib/pnl-calculator';
import { cn } from '@/lib/utils';

interface CalendarProps {
  entries: Record<string, JournalEntry>;
  onDateSelect: (date: string) => void;
  selectedDate?: string;
}

export function Calendar({ entries, onDateSelect, selectedDate }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const daysCount = daysInMonth(currentDate);
  const firstDay = firstDayOfMonth(currentDate);

  const days = Array.from({ length: firstDay }, () => null).concat(
    Array.from({ length: daysCount }, (_, i) => i + 1)
  );

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getDateString = (day: number): string => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getEntriesForDate = (day: number) => {
    const dateStr = getDateString(day);
    return Object.values(entries).filter((e) => e.date === dateStr);
  };

  const getDayPnL = (day: number): number => {
    const dayEntries = getEntriesForDate(day);
    return calculateDailyPnL(dayEntries);
  };

  return (
    <Card className="w-full p-6 bg-card">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            {monthNames[month]} {year}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={previousMonth}
              className="h-9 w-9 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextMonth}
              className="h-9 w-9 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="h-10 flex items-center justify-center text-sm font-semibold text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="h-24 bg-muted/30 rounded-lg" />;
            }

            const dateStr = getDateString(day);
            const dayEntries = getEntriesForDate(day);
            const dayPnL = getDayPnL(day);
            const isSelected = dateStr === selectedDate;
            const hasEntries = dayEntries.length > 0;

            return (
              <button
                key={day}
                onClick={() => onDateSelect(dateStr)}
                className={cn(
                  'h-24 rounded-lg border-2 p-2 text-left transition-all duration-200 hover:border-primary hover:shadow-md cursor-pointer',
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : hasEntries
                    ? getPnLColor(dayPnL)
                    : 'border-border bg-card hover:bg-accent'
                )}
              >
                <div className="text-sm font-semibold text-foreground">{day}</div>
                {hasEntries && (
                  <div className="mt-2 space-y-2">
                    {/* Net P&L - Prominent */}
                    <div className={cn(
                      'text-center py-1 px-2 rounded border-2 font-bold',
                      dayPnL > 0
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : dayPnL < 0
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    )}>
                      {formatPnL(dayPnL)}
                    </div>
                    
                    {/* Trade Count */}
                    <div className="text-xs text-center text-muted-foreground font-medium">
                      {dayEntries.length} {dayEntries.length === 1 ? 'trade' : 'trades'}
                    </div>
                    
                    {/* Compact Direction Indicators - Max 2 with +X more */}
                    <div className="flex gap-1 justify-center flex-wrap">
                      {dayEntries.slice(0, 2).map((entry, i) => (
                        <div
                          key={i}
                          className={cn(
                            'px-1.5 py-0.5 rounded text-xs font-bold text-white',
                            entry.direction === 'buy' ? 'bg-green-600' : 'bg-red-600'
                          )}
                          title={`${entry.index} ${entry.direction === 'buy' ? 'BUY' : 'SELL'}`}
                        >
                          {entry.direction === 'buy' ? '↑' : '↓'}
                        </div>
                      ))}
                      {dayEntries.length > 2 && (
                        <div className="px-1.5 py-0.5 rounded text-xs font-bold text-slate-600 bg-slate-200">
                          +{dayEntries.length - 2}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
