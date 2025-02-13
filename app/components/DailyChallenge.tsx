"use client";

import { challenges } from "../constants/constants";

export default function DailyChallenge() {
  const DailyChallenge =
    challenges[Math.floor(Math.random() * challenges.length)];

  return (
    <div className="bg-gray-950 p-10 w-1/3 rounded-lg flex flex-col gap-4">
      <h2 className="text-2xl">Challenge des Tages</h2>
      <div>Fotografiere {DailyChallenge}</div>
    </div>
  );
}
