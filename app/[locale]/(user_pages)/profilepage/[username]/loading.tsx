import { PageShell } from "@/app/[locale]/components/ui/PageShell";
import { Skeleton } from "@/app/[locale]/components/ui/Skeleton";

/** Mirrors the profile layout so nothing jumps when it arrives. */
export default function Loading() {
  return (
    <PageShell>
      <div
        aria-hidden
        className="flex flex-col items-center gap-6 rounded-xl border border-border-muted bg-surface p-5 sm:flex-row sm:items-start sm:gap-8 sm:p-8"
      >
        <Skeleton className="h-28 w-28 rounded-full sm:h-32 sm:w-32" />
        <div className="flex w-full flex-1 flex-col gap-5">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </div>
      </div>
      <div aria-hidden className="flex flex-col gap-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>
      <span className="sr-only" role="status">
        Loading
      </span>
    </PageShell>
  );
}
