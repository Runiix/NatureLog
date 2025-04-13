"use client";

import Image from "next/image";
import React, { useRef } from "react";

export default function AnimalBanner({ image }: any) {
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleImageLoad = () => {
    if (imageRef.current) {
      imageRef.current.classList.remove("opacity-0");
    }
  };
  return (
    <div>
      <Image
        ref={imageRef}
        src={image}
        alt="animal Banner"
        width={1200}
        height={800}
        className="absolute w-full h-1/2 sm:h-full object-cover transition-opacity duration-[2s] opacity-0"
        onLoad={handleImageLoad}
        priority
      />
    </div>
  );
}
