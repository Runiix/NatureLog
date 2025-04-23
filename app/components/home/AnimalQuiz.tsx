"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { ArrowForward, Cancel, CheckCircle } from "@mui/icons-material";
import getQuizAnimals from "@/app/actions/getQuizAnimals";
import { CircleLoader } from "react-spinners";
import Animal from "@/app/utils/AnimalType";

export default function AnimalQuiz() {
  const [randomIndex, setRandomIndex] = useState(0);
  const [answer, setAnswer] = useState(0);
  const [easyQuiz, setEasyQuiz] = useState(true);
  const [quizAnimals, setQuizAnimals] = useState<Animal[]>([]);
  const [nextAnimalSwitch, setNextAnimalSwitch] = useState(false);
  const [rightTextAnswer, setRightTextAnswer] = useState(false);
  const [textInput, setTextInput] = useState("");

  const handleCheckbox = (id: number) => {
    setAnswer(id);
  };
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setTextInput(value);
    if (value === quizAnimals[randomIndex].common_name.toLowerCase()) {
      setRightTextAnswer(true);
    }
  };

  useEffect(() => {
    setAnswer(0);
    if (textInput !== "") {
      setTextInput("");
    }
    if (rightTextAnswer) {
      setRightTextAnswer(false);
    }
    const getQuizData = async () => {
      const data = await getQuizAnimals();
      if (data) setQuizAnimals(data);
      const randomValue = Math.floor(Math.random() * 4);
      setRandomIndex(randomValue);
    };

    getQuizData();
  }, [nextAnimalSwitch]);

  return (
    <div>
      {quizAnimals.length > 0 ? (
        <Image
          src={quizAnimals[randomIndex].lexicon_link}
          alt={quizAnimals[randomIndex].scientific_name}
          width="300"
          height="100"
          className="w-full aspect-video mb-2 rounded-t-lg max-h-64"
        />
      ) : (
        <CircleLoader />
      )}
      {easyQuiz ? (
        <div className="grid grid-cols-2 grid-rows-2 gap-2 mb-2 h-24">
          {quizAnimals ? (
            quizAnimals.map((animal: Animal, index: number) => (
              <button
                key={animal.id}
                className={`flex items-center gap-1  hover:border-slate-400 border-2 w-44  mx-auto px-1 py-2 rounded-lg group hover:bg-gray-800 transition-all duration-200 ${
                  answer !== 0 &&
                  animal.id === answer &&
                  answer === quizAnimals[randomIndex].id
                    ? " bg-gradient-to-b to-60% from-green-600 to-gray-900"
                    : "border-slate-200"
                } ${
                  answer !== 0 &&
                  animal.id === answer &&
                  answer !== quizAnimals[randomIndex].id
                    ? "bg-gradient-to-b to-60% from-red-600 to-gray-900"
                    : "border-slate-200"
                }`}
                onClick={() => handleCheckbox(animal.id)}
              >
                {answer !== 0 &&
                  animal.id === answer &&
                  answer === quizAnimals[randomIndex].id && (
                    <CheckCircle className="bg-green-600 w-6 h-6 rounded-full min-w-6" />
                  )}
                {answer !== 0 &&
                  animal.id === answer &&
                  answer !== quizAnimals[randomIndex].id && (
                    <Cancel className="bg-red-600 w-6 h-6 rounded-full min-w-6" />
                  )}
                <p className="text-xs overflow-hidden">{animal.common_name}</p>
              </button>
            ))
          ) : (
            <CircleLoader />
          )}
        </div>
      ) : (
        <div className="flex items-center relative">
          <input
            placeholder="Antwort eingeben"
            type="text"
            value={textInput}
            className={`${
              rightTextAnswer &&
              "bg-gradient-to-b to-60% from-green-600 to-gray-900"
            } w-full mx-4 ml-3 p-2 border bg-gray-900 rounded-lg mb-2`}
            onChange={handleTextChange}
            disabled={rightTextAnswer}
          />

          {rightTextAnswer && (
            <div className="absolute right-6 bottom-4 text-xs">
              <CheckCircle />
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          disabled={rightTextAnswer}
          className={`flex items-center ${
            easyQuiz
              ? "bg-green-600 hover:bg-green-700"
              : "bg-red-600 hover:bg-red-700"
          } p-1 rounded-lg   hover:text-gray-900 ml-auto mr-5 transition-all duration-200`}
          onClick={() => setEasyQuiz(!easyQuiz)}
        >
          {easyQuiz ? "Leicht" : "Schwierig"}
        </button>
        <button
          className="flex items-center bg-green-600 p-2 rounded-lg  hover:bg-green-700 hover:text-gray-900 ml-auto mr-5 transition-all duration-200"
          onClick={() => setNextAnimalSwitch(!nextAnimalSwitch)}
        >
          Nächstes Tier <ArrowForward />
        </button>
      </div>
    </div>
  );
}
