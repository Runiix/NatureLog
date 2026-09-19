"use server";

import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/utils/supabase/server";
import { isStrongPassword, isValidUsername } from "@/app/[locale]/utils/credentials";
import { escapeLike } from "@/app/[locale]/utils/escapeLike";

export type AuthErrorCode =
  | "invalidCredentials"
  | "banned"
  | "emailNotConfirmed"
  | "usernameTaken"
  | "usernameInvalid"
  | "passwordWeak"
  | "generic";

/** Maps Supabase auth errors to message keys, without echoing raw text. */
function toErrorCode(error: { code?: string; message: string }): AuthErrorCode {
  const code = error.code ?? "";
  if (code === "invalid_credentials" || error.message === "Invalid login credentials") {
    return "invalidCredentials";
  }
  if (code === "user_banned" || error.message === "User is banned") return "banned";
  if (code === "email_not_confirmed") return "emailNotConfirmed";
  if (code === "weak_password") return "passwordWeak";
  return "generic";
}

export async function login(formData: FormData): Promise<{ error: AuthErrorCode } | void> {
  const email = formData.get("email");
  const password = formData.get("password");
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return { error: "invalidCredentials" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: toErrorCode(error) };

  revalidatePath("/", "layout");
  // Locale-aware: this used to always land on /de/homepage.
  redirect({ href: "/homepage", locale: await getLocale() });
}

export async function signup(
  formData: FormData,
): Promise<{ error: AuthErrorCode } | { success: true }> {
  const username = formData.get("username");
  const email = formData.get("email");
  const password = formData.get("password");

  // The username becomes part of every profile URL; it used to be accepted
  // as typed, spaces and slashes included.
  if (!isValidUsername(username)) return { error: "usernameInvalid" };
  if (!isStrongPassword(password)) return { error: "passwordWeak" };
  if (typeof email !== "string" || !email.includes("@")) return { error: "generic" };

  const supabase = await createClient();
  const { data: taken, error: lookupError } = await supabase
    .from("users")
    .select("id")
    // Case-insensitive, so "Anna" cannot impersonate "anna"; "_" is a
    // LIKE wildcard and allowed in names, hence the escaping.
    .ilike("display_name", escapeLike(username))
    .limit(1);
  if (lookupError) console.error("Error checking username", lookupError);
  if (taken && taken.length > 0) return { error: "usernameTaken" };

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { displayName: username } },
  });
  if (error) {
    console.error("Sign-up failed", error.code);
    return { error: toErrorCode(error) };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
