"use client";

import Image, { StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
export default function LandingInfo({
  src,
  position,
  title,
  text,
}: {
  src: StaticImageData;
  position: "left" | "right";
  title: string;
  text: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.5 } // 50% sichtbar
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);
  if (position === "right") {
    return (
      <div
        className={`transition-all duration-700 ease-in-out transform flex items-center justify-around w-full p-20 gap-10 border-b-2 border-gray-900 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
        }`}
        ref={ref}
      >
        {" "}
        <div className="">
          <h2 className="text-xl sm:text-3xl  text-gray-900">{title} </h2>
          <p className="text-xs sm:text-base text-gray-800">{text}</p>
        </div>
        <Image
          src={src}
          alt=""
          width={500}
          height={500}
          className="rounded-2xl w-1/2  object-cover"
        />
      </div>
    );
  } else {
    return (
      <div
        className={`transition-all duration-700 ease-in-out transform flex items-center justify-around w-full p-20 gap-10 border-b-2 border-gray-900 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
        }`}
        ref={ref}
      >
        {" "}
        <Image
          src={src}
          alt=""
          width={500}
          height={500}
          className="rounded-2xl w-1/2  object-cover"
        />
        <div className="">
          <h2 className="text-xl sm:text-3xl  text-gray-900">{title} </h2>
          <p className="text-xs sm:text-base text-gray-800">{text}</p>
        </div>
      </div>
    );
  }
}
