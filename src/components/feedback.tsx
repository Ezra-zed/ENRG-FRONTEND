import React from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/form-controls';


export function StatusPill({ status }: { status?: string }) {
  const label = status?.replaceAll('-', ' ') || 'unknown';
  const tone = ['won', 'accepted', 'verified'].includes(status || '') ? 'bg-[#dcefe4] text-[#21624b]' : ['lost', 'rejected'].includes(status || '') ? 'bg-[#f8e1dd] text-[#a03e31]' : 'bg-[#fff0c9] text-[#765300]';
  return (
    <span data-testid={`status-${status || 'unknown'}`} className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${tone}`}>
      {label}
    </span>
  );
}

export function QueryState({ loading, error, onRetry, children, empty = false, emptyText = 'Nothing to show yet.' }: { loading?: boolean; error?: unknown; onRetry?: () => void; children: React.ReactNode; empty?: boolean; emptyText?: string }) {
  if (loading)
    return (
      <div className="grid gap-3" role="status" aria-live="polite" aria-label="Loading content">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-20 rounded-2xl" aria-hidden="true" />
        ))}
      </div>
    );
  if (error)
    return (
      <div className="rounded-2xl border border-[#e4b5aa] bg-[#fff2ef] p-6 text-center">
        <p className="font-semibold text-[#8d3f34]">We couldn't load this just now.</p>
        <p className="mt-1 text-sm text-[#a55a4d]">Your data has not been changed.</p>
        <Button data-testid="button-retry" variant="outline" className="mt-4" onClick={onRetry}>
          <RefreshCw size={15} /> Try again
        </Button>
      </div>
    );
  if (empty)
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center">
        <Sparkles className="mx-auto text-primary" size={26} />
        <p className="mt-3 font-display text-lg font-semibold">{emptyText}</p>
        <p className="mt-1 text-sm text-muted-foreground">New activity will appear here as it arrives.</p>
      </div>
    );
  return <>{children}</>;
}
