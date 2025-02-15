// "use server";

// import { createClient } from "@/utils/supabase/server";
// import { revalidatePath } from "next/cache";

// export async function addOrRemoveFollowing(formData: FormData) {
//   const pathName = formData.get("pathname") as string;
//   const userId= formData.get("userId") as string
//   const following = formData.get("isFollowing");
//   const supabase = await createClient();

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) {
//     return { success: false, error: "User is not authenticated!" };
//   }

//   let updatedfollowing: String;
//   const { data: followingData, error } = await supabase
//   .from("users")
//   .select("following")
//   .eq("id", userId)
//   if(error) console.error("Error fetching following list", error)
//     let updatedArray = followingData || [];
//   if (!updatedArray.includes(userId)) {
//     updatedArray.push(userId);
//   }else{
//     updatedArray.filter((item) => item !== userId)
//   }

//   revalidatePath(pathName);

//   return { success: true, isFollowing: updatedfollowing };
// }
