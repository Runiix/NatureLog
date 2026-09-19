import { cn } from "@/app/[locale]/utils/cn";

/** What a list or section shows when it has nothing in it — never a blank gap. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-10 text-center",
        className,
      )}
    >
      {icon && (
        <div
          aria-hidden
          className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-sunken text-fg-subtle [&_svg]:h-6 [&_svg]:w-6"
        >
          {icon}
        </div>
      )}
      <p className="text-base font-semibold text-fg">{title}</p>
      {description && <p className="max-w-sm text-sm text-fg-muted">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
