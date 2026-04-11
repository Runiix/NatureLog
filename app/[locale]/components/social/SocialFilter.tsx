"use client";

import { useState, useTransition } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Search from "../general/Search";

export default function SocialFilter() {
  const [followType, setFollowType] = useState("");
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("Social");
  const handleFollowerChange = (type: string) => {
    const params = new URLSearchParams(searchParams.toString());
    setFollowType(type);
    if (type === "") {
      params.delete("following");
    } else {
      params.set("following", type);
    }
    startTransition(() => {
      router.replace(`${pathName}?${params.toString()}`);
    });
  };
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full max-w-[1200px] mx-auto mt-4 shadow-lg shadow-gray-400 p-4 rounded-lg">
      <h2 className="text-green-600 text-center text-2xl xl:text-5xl">
        {t("social")}
      </h2>{" "}
      <div className="flex items-center gap-10">
        <button
          onClick={() => handleFollowerChange("")}
          className={`${
            followType === ""
              ? "text-green-600 border-b border-green-600"
              : "text-gray-900"
          } hover:text-green-600 hover:border-b hover:border-green-600 text-xs md:text-base`}
          aria-label={t("topUsers")}
        >
          {t("topUsers")}
        </button>
        <button
          onClick={() => handleFollowerChange("following")}
          className={`${
            followType === "following"
              ? "text-green-600 border-b border-green-600"
              : "text-gray-900"
          } hover:text-green-600 hover:border-b hover:border-green-600 text-xs md:text-base`}
          aria-label={t("following")}
        >
          {t("following")}
        </button>
        <button
          onClick={() => handleFollowerChange("followers")}
          className={`${
            followType === "followers"
              ? "text-green-600 border-b border-green-600"
              : "text-gray-900"
          } hover:text-green-600 hover:border-b hover:border-green-600 text-xs md:text-base`}
          aria-label={t("followers")}
        >
          {t("followers")}
        </button>
      </div>
      <Search placeholder="searchNatureLoggers" />
    </div>
  );
}
