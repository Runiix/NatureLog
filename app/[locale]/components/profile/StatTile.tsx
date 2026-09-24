import { Link } from "@/i18n/navigation";
import { cn } from "@/app/[locale]/utils/cn";

const base =
  "flex min-w-0 flex-col items-start gap-1 rounded-xl border border-border-muted bg-surface-raised px-4 py-3 text-left";
const interactive =
  "transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

/**
 * One profile statistic. Renders as a link, a button or plain box depending on
 * what it does — the four near-identical 200-character class strings it
 * replaces made the non-interactive ones look clickable too.
 */
export function StatTile({
  label,
  value,
  detail,
  href,
  onClick,
  actionLabel,
}: {
  label: string;
  value: React.ReactNode;
  /** Small line under the value. */
  detail?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  /** Accessible name when the tile is a control, e.g. "Change favourite animal". */
  actionLabel?: string;
}) {
  const content = (
    <>
      <span className="text-xs font-medium uppercase tracking-wide text-fg-subtle">{label}</span>
      <span className="w-full truncate text-lg font-semibold tabular-nums text-fg">{value}</span>
      {detail && <span className="w-full truncate text-xs tabular-nums text-fg-muted">{detail}</span>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn(base, interactive)}>
        {content}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(base, interactive)}
      >
        {content}
        {/* Appended rather than an aria-label, which would hide the value. */}
        {actionLabel && <span className="sr-only">, {actionLabel}</span>}
      </button>
    );
  }
  return <div className={base}>{content}</div>;
}
