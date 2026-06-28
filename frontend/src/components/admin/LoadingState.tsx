export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="text-xs uppercase tracking-widest">{label}</p>
    </div>
  );
}