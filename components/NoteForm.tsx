'use client'

import { saveProjectNote } from "@/lib/actions"
import React from "react"

export default function NoteForm({ projectId }: { projectId: string }) {
    const [status, setStatus] = React.useState("")

    const handleSubmit = (formData: FormData) => {
        setStatus("Saving...")
        saveProjectNote(formData)
            .then(() => {
                setStatus("Saved!")
                setTimeout(() => {
                    setStatus("Note saved locally")
                }, 2000)
                 setTimeout(() => {
                    setStatus("")
                }, 2000)
            }).catch(() => {
                setStatus("Error saving note. Please try again.")
            })
    }

    return (
        <form action={handleSubmit} className="mt-6 p-4 bg-slate-100 rounded-lg">
            <label className="block text-sm font-bold mb-2">Private Project Notes</label>
            <input type="hidden" name="projectId" value={projectId} />
            <textarea
                name="note"
                className="w-full p-2 border rounded"
                placeholder="What did you learn from this project?"
            />
            <button
                type="submit"
                className="mt-2 px-4 py-2 bg-black text-white rounded text-sm hover:bg-slate-800"
            >
                {status || "Save Note"}
            </button>
        </form>
    )
}