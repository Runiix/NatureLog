"use client";

import { useState, useEffect } from "react";

import Image from "next/image";
import Link from "next/link";
import { NavigateBefore, NavigateNext } from "@mui/icons-material";
export default function RecentAnimalImageUploads({
  data,
  animalName,
}: {
  data: { id: string; display_name: string }[];
  animalName: string;
}) {
  const [slideIndex, setSlideIndex] = useState(0);
  const regex = /[äöüß ]/g;

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
    <div className="relative overflow-hidden w-full h-auto flex flex-col items-center gap-3  border-t border-gray-400 md:px-20 py-10">
      <h2 className="text-xl">Zuletzt hochgeladene Fotos zu diesem Tier:</h2>
      {data.length > 0 ? (
        <div>
          {" "}
          <div className=" overflow-hidden flex relativ max-w-[600px] mx-auto">
            {data.map((slide: { id: string; display_name: string }) => (
              <Image
                key={slide.id}
                className=" object-cover translate-all duration-500 ease-in-out min-w-full w-full aspect-video"
                src={`https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profiles/${
                  slide.id
                }/CollectionModals/${animalName.replace(regex, "_") + ".jpg"}`}
                alt="Slide Image"
                width="800"
                height="600"
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
            <div className="flex gap-2 absolute bottom-20 z-40 left-1/2 transform -translate-x-1/2">
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
            href={`profilepage/${data[slideIndex].display_name}`}
            className="hover:text-green-600 decoration-solid underline transition-all duration-200 ease-in-out"
          >
            Von: {data[slideIndex].display_name}
          </Link>
        </div>
      ) : (
        <h2>Noch keine Fotos hochgeladen</h2>
      )}
    </div>
  );
}
