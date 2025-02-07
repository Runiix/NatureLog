"use client";
import LexiconCard from "./LexiconCard";
import { useState, useEffect, useTransition } from "react";
import { useInView } from "react-intersection-observer";
import getAnimals from "../actions/getAnimals";
import { CircleLoader } from "react-spinners";
import { ArrowDownward, ExpandMore } from "@mui/icons-material";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { colorsList } from "../constants/constants";
import { SizeSlider } from "../constants/constants";

export default function LexiconGrid({
  user,
  spottedList,
  animalImageList,
}: {
  user: any;
  spottedList: [number];
  animalImageList: any;
}) {
  const [offset, setOffset] = useState(0);
  const [loadingMoreAnimals, setLoadingMoreAnimals] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("common_name");
  const [sortOrder, setSortOrder] = useState("ascending");
  const [animals, setAnimals] = useState<any>([]);
  const { ref, inView } = useInView();
  const [expandFilter, setExpandFilter] = useState(false);
  const [expandSort, setExpandSort] = useState(false);
  const [sliderValue, setSliderValue] = useState<number[]>([0, 500]);
  const regex = /[äöüß]/g;

  const searchParams = useSearchParams();
  const pathName = usePathname();
  const { replace } = useRouter();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [isPending, startTransition] = useTransition();
  const filters = Object.fromEntries(searchParams.entries());

  // Convert comma-separated values (e.g., "red,blue") into an array
  const parsedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
    acc[key] = value.split(",");
    return acc;
  }, {} as Record<string, string[]>);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const sortBy = params.get("sortBy") || null;
    const sortOrder = params.get("sortOrder") || null;
    if (sortBy) {
      setSortBy(sortBy);
    }
    if (sortOrder) {
      setSortOrder(sortOrder);
    }
    const loadAnimals = async (offset: number) => {
      try {
        let pageSize = 0;
        if (window.innerWidth > 1500) {
          pageSize = 25;
        } else {
          pageSize = 20;
        }
        const data = await getAnimals(searchParams, offset, pageSize);
        setLoading(false);

        if (data.length < pageSize) {
          setLoadingMoreAnimals(false);
        } else {
          setLoadingMoreAnimals(true);
        }
        setAnimals(data);
        setOffset(1);
      } catch (error) {
        console.error("Error loading Animals:", error);
      }
    };
    loadAnimals(0);
  }, [searchParams]);

  useEffect(() => {
    const loadMoreAnimals = async () => {
      try {
        let pageSize = 0;
        if (window.innerWidth > 1500) {
          pageSize = 25;
        } else {
          pageSize = 20;
        }
        const data = await getAnimals(searchParams, offset, pageSize);
        if (data.length < pageSize) {
          setLoadingMoreAnimals(false);
        }
        setAnimals((prevAnimals: any) => [...prevAnimals, ...data]);
        setOffset((prev) => prev + 1);
      } catch (error) {
        console.error("Error loading more animals:", error);
      }
    };
    if (inView && loadingMoreAnimals) {
      loadMoreAnimals();
    }
  }, [inView, loadingMoreAnimals, offset, searchParams]);

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathName}?${params.toString()}`);
    setQuery(term);
  };

  const handleFilterChange = (param: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    let values = params.get(param)?.split(",") || [];
    if (values.includes(value)) {
      values = values.filter((v) => v !== value); // Remove if already selected
    } else {
      values.push(value); // Add new selection
    }
    if (values.length) {
      params.set(param, values.join(","));
    } else {
      params.delete(param);
    }
    startTransition(() => {
      router.replace(`${pathName}?${params.toString()}`);
    });
  };
  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setSliderValue(newValue as number[]);
  };
  const handleSizeChange = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (sliderValue[0] === 0 && sliderValue[1] === 500) {
      params.delete("sizeFrom");
      params.delete("sizeTo");
    } else {
      params.set("sizeFrom", sliderValue[0].toString());
      params.set("sizeTo", sliderValue[1].toString());
    }
    startTransition(() => {
      router.replace(`${pathName}?${params.toString()}`);
    });
  };
  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "common_name") {
      params.delete("sortBy");
    } else {
      params.set("sortBy", value);
      setSortBy(value);
    }
    startTransition(() => {
      router.replace(`${pathName}?${params.toString()}`);
    });
    setExpandSort(false);
  };
  const handleSortOrder = () => {
    const params = new URLSearchParams(searchParams.toString());
    const value = params.get("sortOrder") || null;
    if (value === "ascending") {
      params.set("sortOrder", "descending");
    } else {
      params.set("sortOrder", "ascending");
    }
    startTransition(() => {
      router.replace(`${pathName}?${params.toString()}`);
    });
  };

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

  return (
    <div className="flex flex-col ">
      <div className="flex flex-wrap sm:gap-2 sm:p-4 h-16">
        {Object.entries(parsedFilters).map(([key, values]) =>
          values.map((value) => (
            <span
              key={`${key}-${value}`}
              className="px-3 py-1 bg-gray-900 border  text-white rounded-full text-sm flex items-center gap-2"
            >
              {key}: {value}
              <button
                onClick={() => removeFilter(key, value)}
                className="ml-2 text-red-500 rounded-full px-2 hover:bg-gray-800 cursor-pointer border-[1px]"
              >
                ✕
              </button>
            </span>
          ))
        )}
      </div>
      <div className="flex-col sm:flex-row flex gap-2 sm:gap-0 justify-between items-center">
        <div
          className="flex items-center gap-6 bg-gray-900 shadow-md py-2 pl-6 pr-2 text-xl rounded-md hover:bg-green-600 hover:text-gray-900 hover:cursor-pointer"
          onClick={() => setExpandFilter(!expandFilter)}
        >
          <p>Filter</p>
          <ExpandMore
            className={`transition-all duration-200 ${
              expandFilter && "rotate-180"
            }`}
          />
        </div>

        <div className="flex items-center gap-2 border-">
          <input
            id="Search"
            value={query?.toString()}
            className=" z-0 bg-gray-900 border border-slate-100 hover:bg-green-600 hover:text-gray-950 hover:cursor-pointer p-3 px-5 rounded-md"
            type="text"
            placeholder="Tier Suchen"
            onChange={(e) => {
              handleSearch(e.target.value);
            }}
          />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-6 bg-gray-900 shadow-md py-2 pl-6 pr-2 text-xl rounded-md hover:bg-green-600 hover:text-gray-900 hover:cursor-pointer"
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
              className={`transition-all duration-200 "bg-gray-900 shadow-md p-2 text-xl rounded-md hover:bg-green-600 hover:text-gray-900 bg-gray-900 hover:cursor-pointer ${
                sortOrder === "ascending" ? "rotate-180" : "rotate-0"
              }`}
            >
              <ArrowDownward />
            </div>
          </div>
          {expandSort && (
            <div className="flex flex-col absolute bg-gray-900 mt-12 transition-all duration-200 rounded-b-md border border-slate-400 shadow-lg shadow-black z-50">
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
          )}
        </div>
      </div>
      {expandFilter && (
        <div className="flex flex-col gap-7 absolute bg-gray-900 mt-28 p-10 transition-all duration-200 w-1/2 rounded-b-md border border-slate-400 shadow-lg shadow-black z-50">
          <div className="flex gap-2 flex-wrap border-b border-slate-400 pb-4">
            {[
              "Säugetier",
              "Vogel",
              "Amphhibie",
              "Reptil",
              "Insekt",
              "Arachnoid",
            ].map((genus) => (
              <div
                key={genus}
                className={`${
                  searchParams.get("genus")?.includes(genus)
                    ? "bg-slate-200 text-green-600"
                    : ""
                } rounded-md p-2 cursor-pointer hover:bg-slate-200 hover:text-green-600`}
                onClick={() => handleFilterChange("genus", genus)}
              >
                {genus}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-6 border-b border-slate-400 pb-4">
            {colorsList.map((color) => (
              <div
                key={color.eng}
                className={`${
                  searchParams.get("color")?.includes(color.eng)
                    ? color.styleBg
                    : color.styleBorder
                }  cursor-pointer hover:bg-slate-200 hover:text-gray-950 p-2 rounded-lg border-2`}
                onClick={() => handleFilterChange("color", color.eng)}
              >
                <p>{color.ger}</p>
                <div className=""></div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap border-b border-slate-400 pb-4">
            {[
              "Nicht bedroht",
              "Extrem selten",
              "Vorwarnmliste",
              "Gefährdet",
              "Stark gefährdet",
              "Vom Aussterben bedroht",
              "Ausgestorben",
            ].map((endangerment) => (
              <div
                key={endangerment}
                className={`${
                  searchParams.get("endangerment")?.includes(endangerment)
                    ? "bg-slate-200 text-green-600"
                    : ""
                } rounded-md p-2 cursor-pointer hover:bg-slate-200 hover:text-green-600`}
                onClick={() => handleFilterChange("endangerment", endangerment)}
              >
                {endangerment}
              </div>
            ))}
          </div>
          <div>
            <h3>Größe auswählen</h3>
            <div className="flex gap-10 items-center">
              <SizeSlider
                getAriaLabel={() => "Größe"}
                value={sliderValue}
                onChange={handleSliderChange}
                valueLabelDisplay="auto"
                min={0}
                max={500}
              />
              <button
                className="hover:bg-slate-200 hover:text-green-600 border-2 borde-slate-200 rounded-lg p-2"
                onClick={handleSizeChange}
              >
                Anwenden
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="items-center justify-center grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 mt-10">
        {animals &&
          animals.map((animal: any, index: number) => (
            <LexiconCard
              key={animal.id}
              id={animal.id}
              common_name={animal.common_name}
              scientific_name={animal.scientific_name}
              population_estimate={animal.population_estimate}
              endangerment_status={animal.endangerment_status}
              size_from={animal.size_from}
              size_to={animal.size_to}
              sortBy={sortBy}
              imageUrl={animal.image_link}
              user={user}
              spottedList={spottedList}
              animalImageExists={animalImageList.some(
                (obj: any) =>
                  obj.name &&
                  obj.name === animal.common_name.replace(regex, "_") + ".jpg"
              )}
            />
          ))}
      </div>
      {loading && (
        <div className="mg-4" ref={ref}>
          <CircleLoader color="#16A34A" />{" "}
        </div>
      )}
      {loadingMoreAnimals && (
        <div className="mb-4" ref={ref}>
          <CircleLoader color="#16A34A" />{" "}
        </div>
      )}
    </div>
  );
}
