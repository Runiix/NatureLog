"use client";

import Image, { StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
export default function LandingInfo({
  src,
  position,
  title,
  text,
  video,
}: {
  src: StaticImageData | any;
  position: "left" | "right";
  title: string;
  text: string;
  video: boolean;
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
  return (
    <div
      className={`transition-all duration-700 ease-in-out transform  items-center justify-around w-full px-4 sm:py-20 py-12 gap-10 border-b-2 border-gray-900 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
      } ${
        position === "right"
          ? "flex flex-col sm:flex-row"
          : "flex flex-col sm:flex-row-reverse"
      }`}
      ref={ref}
    >
      {" "}
      <div className="">
        <h2 className="text-xl sm:text-3xl  text-gray-900">{title} </h2>
        <p className="text-xs sm:text-base text-gray-800">{text}</p>
      </div>
      {video ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          width="200"
          height="400"
          className="rounded-lg shadow-lg w-full max-w-md"
        >
          <source src={src} type="video/mp4" />
          Dein Browser unterstützt keine Videos
        </video>
      ) : (
        <Image
          src={src}
          alt=""
          width={500}
          height={500}
          className="rounded-2xl sm:w-1/2  object-cover"
        />
      )}
    </div>
  );
}
