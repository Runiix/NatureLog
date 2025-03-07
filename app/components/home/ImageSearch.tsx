"use client";

import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
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
    const fileName = `${Date.now()}-${selectedFile.name}`;
    const filePath = `/${user.id}/`;

    const { error } = await supabase.storage
      .from("imagesearch")
      .upload(filePath, selectedFile, {
        cacheControl: "3600",
        upsert: true,
      });
    if (error) {
      console.error("Upload error:", error.message);
      alert("Failed to upload image.");
      setLoading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("imagesearch")
      .getPublicUrl(`${user.id}/${fileName}`);
    const publicUrl = publicUrlData.publicUrl;

    setImageUrl(publicUrl);
    setLoading(false);
  };

  // Open Google Reverse Image Search
  const handleSearch = () => {
    if (!imageUrl) {
      alert("No image URL found. Please upload an image first.");
      return;
    }
    const searchUrl = `https://www.google.com/searchbyimage?image_url=${encodeURIComponent(
      imageUrl
    )}`;
    window.open(searchUrl, "_blank");
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <h1 className="text-xl font-bold text-center">
        Tier mit der Google reverse image Search bestimmen
      </h1>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="border p-2 rounded"
      />
      <button
        onClick={uploadImage}
        disabled={loading}
        className="bg-green-600 text-gray-900 px-4 py-2 rounded hover:bg-green-700 hover:text-slate-200 transition"
      >
        {loading ? <CircleLoader /> : "Bild hochladen"}
      </button>
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Uploaded"
          className="w-32 h-32 object-cover mt-2 rounded"
        />
      )}
      <button
        onClick={handleSearch}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        Bild auf Google Suchen
      </button>
    </div>
  );
}
