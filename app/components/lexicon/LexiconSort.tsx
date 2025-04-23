"use client";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

import { ArrowDownward, ExpandMore } from "@mui/icons-material";
import { useState, useTransition } from "react";

export default function LexiconSort() {
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const { replace } = useRouter();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sortBy, setSortBy] = useState("common_name");

  const [expandSort, setExpandSort] = useState(false);
  const [sortOrder, setSortOrder] = useState("ascending");

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "common_name") {
      params.delete("sortBy");
    } else {
      params.set("sortBy", value);
    }
    setSortBy(value);
    startTransition(() => {
      router.replace(`${pathName}?${params.toString()}`);
    });
    setExpandSort(false);
  };

  const handleSortOrder = () => {
    const params = new URLSearchParams(searchParams.toString());
    const value = params.get("sortOrder") || null;
    if (value === "ascending" || value === null) {
      params.set("sortOrder", "descending");
      setSortOrder("descending");
    } else {
      params.set("sortOrder", "ascending");
      setSortOrder("ascending");
    }
    startTransition(() => {
      router.replace(`${pathName}?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-4">
        <div
          className="flex items-center gap-6 bg-gray-900 shadow-md py-2 pl-6 pr-2 sm:text-xl rounded-lg hover:bg-green-600 hover:text-gray-900 hover:cursor-pointer"
          onClick={() => setExpandSort(!expandSort)}
        >
          <p>
            {sortBy === "common_name"
              ? "Alpabetisch"
              : sortBy === "size_from"
              ? "Größe"
              : sortBy === "population_estimate"
              ? "Population"
              : "Gefährdung"}
          </p>
          <ExpandMore
            className={`transition-all duration-200 ${
              expandSort && "rotate-180"
            }`}
          />
        </div>

        <div
          onClick={handleSortOrder}
          className={`transition-all duration-200 "bg-gray-900 shadow-md p-2 sm:text-xl rounded-lg hover:bg-green-600 hover:text-gray-900 bg-gray-900 hover:cursor-pointer ${
            sortOrder === "ascending" ? "rotate-0" : "rotate-180"
          }`}
        >
          <ArrowDownward />
        </div>
      </div>
      <div
        className={`flex flex-col absolute bg-gray-900 mt-12 transition-all duration-500 rounded-b-md border border-slate-400 shadow-lg shadow-black z-50 ${
          expandSort ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
      >
        {[
          { value: "common_name", name: "Alphabetisch" },
          { value: "size_from", name: "Größe" },
          { value: "population_estimate", name: "Population" },
          { value: "endangerment_status", name: "Gefährdung" },
        ].map((sort) => (
          <div
            key={sort.value}
            className=" p-3 px-6 hover:bg-green-600 hover:cursor-pointer hover:text-gray-900 text-xl "
            onClick={() => handleSortChange(sort.value)}
          >
            {" "}
            {sort.name}
          </div>
        ))}
      </div>
    </div>
  );
}
