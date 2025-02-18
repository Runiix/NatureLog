import { createClient } from "@/utils/supabase/server";
import Nav from "../components/general/Nav";
import { SupabaseClient } from "@supabase/supabase-js";

const getUser = async (supabase: SupabaseClient) => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) return null;
  return user;
};

import { ReactNode } from "react";

export default async function Layout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const user = await getUser(supabase);
  return (
    <>
      <Nav user={user} />
      <main>{children}</main>
    </>
  );
}
