"use client";

import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { i } from "motion/react-client";
import { ReactEventHandler, useState } from "react";
import { CircleLoader } from "react-spinners";

export default function ReverseImageSearch({ user }: { user: User | null }) {
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<null | File>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    setSelectedFile(file);
    console.log("Selected File:", file);
  };

  const uploadImage = async () => {
    if (!selectedFile) {
      alert("Bitte zuerst ein Bild auswählen.");
      return;
    }
    if (!user) {
      alert("Bitte zuerst anmelden");
      return;
    }

    setLoading(true);

    let imageExists = false;
    const fileName = `${Date.now()}-${selectedFile.name}`;
    const filePath = `/${user.id}/${fileName}`;

    const { data: listData, error: listError } = await supabase.storage
      .from("imagesearch")
      .list(user?.id, {
        limit: 2,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });
    if (listError) {
      console.error(listError);
    }
    const filteredData = listData?.filter(
      (item: any) => item.name !== ".emptyFolderPlaceholder"
    );
    console.log("Filtered Data:", filteredData);
    if (filteredData?.length === 0) {
      imageExists = false;
    }
    imageExists = true;
    if (imageExists && filteredData && filteredData.length > 0) {
      console.log(
        "Filtered Data:",
        filteredData[0],
        user.id + "/" + filteredData[0].name
      );

      const { error } = await supabase.storage
        .from("imagesearch")
        .remove([user.id + "/" + filteredData[0].name]);
      if (error) {
        console.error("Upload error:", error.message);
        alert("Failed to upload image.");
        setLoading(false);
        return;
      }
    }
    const { error } = await supabase.storage
      .from("imagesearch")
      .upload(filePath, selectedFile, {
        cacheControl: "3600",
        upsert: true,
      });
    if (error) {
      console.error("Upload error:", error.message);
      alert("Hochladen des Bildes fehlgeschlagen.");
      setLoading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("imagesearch")
      .getPublicUrl(`${user.id}/${fileName}`);
    const publicUrl = publicUrlData.publicUrl;

    setImageUrl(publicUrl);
    console.log("Public URL:", publicUrl);
    setLoading(false);
  };

  // Open Google Reverse Image Search
  const handleSearch = () => {
    if (!imageUrl) {
      alert("Bitte Zuerst ein Bild hochladen");
      return;
    }
    const searchUrl = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(
      imageUrl
    )}`;
    window.open(searchUrl, "_blank");
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <h1 className="sm:text-xl font-bold text-center">
        Tier mit Google Lens bestimmen
      </h1>
      <label className="text-center group">
        <div className="bg-green-600 text-gray-900  rounded-lg hover:bg-green-700 hover:text-slate-200 transition h-10 px-4 cursor-pointer flex items-center justify-center">
          1. Datei auswählen
        </div>
        {selectedFile && (
          <div className="truncate text-xs sm:text-base mt-2">
            {selectedFile.name}
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
      <button
        onClick={uploadImage}
        disabled={loading}
        className="bg-green-600 text-gray-900 px-4 rounded-lg hover:bg-green-700 hover:text-slate-200 transition h-12 "
      >
        {loading ? <CircleLoader size={20} /> : " 2. Bild hochladen"}
      </button>
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Uploaded"
          className=" h-24 sm:w-32 sm:h-32 object-cover rounded-lg"
        />
      )}
      <button
        onClick={handleSearch}
        className="bg-green-600 text-gray-900 px-4 rounded-lg hover:bg-green-700 hover:text-slate-200 transition h-12"
      >
        3. Bild auf Google Suchen
      </button>
    </div>
  );
}
