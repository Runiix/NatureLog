"use client";
import { useEffect, useState, useTransition } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { colorsList, SizeSlider } from "../../constants/constants";
import {
  Check,
  ExpandMore,
  Favorite,
  HeartBroken,
  Star,
} from "@mui/icons-material";
import Switch from "../general/Switch";
import { User } from "@supabase/supabase-js";

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
      "Fledertiere (Chiroptera)",
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

export default function LexiconFilter({ user }: { user: User | null }) {
  const searchParams = useSearchParams();
  const pathName = usePathname();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [sliderValue, setSliderValue] = useState<number[]>(() => {
    const sizeFrom = Number(searchParams.get("sizeFrom")) || 0;
    const sizeTo = Number(searchParams.get("sizeTo")) || 0;
    return sizeFrom === 0 && sizeTo === 0 ? [0, 500] : [sizeFrom, sizeTo];
  });
  const [onlyUnseen, setOnlyUnseen] = useState(
    Boolean(searchParams.get("onlyUnseen")) || false,
  );
  const [onlySeen, setOnlySeen] = useState(
    Boolean(searchParams.get("onlySeen")) || false,
  );
  const [excludeRares, setExcludeRares] = useState(
    Boolean(searchParams.get("excludeRares")) || false,
  );
  const [orderValues, setOrderValues] = useState<ClassToOrder[]>(
    OrderValues.filter((entry) =>
      (searchParams.get("genus")?.split(",") || []).includes(entry.class),
    ),
  );
  useEffect(() => {
    const unseen = searchParams.get("onlyUnseen") || false;
    const seen = searchParams.get("onlySeen") || false;
    const noRare = searchParams.get("excludeRares") || false;
    if (unseen === false) setOnlyUnseen(false);
    if (seen == false) setOnlySeen(false);
    if (noRare == false) setExcludeRares(false);
  }, [searchParams]);

  const handleFilterChange = (param: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    let values = params.get(param)?.split(",") || [];
    if (values.includes(value)) {
      values = values.filter((v) => v !== value);
      if (param === "genus") {
        setOrderValues((prev) => prev.filter((entry) => entry.class !== value));
      }
    } else {
      values.push(value);
      if (param === "genus") {
        const matchedEntry = OrderValues.find((entry) => entry.class === value);
        const alreadyIncluded = orderValues.some(
          (entry) => entry.class === value,
        );
        if (matchedEntry && !alreadyIncluded) {
          setOrderValues((prev) => [...prev, matchedEntry]);
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
  const handleOnlyUnseenChange = () => {
    const params = new URLSearchParams(searchParams.toString());
    let value = params.get("onlyUnseen") || false;
    if (value === false) {
      params.set("onlyUnseen", "true");
      setOnlyUnseen(true);
    } else {
      params.delete("onlyUnseen");
      setOnlyUnseen(false);
    }
    startTransition(() => {
      router.replace(`${pathName}?${params.toString()}`);
    });
  };
  const handleOnlySeenChange = () => {
    const params = new URLSearchParams(searchParams.toString());
    let value = params.get("onlySeen") || false;
    if (value === false) {
      params.set("onlySeen", "true");
      setOnlySeen(true);
    } else {
      params.delete("onlySeen");
      setOnlySeen(false);
    }
    startTransition(() => {
      router.replace(`${pathName}?${params.toString()}`);
    });
  };
  const handleExcludeRaresChange = () => {
    const params = new URLSearchParams(searchParams.toString());
    let value = params.get("excludeRares") || false;
    if (value === false) {
      params.set("excludeRares", "true");
      setExcludeRares(true);
    } else {
      params.delete("excludeRares");
      setExcludeRares(false);
    }
    startTransition(() => {
      router.replace(`${pathName}?${params.toString()}`);
    });
  };
  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-4 border-b border-gray-950 pb-4 mb-4">
        <div className="space-y-2">
          {user && (
            <div className="flex items-center  shadow-black shadow-md bg-gradient-to-br  from-gray-950 to-70% transition-all duration-200 to-gray-900  border border-gray-200 h-11 justify-between gap-2 rounded-lg p-2 relative group">
              <div className="flex items-center gap-2">
                <HeartBroken className="text-red-600" />
                <p className="text-xs">Nur nicht gesehene Arten</p>
              </div>
              <Switch
                value={onlyUnseen}
                onChange={() => handleOnlyUnseenChange()}
              />
              {/* <div className="opacity-0 transition-all absolute duration-200 group-hover:opacity-100 shadow-black shadow-lg bg-gradient-to-br  from-gray-950 to-70%  to-gray-900 border border-gray-200 rounded-lg p-2 -top-8 z-50">
                <p className="text-xs text-center">
                  Nur nicht gesehene Arten anzeigen
                </p>
              </div> */}
            </div>
          )}
          {user && (
            <div className="flex items-center  shadow-black shadow-md bg-gradient-to-br  from-gray-950 to-70% transition-all duration-200 to-gray-900  border border-gray-200 h-11 justify-between gap-2 rounded-lg p-2  relative group">
              <div className="flex items-center gap-2">
                <Favorite className="text-green-600" />
                <p className="text-xs">Nur gesehene Arten</p>
              </div>
              <Switch
                value={onlySeen}
                onChange={() => handleOnlySeenChange()}
              />
              {/* <div className="opacity-0 transition-all absolute duration-200 group-hover:opacity-100 shadow-black shadow-lg bg-gradient-to-br  from-gray-950 to-70%  to-gray-900 border border-gray-200 rounded-lg p-2 -top-8 z-50">
                <p className="text-xs text-center">
                  Nur gesehene Arten anzeigen
                </p>
              </div> */}
            </div>
          )}
          <div className="flex items-center  shadow-black shadow-md bg-gradient-to-br  from-gray-950 to-70% transition-all duration-200 to-gray-900  border border-gray-200 h-11  gap-2 rounded-lg p-2 relative group justify-between">
            <div className="flex items-center gap-2">
              <Star className="text-red-600" />
              <p className="text-xs">Seltene ausblenden</p>
            </div>
            <Switch
              value={excludeRares}
              onChange={() => handleExcludeRaresChange()}
            />

            {/* <div className="opacity-0 transition-all absolute duration-200 group-hover:opacity-100 shadow-black shadow-lg bg-gradient-to-br  from-gray-950 to-70%  to-gray-900 border border-gray-200 rounded-lg p-2 -top-16 z-50">
              <p className="text-xs text-center">
                Irrgäste und Ausnahmeerscheinungen ausblenden
              </p>
            </div> */}
          </div>
        </div>
      </div>
      <div className=" border-b border-gray-950 pb-4 mb-4">
        <h2 className="text-black">Gattungen</h2>
        <div className="grid grid-cols-2">
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
      </div>
      {searchParams.get("genus") && (
        <div className=" border-b border-gray-950 pb-4 mb-4">
          <h2 className="text-black">Ordnungen</h2>
          {orderValues &&
            orderValues.map((Class) => (
              <div key={Class.class}>
                <h3 className="text-black">{Class.class}</h3>
                <div className="flex flex-col border-b border-slate-400 pb-2 mb-2">
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
      <div className="border-b border-gray-950 pb-4 mb-4">
        <h2 className="text-black">Farben</h2>
        <div className="flex gap-2 flex-wrap">
          {colorsList.map((color) => (
            <div
              key={color.eng}
              className={`${
                color.styleBg
              } ${searchParams.get("color")?.includes(color.eng) ? "shadow-xl hover:shadow-none" : "hover:shadow-xl"} cursor-pointer transition-all duration-500 w-8 h-8 rounded-full border-2 text-sm sm:text-base border-gray-950 flex items-center justify-center shadow-black`}
              onClick={() => handleFilterChange("color", color.eng)}
            >
              {searchParams.get("color")?.includes(color.eng) && (
                <Check sx={{ color: color.isDark ? "white" : "black" }} />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className=" border-b border-gray-950 pb-4 mb-4">
        <h2 className="text-black">Gefährdung</h2>
        <div className="flex flex-col">
          {[
            "Nicht gefährdet",
            "Extrem selten",
            "Vorwarnliste",
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
      </div>
      <div className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-black">Größe</h2>{" "}
          <button
            className="bg-gradient-to-br from-gray-950 to-70%  to-gray-900 border border-gray-200 rounded-lg p-2 text-sm shadow-black shadow-md hover:border-green-600 transition-all duration-200"
            onClick={handleSizeChange}
            aria-label="Größe Filter ändern"
          >
            Größe ändern
          </button>
        </div>
        <div className="flex flex-col sm:gap-10 items-center px-4 pt-1 sm:pt-0 sm:px-0 mx-4">
          <SizeSlider
            getAriaLabel={() => "Größe"}
            value={sliderValue}
            onChange={handleSliderChange}
            valueLabelDisplay="auto"
            min={0}
            max={500}
          />
        </div>
      </div>
    </div>
  );
}
