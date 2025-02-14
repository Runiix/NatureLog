"use client";

import { useEffect, useState } from "react";
import { challenges } from "../../constants/constants";

export default function DailyChallenge() {
  const [dailyChallenge, setDailyChallenge] = useState("");
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    let seed = 0;
    for (let i = 0; i < today.length; i++) {
      seed += today.charCodeAt(i);
    }
    const index = seed % challenges.length;
    setDailyChallenge(challenges[index]);
  }, []);

  return (
    <div className="bg-gray-950 p-10 sm:w-1/3 rounded-lg flex flex-col gap-4 mt-20">
      <h2 className="text-2xl">Challenge des Tages</h2>
      <div>Fotografiere {dailyChallenge}</div>
    </div>
  );
}
