"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/app/[locale]/utils/cn";

const SIZES = { sm: "h-9 w-9 text-sm", md: "h-12 w-12 text-base", lg: "h-16 w-16 text-lg" } as const;

/**
 * Round profile picture with an initial as fallback — both when the user has
 * no picture and when the image fails to load. Replaces MUI's Avatar, the
 * last use of @mui/material outside the size slider.
 */
export function Avatar({
  src,
  name,
  alt,
  size = "md",
  className,
}: {
  src: string | null;
  name: string;
  alt: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent/15 font-semibold uppercase text-accent-text",
        SIZES[size],
        className,
      )}
    >
      {showImage ? (
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          sizes="64px"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden>{name.trim().charAt(0) || "?"}</span>
      )}
    </span>
  );
}
