import { cn } from "@/app/[locale]/utils/cn";

/** A thin labelled progress bar with its "value/max" count beside it. */
export function ProgressBar({
  label,
  value,
  max,
  className,
}: {
  /** Accessible name of the bar. */
  label: string;
  value: number;
  max: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <progress
        value={Math.min(value, max)}
        max={max}
        aria-label={label}
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-sunken [&::-moz-progress-bar]:bg-accent [&::-webkit-progress-bar]:bg-surface-sunken [&::-webkit-progress-value]:bg-accent"
      />
      <span className="text-xs tabular-nums text-fg-subtle">
        {value}/{max}
      </span>
    </div>
  );
}
