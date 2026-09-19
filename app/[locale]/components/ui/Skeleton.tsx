import { cn } from "@/app/[locale]/utils/cn";

/** Placeholder block. Pulses unless the user prefers reduced motion. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("rounded-lg bg-surface-sunken motion-safe:animate-pulse", className)}
    />
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div aria-hidden className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cn("h-3", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border-muted bg-surface p-4",
        className,
      )}
    >
      <Skeleton className="h-5 w-1/2" />
      <SkeletonText lines={2} />
    </div>
  );
}
