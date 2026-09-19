import { Skeleton, SkeletonCard } from "@/app/[locale]/components/ui/Skeleton";

/** Rendered inside the lexicon layout, next to the filter sidebar. */
export default function Loading() {
  return (
    <>
      <div className="flex flex-col gap-2" aria-hidden>
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-10 w-full sm:w-72" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4" aria-hidden>
        {Array.from({ length: 9 }, (_, i) => (
          <SkeletonCard key={i} className="aspect-[4/3.5]" />
        ))}
      </div>
      <span className="sr-only" role="status">
        Loading
      </span>
    </>
  );
}
