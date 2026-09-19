import { cn } from "@/app/[locale]/utils/cn";

const SIZES = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-[3px]",
} as const;

/**
 * Loading indicator in the current text colour (accent by default). Replaces
 * react-spinners' CircleLoader and its hard-coded #16A34A. Announced to screen
 * readers only when given a label; inside a Button the button's aria-busy
 * already says it.
 */
export function Spinner({
  size = "md",
  label,
  className,
}: {
  size?: keyof typeof SIZES;
  label?: string;
  className?: string;
}) {
  return (
    <span
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(
        "inline-block shrink-0 animate-spin rounded-full border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]",
        SIZES[size],
        className,
      )}
    />
  );
}
