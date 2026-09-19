/**
 * @jest-environment node
 */
import { cn } from "@/app/[locale]/utils/cn";

describe("cn", () => {
  test("later conflicting utility wins, regardless of CSS source order", () => {
    expect(cn("p-4", "p-0")).toBe("p-0");
    expect(cn("px-2 py-1", "p-3")).toBe("p-3");
    expect(cn("bg-green-600 text-white", "bg-red-600")).toBe("text-white bg-red-600");
  });

  test("keeps non-conflicting utilities and variants apart", () => {
    expect(cn("p-4", "hover:p-0")).toBe("p-4 hover:p-0");
    expect(cn("rounded-lg", "rounded-t-none")).toBe("rounded-lg rounded-t-none");
  });

  test("understands the theme's custom utilities", () => {
    // Token shadows are shadow sizes, so they replace one another and a
    // default size, and survive a later shadow colour.
    expect(cn("shadow-lg", "shadow-card")).toBe("shadow-card");
    expect(cn("shadow-card", "shadow-black")).toBe("shadow-card shadow-black");
    // The gradient is a background image, independent of background colour.
    expect(cn("bg-surface", "bg-surface-gradient")).toBe("bg-surface bg-surface-gradient");
    expect(cn("bg-surface", "bg-canvas")).toBe("bg-canvas");
    // Token colours still conflict with each other within a property.
    expect(cn("text-fg", "text-fg-muted")).toBe("text-fg-muted");
    expect(cn("text-lg", "text-fg-muted")).toBe("text-lg text-fg-muted");
  });

  test("drops falsy values like clsx", () => {
    const disabled = false;
    expect(cn("btn", disabled && "opacity-50", undefined, null, { hidden: false })).toBe("btn");
  });
});
