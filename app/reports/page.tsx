'use client';

import { useJournal } from '@/hooks/useJournal';
import { AnalyticsDashboard } from '@/components/reports/analytics-dashboard';

export default function ReportsPage() {
  const { entries, isLoading } = useJournal();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Dashboard */}
        <AnalyticsDashboard entries={Object.values(entries)} />
      </div>
    </main>
  );
}
