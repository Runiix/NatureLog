import Image from "next/image";
import black from "@/app/[locale]/assets/images/black.webp";
import { cn } from "@/app/[locale]/utils/cn";
import { Link } from "@/i18n/navigation";
import { Card } from "../ui/Card";

/** A species tile linking to its lexicon page, with an optional status line. */
export function SpeciesCard({
  commonName,
  lexiconLink,
  footer,
  dimmed = false,
}: {
  commonName: string;
  lexiconLink: string | null;
  footer?: React.ReactNode;
  /** Greyed out, e.g. a species the viewer has not found yet. */
  dimmed?: boolean;
}) {
  return (
    <Card
      as={Link}
      href={`/animalpage/${commonName}`}
      padding="none"
      interactive
      className="group/card flex h-full flex-col overflow-hidden"
    >
      <span className="relative block aspect-[4/3] w-full overflow-hidden bg-surface-sunken">
        <Image
          src={lexiconLink ?? black}
          alt=""
          fill
          sizes="(min-width: 1280px) 18vw, (min-width: 1024px) 23vw, (min-width: 640px) 30vw, 50vw"
          className={cn(
            "object-cover transition duration-300 group-hover/card:scale-[1.03]",
            dimmed && "opacity-50 grayscale",
          )}
        />
      </span>
      <span className="flex flex-1 flex-col gap-1 p-3">
        <span
          lang="de"
          className={cn("line-clamp-2 hyphens-auto break-words font-semibold", dimmed && "text-fg-muted")}
        >
          {commonName}
        </span>
        {footer && (
          <span className="flex items-center gap-1 truncate text-xs text-fg-muted">{footer}</span>
        )}
      </span>
    </Card>
  );
}
