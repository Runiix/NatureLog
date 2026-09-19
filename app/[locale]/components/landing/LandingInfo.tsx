"use client";

import Image, { StaticImageData } from "next/image";
import { useEffect, useRef } from "react";
import { cn } from "@/app/[locale]/utils/cn";

const HIDDEN = ["opacity-0", "translate-y-8"];

/**
 * One feature row: text beside a framed screenshot, alternating sides.
 *
 * The server renders it fully visible. After hydration, rows that start below
 * the fold are hidden and fade in when scrolled to; rows already on screen,
 * users without JS and users who prefer reduced motion simply see the content.
 * It used to ship `opacity-0` in the HTML, so the whole section was blank
 * until JavaScript ran.
 */
export default function LandingInfo({
  index,
  src,
  position,
  title,
  text,
  alt,
}: {
  index: number;
  src: StaticImageData;
  position: "left" | "right";
  title: string;
  text: string;
  alt: string;
}) {
  const ref = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const belowFold = element.getBoundingClientRect().top > window.innerHeight;
    if (reduceMotion || !belowFold || !("IntersectionObserver" in window)) return;

    element.classList.add(...HIDDEN);
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          element.classList.remove(...HIDDEN);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <li
      ref={ref}
      className={cn(
        "grid items-center gap-8 py-12 transition-[opacity,transform] duration-700 ease-out md:grid-cols-2 md:gap-16 md:py-20",
      )}
    >
      <div className={cn("flex flex-col gap-3", position === "right" && "md:order-2")}>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent-text">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">{title}</h3>
        <p className="max-w-prose text-base leading-relaxed text-fg-muted sm:text-lg">{text}</p>
      </div>
      <div
        className={cn(
          "overflow-hidden rounded-2xl border border-border-muted bg-surface p-2 shadow-raised",
          position === "right" && "md:order-1",
        )}
      >
        <Image
          src={src}
          alt={alt}
          sizes="(min-width: 768px) 50vw, 100vw"
          className="h-auto max-h-[420px] w-full rounded-xl object-contain"
        />
      </div>
    </li>
  );
}
