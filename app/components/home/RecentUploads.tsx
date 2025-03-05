import React from "react";
import ImageSlider from "./ImageSlider";
import Link from "next/link";

export default function RecentUploads({ data }: any) {
  return (
    <div className="overflow-hidden">
      <h2 className="text-xl flex flex-col m-3">Zuletzt hochgeladen:</h2>
      <ImageSlider data={data} />
    </div>
  );
}
