"use client";

import Image from "next/image";
import React, { useState } from "react";
import black from "@/app/assets/images/black.webp";

export default function DailyQuiz({ data }: { data: any }) {
  const randomValue = Math.floor(Math.random() * 4);
  const [answer, setAnswer] = useState(0);
  const [answered, setAnswered] = useState(false);

  const handleCheckbox = (id: number) => {
    setAnswer(id);
    setAnswered(true);
  };

  return (
    <div>
      <Image
        src={black}
        alt="QuizImage"
        width="300"
        height="200"
        className="w-full aspect-video mb-10 rounded-t-lg"
      />
      <div className="grid grid-cols-2 grid-rows-2 gap-2">
        {data.map((animal: any, index: number) => (
          <button
            key={animal.id}
            className="flex items-center gap-2 border-slate-200 hover:border-green-600 border-2 w-44 mx-auto p-2 rounded-full group bg-gradient-to-b hover:to-60% hover:from-green-600 hover:to-gray-900"
            onClick={() => handleCheckbox(animal.id)}
          >
            {answered &&
            animal.id === answer &&
            answer === data[randomValue].id ? (
              <div className="bg-green-600 w-6 h-6 rounded-full"></div>
            ) : (
              answered &&
              animal.id === answer && (
                <div className="bg-red-600 w-6 h-6 rounded-full"></div>
              )
            )}
            <p>{animal.common_name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
