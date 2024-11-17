import Image from "next/image";
import Link from "next/link";

export default function AnimalOfTheDay(data: any) {
  const getUrl = (animal: any) => {
    // Define a regular expression to match the characters ä, ö, ü, and ß
    const regex = /[äöüß]/g;
    // Replace the matched characters with '_'
    const Name = animal.common_name.replace(regex, "_");
    if (animal.category === "Säugetier") {
      const imageUrl = `https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/animalImages/main/Saeugetier/${Name}.jpg`;
      return imageUrl;
    } else {
      const imageUrl = `https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/animalImages/main/${animal.category}/${Name}.jpg`;
      return imageUrl;
    }
  };
  const imageUrl = getUrl(data.data);
  console.log("Data", imageUrl);
  const link = `/animalpage/${data.data.common_name}`;

  return (
    <div className="absolute top-24 left-4 w-1/2 bg-gray-900 rounded-lg p-2 hover:bg-gray-800 ">
      <Link href={link}>
        <div>
          <h2 className="text-3xl p-4">Tier des Tages</h2>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <Image
              src={imageUrl}
              alt="Placeholder"
              width={400}
              height={500}
              className="object-cover w-full h-full  group-hover:opacity-90"
            />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex gap-1 text-2xl items-center">
              <h3>
                {data.data.common_name}
                {" - "}
              </h3>
              <h3> {data.data.scientific_name}</h3>
            </div>
            <div className="">{data.data.description}</div>
            <div>
              <div className="text-2xl flex gap-2">
                <h3
                  className={
                    data.data.endangerment_status === "Nicht gefährdet"
                      ? "text-green-600"
                      : data.data.endangerment_status === "Extrem selten"
                      ? "text-gray-400"
                      : data.data.endangerment_status === "Vorwarnliste"
                      ? "text-yellow-500"
                      : data.data.endangerment_status === "Gefährdet"
                      ? "text-orange-500"
                      : data.data.endangerment_status === "Stark gefährdet"
                      ? "text-orange-700"
                      : data.data.endangerment_status ===
                        "Vom Aussterben bedroht"
                      ? "text-red-600"
                      : "text-white"
                  }
                >
                  {data.data.endangerment_status}{" "}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
