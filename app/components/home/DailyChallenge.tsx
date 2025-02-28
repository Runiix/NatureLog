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
    <div className="bg-gray-900 rounded-lg flex flex-col gap-4 items-center justify-center">
      <h2 className="text-2xl">Challenge des Tages</h2>
      <div>Fotografiere {dailyChallenge}</div>
    </div>
  );
}
