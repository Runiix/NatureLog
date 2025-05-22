"use client";

import { useDebouncedCallback } from "use-debounce";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 100);
  return (
    <input
      id="Search"
      defaultValue={searchParams.get("query")?.toString()}
      className=" z-0 border border-gray-200 shadow-black shadow-md bg-gradient-to-br  from-gray-900 to-70% transition-all duration-200 to-gray-950 hover:border-green-600  hover:cursor-pointer p-3 px-5 rounded-lg w-44 sm:w-auto  focus:border-green-600 focus:outline-none text-xs md:text-base"
      type="text"
      placeholder={placeholder}
      onChange={(e) => {
        handleSearch(e.target.value);
      }}
    />
  );
}
