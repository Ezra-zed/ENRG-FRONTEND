export function PageLoadingState({ message = 'Loading page…' }: { message?: string }) {
  return (
    <div className="page-loading-state grid min-h-[calc(100dvh-72px)] place-items-center px-5" role="status" aria-live="polite">
      <span className="inline-flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground shadow-sm">
        <span className="page-loading-spinner" aria-hidden="true" />
        {message}
      </span>
    </div>
  );
}
