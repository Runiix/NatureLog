"use client";

import type { MouseEvent, ReactNode } from "react";

/**
 * Anchor link that smooth-scrolls to the element with `targetId` instead of
 * jumping. Stays a plain `#targetId` link without JS; reduced-motion users
 * get the instant jump.
 */
export function ScrollHint({
  targetId,
  className,
  children,
}: {
  targetId: string;
  className?: string;
  children: ReactNode;
}) {
  const scrollDown = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(targetId);
    if (!target) return;
    event.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <a href={`#${targetId}`} onClick={scrollDown} className={className}>
      {children}
    </a>
  );
}
