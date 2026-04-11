import { User } from "@supabase/supabase-js";
import ImageSlider from "./ImageSlider";

type RecentUploadsType = {
  id: number;
  common_name: string;
  image: boolean;
  first_spotted_at: string;
  signedUrls: {
    collection: string;
    collectionModal: string;
  };
};
export default function RecentUploads({
  data,
  user,
}: {
  data: RecentUploadsType[];
  user: User;
}) {
  return (
    <div className="overflow-hidden">
      <h2 className="text-xl flex flex-col m-3">Zuletzt gesehen:</h2>
      <ImageSlider data={data} user={user} />
    </div>
  );
}
