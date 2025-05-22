"use client";

import { useState, useTransition } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

export default function SocialFilter() {
  const [followType, setFollowType] = useState("following");
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleFollowerChange = (type: string) => {
    const params = new URLSearchParams(searchParams.toString());
    setFollowType(type);
    if (type === "following") {
      params.delete("following");
    } else {
      params.set("following", type);
    }
    startTransition(() => {
      router.replace(`${pathName}?${params.toString()}`);
    });
  };
  return (
    <div className="flex flex-col md:flex-row md: gap-2 md:gap-10 border-b border-gray-900 items-center justify-center bg-gray-900 rounded-lg p-4 md:p-10">
      <button
        onClick={() => handleFollowerChange("following")}
        className={`${
          followType === "following" &&
          "text-green-600 border-b border-green-600"
        } hover:text-green-600 hover:border-b hover:border-green-600 text-xs md:text-base`}
      >
        Du Folgst
      </button>
      <button
        onClick={() => handleFollowerChange("followers")}
        className={`${
          followType === "followers" &&
          "text-green-600 border-b border-green-600"
        } hover:text-green-600 hover:border-b hover:border-green-600 text-xs md:text-base`}
      >
        Dir Folgen
      </button>
      <button
        onClick={() => handleFollowerChange("all")}
        className={`${
          followType === "all" && "text-green-600 border-b border-green-600"
        } hover:text-green-600 hover:border-b hover:border-green-600 text-xs md:text-base`}
      >
        NatureLogger Suchen
      </button>
    </div>
  );
}
