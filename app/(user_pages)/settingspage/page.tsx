import DeleteUserModal from "@/app/components/general/DeleteUserModal";
import { getUser } from "@/app/utils/data";
import { createClient } from "@/utils/supabase/server";

export default async function settingspage() {
  const supabase = await createClient();
  const user = await getUser(supabase);
  if (!user) return <div>No USER</div>;
  return <div>{/* <DeleteUserModal user={user} /> */}</div>;
}
