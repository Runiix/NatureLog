import { CheckCircle, HideImage } from "@mui/icons-material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useTransition, useState } from "react";

export default function ImageExistsFilter() {
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [noImages, setNoImages] = useState(
    searchParams.get("noImages") || "false"
  );

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    setNoImages(value);
    if (value === "false") {
      params.delete("noImages");
    } else if (value === "true") {
      params.set("noImages", value.toString());
    }
    startTransition(() => {
      router.replace(`${pathName}?${params.toString()}`);
    });
  };

  return (
    <div className="flex justify-center items-center gap-5 shadow-black shadow-md bg-gradient-to-br  from-gray-950 to-70% transition-all duration-200 to-gray-900 hover:border-green-600 border border-gray-200 p-2 rounded-lg h-12 w-28">
      <label
        className={`${
          noImages === "true" && "text-green-600"
        } flex items-center justify-center`}
      >
        {" "}
        <HideImage />
      </label>
      {noImages === "true" ? (
        <button
          onClick={() => handleFilterChange("false")}
          className=" text-green-600 hover:text-red-600"
        >
          <CheckCircle />
        </button>
      ) : (
        <button
          className="rounded-full bg-gray-200 size-5 hover:bg-green-600"
          onClick={() => handleFilterChange("true")}
        ></button>
      )}
    </div>
  );
}
