"use client";

import Image from "next/image";
import React, { useRef } from "react";

export default function AnimalBanner({
  image,
  credit_link,
  credit_text,
  license_link,
  license_text,
}: {
  image: string;
  credit_link: string;
  credit_text: string;
  license_link: string;
  license_text: string;
}) {
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleImageLoad = () => {
    if (imageRef.current) {
      imageRef.current.classList.remove("opacity-0");
    }
  };
  return (
    <div className="relative w-full flex flex-col">
      <div className="relative w-full aspect-square md:aspect-[5/4] lg:aspect-video h-1/2 sm:min-h-2/3 lg:min-h-full lg:max-h-[800px]">
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
        {credit_link && (
          <p className="text-xs text-gray-600 absolute bottom-0 right-10 z-50 ">
            Foto:{" "}
            <a
              className="hover:underline"
              href={credit_link}
              target="_blank"
              rel="noopener"
            >
              {credit_text}
            </a>
            ,{" "}
            <a
              className="hover:underline"
              href={license_link}
              target="_blank"
              rel="noopener"
            >
              {license_text}
            </a>
          </p>
        )}

        <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-gray-200/100 via-gray-200/0 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
