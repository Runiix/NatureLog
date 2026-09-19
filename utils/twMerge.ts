import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge only knows Tailwind's default scale. Unregistered custom keys
 * fall through to the catch-all colour groups, so a token shadow would be
 * treated as a shadow colour (and wiped by a later shadow colour) and the
 * surface gradient as a background colour (and wiped by a background colour).
 * These entries mirror theme.extend in tailwind.config.ts and must be kept in
 * step with it.
 *
 * Lives outside app/ on purpose: Tailwind scans app/ for class names, and the
 * group keys below would otherwise emit a stray `.shadow` rule.
 */
export const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      shadow: [{ shadow: ["card", "raised", "overlay"] }],
      "bg-image": [{ bg: ["surface-gradient"] }],
    },
  },
});
