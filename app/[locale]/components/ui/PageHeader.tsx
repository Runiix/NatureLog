import { ArrowBack } from "@mui/icons-material";
import { cn } from "@/app/[locale]/utils/cn";
import { ButtonLink } from "./Button";

/**
 * The page's single <h1>, with an optional back link and action slot, all in
 * normal flow — replacing header bars that positioned their back link
 * absolutely and collided with the fixed nav.
 */
export function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel,
  actions,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:gap-3 sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-1 sm:gap-2">
        {backHref && (
          <ButtonLink
            href={backHref}
            variant="ghost"
            size="sm"
            icon={<ArrowBack />}
            className="-ml-3 self-start"
          >
            {backLabel}
          </ButtonLink>
        )}
        <h1 className="truncate text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="text-sm text-fg-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
