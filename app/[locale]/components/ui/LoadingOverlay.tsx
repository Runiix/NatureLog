import type { ReactNode } from "react";
import { cn } from "@/app/[locale]/utils/cn";
import { Spinner } from "./Spinner";

/**
 * Keeps the current results on screen, dimmed and inert, while new ones load,
 * with a spinner that stays in view as the user scrolls. Avoids the grid
 * looking frozen between typing a search and the new results arriving.
 */
export function LoadingOverlay({
  loading,
  label,
  children,
}: {
  loading: boolean;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="relative" aria-busy={loading}>
      <div
        className={cn(
          "transition-opacity duration-200",
          loading && "pointer-events-none select-none opacity-40",
        )}
      >
        {children}
      </div>
      {loading && (
        <div className="pointer-events-none absolute inset-0 flex justify-center">
          <div className="sticky top-[40vh] mt-16 flex h-fit items-center gap-2 rounded-full border border-border-muted bg-surface px-4 py-2 text-sm text-fg-muted shadow-card">
            <Spinner size="sm" className="text-accent" />
            <span role="status">{label}</span>
          </div>
        </div>
      )}
    </div>
  );
}
