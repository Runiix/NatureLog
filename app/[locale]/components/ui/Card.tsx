import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/app/[locale]/utils/cn";

const cardStyles = cva("rounded-xl border text-fg", {
  variants: {
    variant: {
      solid: "border-border-muted bg-surface shadow-card",
      gradient: "border-border-muted bg-surface bg-surface-gradient shadow-card",
      flat: "border-border-muted bg-surface-raised",
    },
    padding: {
      none: "",
      sm: "p-3",
      md: "p-4 sm:p-5",
      lg: "p-5 sm:p-8",
    },
    interactive: {
      // Only for cards with a real handler or href: the hover state promises
      // that clicking does something.
      true: [
        "cursor-pointer transition-colors duration-150 hover:border-accent",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
      ],
    },
  },
  defaultVariants: { variant: "solid", padding: "md" },
});

type CardOwnProps<T extends React.ElementType> = VariantProps<typeof cardStyles> & {
  as?: T;
  className?: string;
};

/** Polymorphic surface: `as="button"`, `as={Link}`, `as="li"`, … */
export function Card<T extends React.ElementType = "div">({
  as,
  variant,
  padding,
  interactive,
  className,
  ...props
}: CardOwnProps<T> & Omit<React.ComponentPropsWithoutRef<T>, keyof CardOwnProps<T>>) {
  const Component = as ?? "div";
  return (
    <Component
      className={cn(cardStyles({ variant, padding, interactive }), className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-3 border-b border-border-muted pb-3",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({
  as: Heading = "h3",
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { as?: "h2" | "h3" | "h4" }) {
  return (
    <Heading
      className={cn("text-lg font-semibold leading-tight text-fg", className)}
      {...props}
    />
  );
}

export function CardActions({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center gap-1", className)} {...props} />;
}
