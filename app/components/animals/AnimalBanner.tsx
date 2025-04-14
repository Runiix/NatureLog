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
    <div className="relative w-full h-screen flex flex-col">
      <div className="relative w-full aspect-square lg:aspect-auto h-1/2 sm:min-h-2/3 lg:min-h-full">
        <Image
          ref={imageRef}
          src={image}
          alt="animal Banner"
          width={1920}
          height={1080}
          className="w-full h-full object-cover transition-opacity duration-[2s]"
          onLoad={handleImageLoad}
          priority
        />

        <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-gray-200/100 via-gray-200/0 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
