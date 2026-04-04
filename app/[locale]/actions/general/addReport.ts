"use server"

import { createClient } from "@/utils/supabase/server"

export default async function addReport(userId: string, imageLink: string, reportText: string){
    const supabase = await createClient()
    const { error } = await supabase.from("reports").insert({ image_link: imageLink, user_id: userId, report_text: reportText })
    if(error){ console.error("Error adding new report", error) 
        return{success: false}}
    return {success: true}
}