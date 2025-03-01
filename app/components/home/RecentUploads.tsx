import React from "react";
import ImageSlider from "./ImageSlider";

export default function RecentUploads({ data }: any) {
  return (
    <div className="bg-gray-900 rounded-lg p-2 w-full">
      <h2 className="text-xl flex flex-col mb-2">Zuletzt hochgeladen:</h2>
      <ImageSlider data={data} />
    </div>
  );
}
