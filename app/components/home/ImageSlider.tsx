"use client";

import { useState, useEffect } from "react";

import Image from "next/image";
import Link from "next/link";
import { NavigateBefore, NavigateNext } from "@mui/icons-material";
type RecentUploadsType = {
  id: number;
  user_id: string;
  image_url: string;
  created_at: string;
  username: string;
};
export default function ImageSlider({ data }: { data: RecentUploadsType[] }) {
  const [slideIndex, setSlideIndex] = useState(0);

  function showPrevImage() {
    setSlideIndex((index) => {
      if (index === 0) return data.length - 1;
      return index - 1;
    });
  }
  function showNextImage() {
    setSlideIndex((index) => {
      if (index === data.length - 1) return 0;
      return index + 1;
    });
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % data.length);
    }, 10000);
    return () => clearInterval(intervalId);
  }, [slideIndex]);

  return (
    <div className="relative overflow-hidden h-[85%] flex flex-col gap-3">
      <div className=" overflow-hidden flex relative ">
        {data.map((slide: RecentUploadsType) => (
          <Image
            key={slide.id}
            className=" object-cover translate-all duration-500 ease-in-out min-w-full w-full"
            src={slide.image_url}
            alt="Slide Image"
            width="300"
            height="100"
            style={{ translate: `${-100 * slideIndex}%` }}
            unoptimized
          />
        ))}
        <button
          className="block absolute top-0 bottom-0 left-0 cursor-pointer p-4"
          aria-label="vorheriges Bild zeigen"
          onClick={showPrevImage}
        >
          <NavigateBefore />
        </button>
        <button
          className="block absolute top-0 bottom-0 right-0 cursor-pointer p-4"
          aria-label="nächstes Bild zeigen"
          onClick={showNextImage}
        >
          <NavigateNext />
        </button>
        <div className="flex gap-2 absolute bottom-2 z-40 left-1/2 transform -translate-x-1/2">
          {[...Array(data.length).keys()].map((index) => (
            <button
              key={index}
              aria-label="Knopf für die Image Slider Navigation"
              className={`p-2 rounded-full transition-all duration-500 ease-out  ${
                slideIndex === index
                  ? "bg-gray-200 w-8"
                  : "bg-gray-900 bg-opacity-50"
              }`}
              onClick={() => setSlideIndex(index)}
            />
          ))}
        </div>
      </div>
      <Link
        href={`profilepage/${data[slideIndex].username}`}
        className="hover:text-green-600 ml-4 decoration-solid underline transition-all duration-200 ease-in-out"
      >
        Von: {data[slideIndex].username}
      </Link>
    </div>
  );
}
