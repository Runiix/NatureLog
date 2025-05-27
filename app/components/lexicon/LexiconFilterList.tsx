import { Close } from "@mui/icons-material";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

export default function LexiconFilterList() {
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const { replace } = useRouter();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const filters = Object.fromEntries(searchParams.entries());

  const removeFilter = (filterKey: string, filterValue: string) => {
    const newParams = new URLSearchParams(searchParams.toString());

    const values = parsedFilters[filterKey].filter(
      (val) => val !== filterValue
    );

    if (values.length > 0) {
      newParams.set(filterKey, values.join(","));
    } else {
      newParams.delete(filterKey);
    }

    startTransition(() => {
      router.replace(`${pathName}?${newParams.toString()}`);
    });
  };

  const parsedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
    acc[key] = value.split(",");
    return acc;
  }, {} as Record<string, string[]>);
  return (
    <div className="flex flex-wrap max-w-[60%] mx-auto items-center justify-center sm:gap-2 sm:p-4 mb-1 sm:mb-0 ">
      {Object.entries(parsedFilters).map(([key, values]) =>
        values.map((value) => (
          <span
            key={`${key}-${value}`}
            className="px-3 py-1 shadow-black shadow-md bg-gradient-to-br  from-gray-950 to-70% transition-all duration-200 to-gray-900  border border-gray-200 text-white rounded-lg flex items-center gap-2 text-xs sm:text-sm"
          >
            {key}: {value}
            <button
              onClick={() => removeFilter(key, value)}
              className="ml-2 text-xs sm:text-base hover:text-red-600 rounded-lg px-2  cursor-pointer border-[1px] flex items-center justify-center"
              aria-label="Lexicon Filter schließen"
            >
              <Close />
            </button>
          </span>
        ))
      )}
    </div>
  );
}
