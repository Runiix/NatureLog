import { useState, useTransition } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { colorsList, SizeSlider } from "../../constants/constants";
import { ExpandMore } from "@mui/icons-material";

type ClassToOrder = {
  class: string;
  orders: string[];
};

const OrderValues = [
  {
    class: "Säugetier",
    orders: [
      "Hasenartige (Lagomorpha)",
      "Nagetiere (Rodentia)",
      "Insektenfresser (Eulipotyphla)",
      "Paarhufer (Artiodactyla)",
      "Raubtiere (Carnivora)",
    ],
  },
  {
    class: "Vogel",
    orders: [
      "Galliformes – Hühnervögel",
      "Anseriformes – Entenvögel",
      "Caprimulgiformes – Nachtschwalbenvögel",
      "Apodiformes – Seglervögel",
      "Otidiformes – Trappen",
      "Cuculiformes – Kuckucksvögel",
      "Pterocliformes – Flughühner",
      "Columbiformes – Taubenvögel",
      "Gruiformes – Kranichvögel",
      "Podicipediformes – Lappentaucher",
      "Phoenicopteriformes – Flamingos",
      "Charadriiformes – Regenpfeifervögel",
      "Gaviiformes – Seetaucher",
      "Procellariiformes – Röhrennasen",
      "Ciconiiformes – Störche",
      "Suliformes – Ruderfüßer",
      "Pelecaniformes – Pelikanvögel",
      "Accipitriformes – Greifvögel",
      "Strigiformes – Eulen",
      "Bucerotiformes – Hornvögel",
      "Coraciiformes – Rackenvögel",
      "Piciformes – Spechtvögel",
      "Falconiformes – Falken",
      "Psittaciformes – Papageien",
      "Passeriformes – Sperlingsvögel",
    ],
  },
  {
    class: "Amphibie",
    orders: ["Schwanzlurche (Caudata)", "Froschlurche (Anura)"],
  },
  { class: "Reptil", orders: ["Testudines", "Sauria", "Serpentes"] },
  { class: "Insekt", orders: [""] },
  { class: "Arachnoid", orders: [""] },
];

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
  const [orderValues, setOrderValues] = useState<ClassToOrder[]>(
    OrderValues.filter((entry) =>
      (searchParams.get("genus")?.split(",") || []).includes(entry.class)
    )
  );

  const handleFilterChange = (param: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    let values = params.get(param)?.split(",") || [];
    if (values.includes(value)) {
      values = values.filter((v) => v !== value);
      if (param === "genus") {
        setOrderValues((prev) => prev.filter((entry) => entry.class !== value));
      }
    } else {
      values.push(value); // Add new selection
      if (param === "genus") {
        const matchedEntry = OrderValues.find((entry) => entry.class === value);
        const alreadyIncluded = orderValues.some(
          (entry) => entry.class === value
        );
        if (matchedEntry && !alreadyIncluded) {
          setOrderValues((prev) => [...prev, matchedEntry]);
          console.log(matchedEntry);
        }
      }
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
        className="flex items-center text-base gap-6  shadow-black shadow-md bg-gradient-to-br  from-gray-950 to-70% transition-all duration-200 to-gray-900 hover:border-green-600 border border-gray-200 py-2 pl-6 pr-2 sm:text-xl rounded-lg  hover:cursor-pointer hover:from-green-600 hover:to-gray-950 "
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
        className={`flex flex-col gap-7 left-0 md:left-auto absolute shadow-black shadow-md bg-gradient-to-br  from-gray-900 to-70%  to-gray-950 hover:border-green-600 border border-gray-200 py-2 pl-6 pr-2 md:text-xl   hover:cursor-pointer  mt-28 sm:mt-0 p-4 sm:p-10 transition-all duration-500 w-full md:w-1/2 rounded-b-lg rounded-tr-lg z-50 ${
          expandFilter ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
      >
        <div className="flex text-sm sm:text-base gap-1 sm:gap-2 flex-wrap border-b border-slate-400 pb-4">
          {[
            "Säugetier",
            "Vogel",
            "Amphibie",
            "Reptil",
            "Insekt",
            "Arachnoid",
          ].map((genus) => (
            <div
              key={genus}
              className={`${
                searchParams.get("genus")?.includes(genus)
                  ? "bg-gradient-to-br from-green-600  to-70% to-gray-950 border border-green-600"
                  : "from-gray-950"
              } rounded-lg p-2 cursor-pointer bg-gradient-to-br  hover:from-green-600  to-70% hover:to-gray-950 to-gray-950 border hover:border-green-600 transition-all duration-500`}
              onClick={() => handleFilterChange("genus", genus)}
            >
              {genus}
            </div>
          ))}
        </div>
        {searchParams.get("genus") && (
          <div className="flex flex-col text-sm sm:text-base gap-1 sm:gap-2 flex-wrap border-b border-slate-400 pb-4">
            {orderValues &&
              orderValues.map((Class) => (
                <div key={Class.class}>
                  <h3>{Class.class} Ordnungen:</h3>
                  <div className="flex gap-2 flex-wrap border-b border-slate-400 pb-4">
                    {Class.orders.map((order) => (
                      <div
                        key={order}
                        className={`${
                          searchParams.get("order")?.includes(order)
                            ? "bg-gradient-to-br from-green-600  to-70% to-gray-950 border border-green-600"
                            : "from-gray-950"
                        } rounded-lg p-2 cursor-pointer bg-gradient-to-br  hover:from-green-600  to-70% hover:to-gray-950 to-gray-950 border hover:border-green-600 transition-all duration-500`}
                        onClick={() => handleFilterChange("order", order)}
                      >
                        {order}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
        <div className="flex flex-wrap gap-1 sm:gap-6 border-b border-slate-400 pb-4">
          {colorsList.map((color) => (
            <div
              key={color.eng}
              className={`${
                searchParams.get("color")?.includes(color.eng)
                  ? color.styleBg
                  : color.styleBorder
              }  cursor-pointer bg-gradient-to-br from-gray-950 hover:from-green-600  to-70% hover:to-gray-950 to-gray-950 transition-all duration-500 p-2 rounded-lg border-2 text-sm sm:text-base `}
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
                  ? "bg-gradient-to-br from-green-600  to-70% to-gray-950 border border-green-600"
                  : "from-gray-950"
              } rounded-lg p-2 cursor-pointer bg-gradient-to-br  hover:from-green-600  to-70% hover:to-gray-950 to-gray-950 border hover:border-green-600 transition-all duration-500`}
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
              className="hover:text-gray-900 bg-green-600 p-2 sm:p-4 rounded-lg hover:bg-green-700  text-nowrap "
              onClick={handleSizeChange}
            >
              Größe ändern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
