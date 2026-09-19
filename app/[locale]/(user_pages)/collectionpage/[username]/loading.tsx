import { PageShell } from "@/app/[locale]/components/ui/PageShell";
import { Skeleton, SkeletonCard } from "@/app/[locale]/components/ui/Skeleton";

export default function Loading() {
  return (
    <PageShell>
      <div className="flex flex-col gap-2" aria-hidden>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="flex gap-2 overflow-hidden" aria-hidden>
        {Array.from({ length: 7 }, (_, i) => (
          <Skeleton key={i} className="h-14 w-28 shrink-0" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-4" aria-hidden>
        {Array.from({ length: 8 }, (_, i) => (
          <SkeletonCard key={i} className="aspect-[4/3.6]" />
        ))}
      </div>
      <span className="sr-only" role="status">
        Loading
      </span>
    </PageShell>
  );
}
