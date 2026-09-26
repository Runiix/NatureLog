import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/app/[locale]/utils/cn";
import { Spinner } from "./Spinner";

/**
 * The one button recipe. Shared by Button and ButtonLink because most
 * "buttons" in this app are navigation, and both must look identical.
 */
const buttonStyles = cva(
  [
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium",
    "transition-colors duration-150 select-none whitespace-nowrap",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
    "disabled:pointer-events-none disabled:opacity-60",
  ],
  {
    variants: {
      variant: {
        primary: "bg-accent-solid text-accent-fg hover:bg-accent-hover",
        secondary:
          "border border-border bg-surface text-fg hover:border-accent hover:text-accent-text",
        ghost: "text-fg-muted hover:bg-surface-sunken hover:text-fg",
        danger: "bg-danger-solid text-white hover:bg-danger-solid/90",
        link: "px-0 text-accent-text underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 p-0",
      },
      fullWidth: { true: "w-full" },
    },
    compoundVariants: [{ variant: "link", className: "h-auto" }],
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type StyleProps = VariantProps<typeof buttonStyles>;

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  StyleProps & {
    /** Shows a spinner, disables the button and keeps its width. */
    loading?: boolean;
    /** Usually an MUI icon; inherits the text colour. */
    icon?: React.ReactNode;
    iconPosition?: "start" | "end";
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant,
    size,
    fullWidth,
    loading = false,
    icon,
    iconPosition = "start",
    disabled,
    children,
    type = "button",
    ...props
  },
  ref,
) {
  const glyph = loading ? <Spinner size="sm" /> : icon;
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonStyles({ variant, size, fullWidth }), className)}
      {...props}
    >
      {glyph && iconPosition === "start" && (
        <span aria-hidden className="flex shrink-0 [&_svg]:h-5 [&_svg]:w-5">
          {glyph}
        </span>
      )}
      {children}
      {glyph && iconPosition === "end" && (
        <span aria-hidden className="flex shrink-0 [&_svg]:h-5 [&_svg]:w-5">
          {glyph}
        </span>
      )}
    </button>
  );
});

type ButtonLinkProps = React.ComponentProps<typeof Link> &
  StyleProps & {
    icon?: React.ReactNode;
    iconPosition?: "start" | "end";
  };

/** A locale-aware link that looks like a Button. */
export function ButtonLink({
  className,
  variant,
  size,
  fullWidth,
  icon,
  iconPosition = "start",
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(buttonStyles({ variant, size, fullWidth }), className)}
      {...props}
    >
      {icon && iconPosition === "start" && (
        <span aria-hidden className="flex shrink-0 [&_svg]:h-5 [&_svg]:w-5">
          {icon}
        </span>
      )}
      {children}
      {icon && iconPosition === "end" && (
        <span aria-hidden className="flex shrink-0 [&_svg]:h-5 [&_svg]:w-5">
          {icon}
        </span>
      )}
    </Link>
  );
}
