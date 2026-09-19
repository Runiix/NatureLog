import { createClient } from "@/utils/supabase/server";
import Nav from "../components/general/Nav";
import "leaflet/dist/leaflet.css";
import { ReactNode } from "react";
import { getUser } from "../utils/data";

export default async function Layout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const user = await getUser(supabase);
  return (
    <>
      <Nav user={user} />
      <div className="min-h-full mt-10 sm:mt-16">
        {children}
      </div>
    </>
  );
}
