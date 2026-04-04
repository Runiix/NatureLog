"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

function validatePassword(password: string) {
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{10,}$/;
  return passwordRegex.test(password);
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };
  const { error } = await supabase.auth.signInWithPassword(data);

   if (error) {
    return {
      error: {
        code: error.name,
        message: error.message,
      },
    };
  }
  revalidatePath("/", "layout");
  redirect("/homepage");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const { data: userNameData, error: userNameError } = await supabase
    .from("users")
    .select("display_name")
    .eq("display_name", formData.get("username") as string);
  if (userNameError) {
    console.error("Error getting username data", userNameError);
  }
  if (userNameData && userNameData.length > 0) {
    return { usernameError: true };
  }
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      data: {
        displayName: formData.get("username"),
      },
    },
  };
  if (!validatePassword(data.password)) {
    return { validationError: true };
  }
  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect("/error");
  }
  revalidatePath("/", "layout");
  return { success: true };
}
