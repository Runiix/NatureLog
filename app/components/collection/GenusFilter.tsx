"use client";

import filterSpottedAnimals from "@/app/utils/filterSpottedAnimals";
import { ExpandMore } from "@mui/icons-material";
import { useState, useTransition } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

export default function GenusFilter({
  counts,
  animals,
}: {
  counts: number[];
  animals: any;
}) {
  const genusList = filterSpottedAnimals(animals, counts);
  const [expandGenus, setExpandGenus] = useState(false);
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("genus");
    } else {
      params.set("genus", value);
    }
    startTransition(() => {
      router.replace(`${pathName}?${params.toString()}`);
    });
    setExpandGenus(false);
  };

  return (
    <div>
      <div
        className="flex items-center gap-2 bg-gray-900 shadow-md py-2 pl-2 pr-1 sm:text-xl rounded-md hover:bg-green-600 hover:text-gray-900 hover:cursor-pointer"
        onClick={() => setExpandGenus(!expandGenus)}
      >
        <p>Sichtungen</p>
        <ExpandMore
          className={`transition-all duration-200 ${
            expandGenus && "rotate-180"
          }`}
        />
      </div>
      <div
        className={` sm:block ${
          expandGenus ? "block sm:hidden" : "hidden"
        } flex flex-col absolute bg-gray-900 w-11/12 transition-all duration-500 rounded-lg border border-slate-400 shadow-lg shadow-black z-50 mt-1`}
      >
        <div className="flex flex-col items-center justify-center ">
          <p className="sm:text-gray-900">Arten</p>
          <div
            className="sm:bg-gray-900 w-20 text-center rounded-full p-1 sm:p-2 sm:mb-4 hover:cursor-pointer hover:scale-105 hover:bg-gray-800 flex justify-center gap-1 border-2 border-slate-200 sm:border-none "
            onClick={() => handleFilterChange("all")}
          >
            <p className="text-green-600">{animals.length} </p>
            <p>/</p>
            <p>{counts[6]}</p>
          </div>
        </div>
        <div className="flex flex-row flex-wrap gap-3 items-center justify-center mb-4">
          {genusList.map((genus) => (
            <div
              className="flex flex-col items-center justify-center"
              key={genus.value}
            >
              <p className="sm:text-gray-900">{genus.name}</p>
              <div
                className="sm:bg-gray-900 w-20 text-center rounded-full p-1 sm:p-2 sm:mb-4 hover:cursor-pointer hover:scale-105 hover:bg-gray-800 flex justify-center gap-1 border-2 border-slate-200 sm:border-none"
                onClick={() => handleFilterChange(genus.value)}
              >
                <p className="text-green-600">{genus.spottedCount} </p>
                <p>/</p>
                <p>{genus.count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
