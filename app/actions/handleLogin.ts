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

  // type-casting here for convenience
  // in practice, you should validate your inputs

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };
  if (!validatePassword(data.password)) {
    redirect("/error");
  }

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    alert("Wrong E-Mail or Password");
  }

  revalidatePath("/", "layout");
  redirect("/homepage");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  console.log("SIGNING UP");
  // type-casting here for convenience
  // in practice, you should validate your inputs
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
    redirect("/error");
  }
  const { error } = await supabase.auth.signUp(data);

  if (error) {
    console.error("Error during sign up", error);
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/homepage");
}
