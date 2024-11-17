"use client";
import LexiconCard from "./LexiconCard";
import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import getAnimals from "../actions/getAnimals";
import { GridLoader } from "react-spinners";
import { ArrowDownward, ExpandMore } from "@mui/icons-material";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Range } from "react-range";

export default function LexiconGrid({
  filters,
  user,
  spottedList,
}: {
  filters: any;
  user: any;
  spottedList: [number];
}) {
  const [offset, setOffset] = useState(0);
  const [loadingMoreAnimals, setLoadingMoreAnimals] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSortBy, setShowSortBy] = useState(false);
  const [animals, setAnimals] = useState<any>([]);
  const { ref, inView } = useInView();
  const [expandFilter, setExpandFilter] = useState(false);
  const [expandSort, setExpandSort] = useState(false);
  const [genus, setGenus] = useState<string>(
    decodeURIComponent(filters.filters[0])
  );
  const [color, setColor] = useState<string>(
    decodeURIComponent(filters.filters[1])
  );
  const [sizeFrom, setSizeFrom] = useState<number>(filters.filters[2]);
  const [sizeTo, setSizeTo] = useState<number>(filters.filters[3]);
  const [sortBy, setSortBy] = useState<string>(filters.filters[4]);
  const [sortOrder, setSortOrder] = useState<boolean>(filters.filters[5]);
  const [values, setValues] = useState([0, 500]);

  const searchParams = useSearchParams();
  const pathName = usePathname();
  const { replace } = useRouter();
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    loadAnimals(0);
    console.log(filters);
  }, [query, genus, color, sizeFrom, sizeTo, sortBy, sortOrder]);

  useEffect(() => {
    if (inView && loadingMoreAnimals) {
      loadMoreAnimals();
    }
  }, [inView]);

  const handleSliderChange = (newValues: number[]) => {
    setValues(newValues);
  };
  const handleSizeChange = () => {
    setSizeFrom(values[0]);
    setSizeTo(values[1]);
    router.replace(
      `/lexiconpage/${genus}/${color}/${values[0]}/${values[1]}/${sortBy}/${sortOrder}`
    );
  };

  const changeGenusFilter = (g: string) => {
    if (genus === g) {
      setGenus("all");
      router.replace(
        `/lexiconpage/all/${color}/${sizeFrom}/${sizeTo}/${sortBy}/${sortOrder}`
      );
    } else {
      setGenus(g);
      router.replace(
        `/lexiconpage/${g}/${color}/${sizeFrom}/${sizeTo}/${sortBy}/${sortOrder}`
      );
    }
  };
  const changeColorFilter = (c: string) => {
    console.log(genus);
    if (color === c) {
      setColor("all");
      router.replace(
        `/lexiconpage/${genus}/all/${sizeFrom}/${sizeTo}/${sortBy}/${sortOrder}`
      );
    } else {
      setColor(c);
      router.replace(
        `/lexiconpage/${genus}/${c}/${sizeFrom}/${sizeTo}/${sortBy}/${sortOrder}`
      );
    }
  };
  const changeSortBy = (by: string) => {
    setSortBy(by);
    router.replace(
      `/lexiconpage/${genus}/${color}/${sizeFrom}/${sizeTo}/${by}/${sortOrder}`
    );
  };
  const changeSortOrder = (order: boolean) => {
    setSortOrder(order);
    router.replace(
      `/lexiconpage/${genus}/${color}/${sizeFrom}/${sizeTo}/${sortBy}/${order}`
    );
  };

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

  const loadAnimals = async (offset: number) => {
    try {
      let pageSize = 0;
      if (window.innerWidth > 1500) {
        pageSize = 25;
      } else {
        pageSize = 20;
      }
      const data: any = await getAnimals(filters, offset, pageSize, query);
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

  const loadMoreAnimals = async () => {
    try {
      let pageSize = 0;
      if (window.innerWidth > 1500) {
        pageSize = 25;
      } else {
        pageSize = 20;
      }
      const data: any = await getAnimals(filters, offset, pageSize, query);
      if (data.length < pageSize) {
        setLoadingMoreAnimals(false);
      }
      setAnimals((prevAnimals: any) => [...prevAnimals, ...data]);
      setOffset((prev) => prev + 1);
    } catch (error) {
      console.error("Error loading more movies:", error);
    }
  };
  const getUrl = (category: string, common_name: string) => {
    const regex = /[äöüß]/g;
    // Replace the matched characters with '_'
    const Name = common_name.replace(regex, "_");
    if (category === "Säugetier") {
      const imageUrl = `https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/animalImages/main/Saeugetier/${Name}.jpg`;
      return imageUrl;
    } else {
      const imageUrl = `https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/animalImages/main/${category}/${Name}.jpg`;
      return imageUrl;
    }
  };
  return (
    <div>
      <div className="flex flex-col sm:flex-row lg:gap-52 xl:gap-64 justify-around w-full items-center">
        <div className="flex flex-col">
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
          {expandFilter && (
            <div className="flex flex-col gap-7 absolute bg-gray-900 mt-12 p-10 transition-all duration-200 w-1/2 rounded-b-md border border-slate-400 shadow-lg shadow-black z-50">
              <div className="flex gap-2 flex-wrap border-b border-slate-400 pb-4">
                <button
                  className={`${
                    genus === "Säugetier"
                      ? "bg-gray-200 text-gray-900"
                      : "hover:bg-gray-800 bg-gray-900 text-slate-100"
                  } rounded-md p-2 `}
                  onClick={() => changeGenusFilter("Säugetier")}
                >
                  Säugetiere
                </button>
                <button
                  className={`${
                    genus === "Vogel"
                      ? "bg-gray-200 text-gray-900"
                      : "hover:bg-gray-800 bg-gray-900 text-slate-100"
                  } rounded-md p-2 `}
                  onClick={() => changeGenusFilter("Vogel")}
                >
                  Vögel
                </button>
                <button
                  className={`${
                    genus === "Insekt"
                      ? "bg-gray-200 text-gray-900"
                      : "hover:bg-gray-800 bg-gray-900 text-slate-100"
                  } rounded-md p-2 `}
                  onClick={() => changeGenusFilter("Insekt")}
                >
                  Insekten
                </button>
                <button
                  className={`${
                    genus === "Reptil"
                      ? "bg-gray-200 text-gray-900"
                      : "hover:bg-gray-800 bg-gray-900 text-slate-100"
                  } rounded-md p-2 `}
                  onClick={() => changeGenusFilter("Reptil")}
                >
                  Reptilien
                </button>
                <button
                  className={`${
                    genus === "Amphibie"
                      ? "bg-gray-200 text-gray-900"
                      : "hover:bg-gray-800 bg-gray-900 text-slate-100"
                  } rounded-md p-2 `}
                  onClick={() => changeGenusFilter("Amphibie")}
                >
                  Amphibien
                </button>
                <button
                  className={`${
                    genus === "Wirbellose"
                      ? "bg-gray-200 text-gray-900"
                      : "hover:bg-gray-800 bg-gray-900 text-slate-100"
                  } rounded-md p-2 `}
                  onClick={() => changeGenusFilter("Wirbellose")}
                >
                  Wirbellose
                </button>
                <button
                  className={`${
                    genus === "Fisch"
                      ? "bg-gray-200 text-gray-900"
                      : "hover:bg-gray-800 bg-gray-900 text-slate-100"
                  } rounded-md p-2 `}
                  onClick={() => changeGenusFilter("Fisch")}
                >
                  Fische
                </button>
                <button
                  className={`${
                    genus === "Arachnoid"
                      ? "bg-gray-200 text-gray-900"
                      : "hover:bg-gray-800 bg-gray-900 text-slate-100"
                  } rounded-md p-2 `}
                  onClick={() => changeGenusFilter("Arachnoid")}
                >
                  Arachnoiden
                </button>
              </div>
              <div className="flex flex-wrap gap-2 border-b border-slate-400 pb-4">
                <div
                  className={`${
                    color === "black"
                      ? "bg-gray-200 text-black"
                      : "hover:bg-gray-800 bg-gray-900 text-slate-100"
                  } flex items-center gap-2 px-2 rounded-md hover:cursor-pointer`}
                  onClick={() => changeColorFilter("black")}
                >
                  <div className="bg-black rounded-full p-2"></div>
                  <p>schwarz</p>
                </div>
                <div
                  className={`${
                    color === "gray"
                      ? "bg-gray-200 text-gray-500"
                      : "hover:bg-gray-800 bg-gray-900 text-slate-100"
                  } flex items-center gap-2 px-2 rounded-md hover:cursor-pointer`}
                  onClick={() => changeColorFilter("gray")}
                >
                  <div className="bg-gray-500 rounded-full p-2"></div>
                  <p>grau</p>
                </div>
                <div
                  className={`${
                    color === "brown"
                      ? "bg-gray-200 text-orange-950"
                      : "hover:bg-gray-800 bg-gray-900 text-slate-100"
                  } flex items-center gap-2 px-2 rounded-md hover:cursor-pointer`}
                  onClick={() => changeColorFilter("brown")}
                >
                  <div className="bg-orange-950 rounded-full p-2"></div>
                  <p>braun</p>
                </div>
                <div
                  className={`${
                    color === "yellow"
                      ? "bg-gray-200 text-yellow-500"
                      : "hover:bg-gray-800 bg-gray-900 text-slate-100"
                  } flex items-center gap-2 px-2 rounded-md hover:cursor-pointer`}
                  onClick={() => changeColorFilter("yellow")}
                >
                  <div className="bg-yellow-500 rounded-full p-2"></div>
                  <p>gelb</p>
                </div>
                <div
                  className={`${
                    color === "orange"
                      ? "bg-gray-200 text-orange-600"
                      : "hover:bg-gray-800 bg-gray-900 text-slate-100"
                  } flex items-center gap-2 px-2 rounded-md hover:cursor-pointer`}
                  onClick={() => changeColorFilter("orange")}
                >
                  <div className="bg-orange-600 rounded-full p-2"></div>
                  <p>orange</p>
                </div>
                <div
                  className={`${
                    color === "red"
                      ? "bg-gray-200 text-red-600"
                      : "hover:bg-gray-800 bg-gray-900 text-slate-100"
                  } flex items-center gap-2 px-2 rounded-md hover:cursor-pointer`}
                  onClick={() => changeColorFilter("red")}
                >
                  <div className="bg-red-600 rounded-full p-2"></div>
                  <p>rot</p>
                </div>
                <div
                  className={`${
                    color === "green"
                      ? "bg-gray-200 text-green-600"
                      : "hover:bg-gray-800 bg-gray-900 text-slate-100"
                  } flex items-center gap-2 px-2 rounded-md hover:cursor-pointer`}
                  onClick={() => changeColorFilter("green")}
                >
                  <div className="bg-green-600 rounded-full p-2"></div>
                  <p>grün</p>
                </div>
                <div
                  className={`${
                    color === "blue"
                      ? "bg-gray-200 text-blue-600"
                      : "hover:bg-gray-800 bg-gray-900 text-slate-100"
                  } flex items-center gap-2 px-2 rounded-md hover:cursor-pointer`}
                  onClick={() => changeColorFilter("blue")}
                >
                  <div className="bg-blue-600 rounded-full p-2"></div>
                  <p>blau</p>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-10">
                  <Range
                    step={1}
                    min={0}
                    max={500}
                    values={values}
                    onChange={handleSliderChange}
                    renderTrack={({ props, children }) => (
                      <div
                        {...props}
                        style={{
                          ...props.style,
                          height: "4px",
                          width: "100%",
                          backgroundColor: "#eee",
                        }}
                      >
                        {children}
                      </div>
                    )}
                    renderThumb={({ props, index }) => (
                      <div
                        {...props}
                        style={{
                          ...props.style,
                          height: "36px",
                          width: "36px",
                          textAlign: "center",
                          backgroundColor: "#090",
                        }}
                        className="rounded-full flex justify-center items-center"
                      >
                        {values[index]}
                      </div>
                    )}
                  />
                  <button
                    className="border border-slate-400 rounded-md hover:bg-gray-800"
                    onClick={() => handleSizeChange()}
                  >
                    Größe ändern
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ">
          <input
            id="Search"
            value={query}
            className=" z-0 bg-zinc-900 border border-slate-100 hover:bg-zinc-800 hover:cursor-pointer p-3 px-5 rounded-md"
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
              className="flex items-center gap-6 bg-gray-900 shadow-md py-2 pl-6 pr-2 text-xl rounded-md hover:bg-green-600 hover:text-gray-900 hover:cursor-pointer "
              onClick={() => setExpandSort(!expandSort)}
            >
              <p>Sort</p>
              <ExpandMore
                className={`transition-all duration-200 ${
                  expandSort && "rotate-180"
                }`}
              />
            </div>

            <div
              onClick={() => changeSortOrder(!sortOrder)}
              className={`transition-all duration-200 "bg-gray-900 shadow-md p-2 text-xl rounded-md hover:bg-green-600 hover:text-gray-900 bg-gray-900 hover:cursor-pointer ${
                sortOrder ? "rotate-180" : "rotate-0"
              }`}
            >
              <ArrowDownward />
            </div>
          </div>
          {expandSort && (
            <div className="flex flex-col absolute bg-gray-900 mt-12 transition-all duration-200 rounded-b-md border border-slate-400 shadow-lg shadow-black z-50">
              <div
                className=" p-3 px-6 hover:bg-green-600 hover:cursor-pointer hover:text-gray-900 text-xl "
                onClick={() => changeSortBy("common_name")}
              >
                {" "}
                Alphabetisch
              </div>
              <div
                className=" p-3 px-6 hover:bg-green-600 hover:cursor-pointer hover:text-gray-900 text-xl "
                onClick={() => changeSortBy("size_from")}
              >
                {" "}
                Größe
              </div>
              <div
                className=" p-3 px-6 hover:bg-green-600 hover:cursor-pointer hover:text-gray-900 text-xl "
                onClick={() => changeSortBy("population_estimate")}
              >
                {" "}
                Population
              </div>
              <div
                className=" p-3 px-6 hover:bg-green-600 hover:cursor-pointer hover:text-gray-900 text-xl "
                onClick={() => changeSortBy("endangerment_status")}
              >
                {" "}
                Gefährdung
              </div>
            </div>
          )}
        </div>
      </div>
      <div>
        <div className="items-center justify-center grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 mt-10">
          {animals &&
            animals.map((animal: any, index: number) => (
              <LexiconCard
                key={index}
                id={animal.id}
                common_name={animal.common_name}
                scientific_name={animal.scientific_name}
                category={animal.category}
                description={animal.description}
                habitat={animal.habitat}
                population_estimate={animal.population_estimate}
                endangerment_status={animal.endangerment_status}
                size_from={animal.size_from}
                size_to={animal.size_to}
                sortBy={filters.filters[4]}
                imageUrl={getUrl(animal.category, animal.common_name)}
                user={user}
                spottedList={spottedList}
              />
            ))}
        </div>
        {loading && (
          <div className="" ref={ref}>
            <GridLoader color="#16A34A" />{" "}
          </div>
        )}
        {loadingMoreAnimals && (
          <div className="" ref={ref}>
            <GridLoader color="#16A34A" />{" "}
          </div>
        )}
      </div>
    </div>
  );
}
