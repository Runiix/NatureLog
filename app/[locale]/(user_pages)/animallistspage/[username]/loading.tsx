import { PageShell } from "@/app/[locale]/components/ui/PageShell";
import { Skeleton, SkeletonCard } from "@/app/[locale]/components/ui/Skeleton";

/** Mirrors the lists page layout so nothing jumps when it arrives. */
export default function Loading() {
  return (
    <PageShell>
      <div className="flex flex-col gap-2" aria-hidden>
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden>
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonCard key={i} className="h-32" />
        ))}
      </div>
      <span className="sr-only" role="status">
        Loading
      </span>
    </PageShell>
  );
}
