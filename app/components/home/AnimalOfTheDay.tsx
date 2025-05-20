import Animal from "@/app/utils/AnimalType";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";

export default function AnimalOfTheDay({
  data,
  titel,
  imageUrl,
}: {
  data: Animal;
  titel: string;
  imageUrl: string | StaticImageData;
}) {
  const link = `/animalpage/${data.common_name}`;

  return (
    <Link href={link} className="h-full flex flex-col justify-between">
      <div>
        <h2 className="2xl:text-2xl px-4 py-2 ">Tier des {titel}</h2>
        <Image
          src={imageUrl}
          alt="Placeholder"
          width={300}
          height={200}
          priority
          className="object-cover aspect-video  w-full group-hover:opacity-90 min-h-[190px] sm:min-h-[230px]"
        />
      </div>
      <div className="flex flex-col mx-2 mb-2">
        <div className=" gap-1 sm:text-xl items-center">
          <h3>{data.common_name}</h3>
          <h3 className="text-slate-400 truncate"> {data.scientific_name}</h3>
        </div>
        <div>
          <div className=" flex gap-2">
            <h3
              className={
                data.endangerment_status === "Nicht gefährdet"
                  ? "text-green-600"
                  : data.endangerment_status === "Extrem selten"
                  ? "text-gray-400"
                  : data.endangerment_status === "Vorwarnliste"
                  ? "text-yellow-500"
                  : data.endangerment_status === "Gefährdet"
                  ? "text-orange-500"
                  : data.endangerment_status === "Stark gefährdet"
                  ? "text-orange-700"
                  : data.endangerment_status === "Vom Aussterben bedroht"
                  ? "text-red-600"
                  : "text-white"
              }
            >
              {data.endangerment_status}{" "}
            </h3>
          </div>
        </div>
      </div>
    </Link>
  );
}
