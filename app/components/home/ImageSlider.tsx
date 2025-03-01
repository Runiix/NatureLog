"use client";

import { useState, useEffect } from "react";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Image from "next/image";

export default function ImageSlider({ data }: any) {
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    console.log("Slide Index", slideIndex);
  }, [slideIndex]);

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
      const newIndex = (slideIndex + 1) % data.length;
      setSlideIndex(newIndex);
    }, 10000);
    return () => clearInterval(intervalId);
  }, [slideIndex]);

  return (
    <div className=" relative w-full ">
      <div className="w-full h-full overflow-hidden flex">
        {data.map((slide: any) => (
          <Image
            key={slide.id}
            className=" object-cover translate-all duration-500 ease-in-out"
            src={slide.image_url}
            alt="Slide Image"
            width="600"
            height="200"
            style={{ translate: `${-100 * slideIndex}%` }}
          />
        ))}
      </div>
      <button
        className="block absolute top-0 bottom-0 left-0 cursor-pointer p-4"
        onClick={showPrevImage}
      >
        <ArrowBackIosIcon />
      </button>
      <button
        className="block absolute top-0 bottom-0 right-0 cursor-pointer p-4"
        onClick={showNextImage}
      >
        <ArrowForwardIosIcon />
      </button>
      <div className="flex gap-1 absolute bottom-1 z-50 left-4">
        {[...Array(data.length).keys()].map((index) => (
          <button
            key={index}
            className={`p-2 rounded-full  ${
              slideIndex === index
                ? "bg-slate-200"
                : "bg-gray-900 bg-opacity-50"
            }`}
            onClick={() => setSlideIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
