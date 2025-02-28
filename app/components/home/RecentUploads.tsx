import Image from "next/image";
import React from "react";

export default function RecentUploads({ data }: any) {
  return (
    <div className="bg-gray-900 rounded-lg p-2">
      <h2 className="text-xl flex flex-col mb-2">Zuletzt hochgeladen:</h2>
      <div className="flex flex-wrap gap-4 ">
        {data.map((item: any) => (
          <div key={item.id}>
            <Image
              src={item.image_url}
              alt="recent Image"
              width="150"
              height="150"
              className="aspect-square object-cover rounded-lg"
            ></Image>
          </div>
        ))}
      </div>
    </div>
  );
}
