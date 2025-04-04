"use client";

import Image from "next/image";
import React from "react";

export default function AnimalBanner({ image }: any) {
  return (
    <div>
      <Image
        src={image}
        alt="animal Banner"
        width={1200}
        height={800}
        className="absolute w-full h-1/2 sm:h-full object-cover transition-opacity duration-[2s] opacity-0"
        onLoadingComplete={(image) => image.classList.remove("opacity-0")}
        priority
      />
    </div>
  );
}
