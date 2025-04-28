"use client";

import { useState } from "react";

export default function Switch({
  value,
  onChange,
}: {
  value: boolean;
  onChange: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div
      className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer border shadow-black shadow-md bg-gradient-to-br  from-gray-950 to-70% transition-all duration-200  ${
        value
          ? "border-green-600 from-green-600 to-gray-950"
          : "border-gray-200 from-gray-950 to-gray-900"
      }`}
      onClick={() => onChange(!value)}
    >
      <div
        className={`bg-gray-200 w-6 h-6 rounded-full shadow-md transform transition-transform ${
          value ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </div>
  );
}
