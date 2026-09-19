import { cn } from "@/app/[locale]/utils/cn";

/**
 * Full-width themed background plus a centred content column: the standard
 * frame for a page below the fixed nav.
 */
export function PageShell({
  children,
  width = "wide",
  className,
}: {
  children: React.ReactNode;
  width?: "narrow" | "wide";
  className?: string;
}) {
  return (
    <div className="min-h-[calc(100svh-2.5rem)] w-full bg-canvas font-normal text-fg sm:min-h-[calc(100svh-4rem)]">
      <div
        className={cn(
          "mx-auto flex w-full flex-col gap-5 px-4 py-5 sm:gap-8 sm:px-6 sm:py-12",
          width === "wide" ? "max-w-6xl" : "max-w-3xl",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
