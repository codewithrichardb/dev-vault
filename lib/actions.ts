"use server"
import {revalidatePath} from "next/cache"
import { auth } from "./auth"

export async function saveProjectNote(formData: FormData) {
   const session = await auth()

   // 1. Secure check
   if(!session) return "You must be signed in to save a note."

   //get form data
   const id = formData.get("id") as string
   const note = formData.get("note") as string

   // 2. Database logic
    console.log("Saving note to project", id, note)

    // 3. Invalidate cache
    // this tells nextjs to clear the cache for this project page
    revalidatePath(`/projects/${id}`)

    return {success: true}
}