import React, { useEffect, useState, useTransition } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { colorsList, SizeSlider } from "../../constants/constants";
import { ExpandMore } from "@mui/icons-material";

export default function LexiconFilter() {
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [expandFilter, setExpandFilter] = useState(false);
  const [sliderValue, setSliderValue] = useState<number[]>(() => {
    const sizeFrom = Number(searchParams.get("sizeFrom")) || 0;
    const sizeTo = Number(searchParams.get("sizeTo")) || 0;
    return sizeFrom === 0 && sizeTo === 0 ? [0, 500] : [sizeFrom, sizeTo];
  });

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
  return (
    <div>
      <div
        className="flex items-center text-base gap-6 bg-gray-900 shadow-md py-2 pl-6 pr-2 sm:text-xl rounded-md hover:bg-green-600 hover:text-gray-900 hover:cursor-pointer"
        onClick={() => setExpandFilter(!expandFilter)}
      >
        <p>Filter</p>
        <ExpandMore
          className={`transition-all duration-200 ${
            expandFilter && "rotate-180"
          }`}
        />
      </div>
      <div
        className={`flex flex-col gap-7 left-0 sm:left-auto absolute bg-gray-900 mt-28 p-4 sm:p-10 transition-all duration-500 w-full sm:w-1/2 rounded-b-md border border-slate-400 shadow-lg shadow-black z-50 ${
          expandFilter ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
      >
        <div className="flex text-sm sm:text-base gap-1 sm:gap-2 flex-wrap border-b border-slate-400 pb-4">
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
        <div className="flex flex-wrap gap-1 sm:gap-6 border-b border-slate-400 pb-4">
          {colorsList.map((color) => (
            <div
              key={color.eng}
              className={`${
                searchParams.get("color")?.includes(color.eng)
                  ? color.styleBg
                  : color.styleBorder
              }  cursor-pointer hover:bg-slate-200 hover:text-gray-950 p-2 rounded-lg border-2 text-sm sm:text-base `}
              onClick={() => handleFilterChange("color", color.eng)}
            >
              <p>{color.ger}</p>
              <div className=""></div>
            </div>
          ))}
        </div>
        <div className="flex text-sm sm:text-base gap-1 sm:gap-2 flex-wrap border-b border-slate-400 pb-4">
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
          <h3 className="hidden sm:block">Größe auswählen</h3>
          <div className="flex flex-col sm:flex-row sm:gap-10 items-center px-4 pt-1 sm:pt-0 sm:px-0">
            <SizeSlider
              getAriaLabel={() => "Größe"}
              value={sliderValue}
              onChange={handleSliderChange}
              valueLabelDisplay="auto"
              min={0}
              max={500}
            />
            <button
              className="text-zinc-900 bg-green-600  p-2 rounded-lg hover:bg-green-700 hover:text-slate-100 text-nowrap"
              onClick={handleSizeChange}
            >
              Anwenden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
