"use client";

import { ArrowBack } from "@mui/icons-material";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  return (
    <div
      className="absolute left-2 sm:left-10 top-12 sm:top-20 rounded-full size-8 sm:size-12 flex items-center justify-center hover:text-green-600 hover:bg-gray-900/70 bg-gray-900/50 z-40 cursor-pointer"
      onClick={() => router.back()}
    >
      <ArrowBack className="sm:scale-125" />
    </div>
  );
}
