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
      className=" z-0 bg-gray-900 border border-slate-100 hover:bg-gray-800 hover:cursor-pointer p-3 px-5 rounded-md w-44 sm:w-auto  focus:outline-green-600 "
      type="text"
      placeholder={placeholder}
      onChange={(e) => {
        handleSearch(e.target.value);
      }}
    />
  );
}
