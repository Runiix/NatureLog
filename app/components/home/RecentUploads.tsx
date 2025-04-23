import React from "react";
import ImageSlider from "./ImageSlider";

type RecentUploadsType = {
  id: number;
  user_id: string;
  image_url: string;
  created_at: string;
  username: string;
};
export default function RecentUploads({ data }: { data: RecentUploadsType[] }) {
  return (
    <div className="overflow-hidden">
      <h2 className="text-xl flex flex-col m-3">Zuletzt hochgeladen:</h2>
      <ImageSlider data={data} />
    </div>
  );
}
