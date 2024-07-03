import Placeholder from "../assets/images/Placeholder.jpg";
import Image from "next/image";
import Link from "next/link";

export default function LexiconCard({
  id,
  common_name,
  scientific_name,
  category,
  description,
  habitat,
  population_estimate,
  endangerment_status,
  size_from,
  size_to,
  sortBy,
  imageUrl,
}: {
  id: number;
  common_name: string;
  scientific_name: string;
  category: string;
  description: string;
  habitat: string;
  population_estimate: string;
  endangerment_status: string;
  size_from: string;
  size_to: string;
  sortBy: string;
  imageUrl: string;
}) {
  const link = `/animalpage/${common_name}`;

  return (
    <div className="group">
      <Link href={link}>
        <div className="flex flex-col hover:cursor-pointer w-80 h-72 bg-gray-900 rounded-lg">
          <Image
            src={imageUrl}
            alt="Placeholder"
            width={300}
            height={200}
            className="object-cover w-full h-full rounded-t-lg group-hover:opacity-90"
          />
          <div className=" p-4 w-full">
            <h2 className="text-2xl">{common_name}</h2>
            <h3 className="text-sm">
              {sortBy === "common_name"
                ? scientific_name
                : sortBy === "population_estimate"
                ? population_estimate
                : sortBy === "size_from"
                ? `${size_from} - ${size_to} cm`
                : endangerment_status}
            </h3>
          </div>
        </div>
      </Link>
    </div>
  );
}
