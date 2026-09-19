import { notFound } from "next/navigation";
import requireAuth from "./requireAuth";
import { getIsAdmin } from "./isAdmin";

/**
 * Gate for admin pages and actions. Like requireAuth, but a signed-in user
 * without the admin role gets a 404, so the admin area does not reveal that it
 * exists.
 */
export default async function requireAdmin() {
  const { supabase, user } = await requireAuth();
  if (!(await getIsAdmin(supabase))) notFound();
  return { supabase, user };
}
