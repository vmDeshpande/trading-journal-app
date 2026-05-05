'use client';

import { useRouter } from 'next/navigation';
import { useJournal } from '@/hooks/useJournal';
import { Calendar } from '@/components/calendar/calendar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { entries, isLoading } = useJournal();

  const handleDateSelect = (date: string) => {
    router.push(`/date/${date}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
          <p className="text-muted-foreground">Loading your journal...</p>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-in fade-in slide-in-from-top-2 duration-500">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Trading Journal</h1>
            <p className="text-muted-foreground mt-2">Track your trades and analyze your performance</p>
          </div>
          <Button
            onClick={() => router.push(`/date/${today}`)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Today&apos;s Trade
          </Button>
        </div>

        {/* Calendar */}
        <Calendar
          entries={entries}
          onDateSelect={handleDateSelect}
        />
      </div>
    </main>
  );
}
