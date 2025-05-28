"use server";

import { createClient } from "@/utils/supabase/server";
import { LatLng } from "leaflet";

export default async function addAnimalList({
  title,
  description,
  userId,
  publicList,
  lat,
  lng,
}: {
  title: string;
  description: string;
  userId: string;
  publicList: boolean;
  lat: number | null;
  lng: number | null;
}) {
  const supabase = await createClient();
  if (lat !== null && lng !== null) {
    const { error } = await supabase.from("animallists").insert({
      user_id: userId,
      title: title,
      description: description,
      is_public: publicList,
      has_location: true,
      lat: lat,
      lng: lng,
    });
    if (error) {
      console.error("Error adding animal list", error);
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } else {
    const { error } = await supabase.from("animallists").insert({
      user_id: userId,
      title: title,
      description: description,
      is_public: publicList,
    });
    if (error) {
      console.error("Error adding animal list", error);
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  }
}
