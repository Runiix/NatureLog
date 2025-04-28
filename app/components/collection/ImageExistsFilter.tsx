import { CheckCircle, HideImage } from "@mui/icons-material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useTransition, useState } from "react";
import Switch from "../general/Switch";

export default function ImageExistsFilter() {
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [noImages, setNoImages] = useState(
    (searchParams.get("noImages") && true) || false
  );

  const handleFilterChange = (value: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    setNoImages(value);
    if (value.toString() === "false") {
      params.delete("noImages");
    } else if (value.toString() === "true") {
      params.set("noImages", value.toString());
    }
    startTransition(() => {
      router.replace(`${pathName}?${params.toString()}`);
    });
  };

  return (
    <div className="flex justify-center items-center gap-3 shadow-black shadow-md bg-gradient-to-br  from-gray-950 to-70% transition-all duration-200 to-gray-900  border border-gray-200 p-2 rounded-lg h-11">
      <label
        className={`${
          noImages === true && "text-green-600"
        } flex items-center justify-center`}
      >
        {" "}
        <HideImage />
      </label>
      <Switch value={noImages} onChange={() => handleFilterChange(!noImages)} />
    </div>
  );
}
