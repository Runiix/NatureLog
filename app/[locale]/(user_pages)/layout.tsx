import { createClient } from "@/utils/supabase/server";
import Nav from "../components/general/Nav";
import "leaflet/dist/leaflet.css";
import { ReactNode } from "react";
import { getUser } from "../utils/data";
import { getIsAdmin } from "@/utils/supabase/isAdmin";

export default async function Layout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const user = await getUser(supabase);
  const isAdmin = user ? await getIsAdmin(supabase) : false;
  return (
    <>
      <Nav user={user} isAdmin={isAdmin} />
      <div className="min-h-full mt-10 sm:mt-16">
        {children}
      </div>
    </>
  );
}
