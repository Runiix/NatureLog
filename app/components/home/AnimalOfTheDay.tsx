import Image from "next/image";
import Link from "next/link";

export default function AnimalOfTheDay({
  data,
  titel,
  imageUrl,
}: {
  data: any;
  titel: string;
  imageUrl: string;
}) {
  const link = `/animalpage/${data.common_name}`;

  return (
    <div className=" sm:w-1/3 relative top-20 sm:left-10 bg-gray-900 rounded-lg  hover:bg-gray-800 max-w-[30rem]">
      <Link href={link}>
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-2xl px-4 py-2 bg-gray-900 bg-opacity-30  absolute w-full">
              Tier des {titel}
            </h2>
            <Image
              src={imageUrl}
              alt="Placeholder"
              width={300}
              height={200}
              className="object-cover aspect-[4/3] w-full group-hover:opacity-90 rounded-t-lg "
            />
          </div>
          <div className="flex flex-col gap-2 mx-2 mb-2">
            <div className=" gap-1 text-xl items-center">
              <h3>{data.common_name}</h3>
              <h3 className="text-slate-400"> {data.scientific_name}</h3>
            </div>
            <div className="">{data.description}</div>
            <div>
              <div className="text-2xl flex gap-2">
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
        </div>
      </Link>
    </div>
  );
}
