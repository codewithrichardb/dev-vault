'use client'

import { Heart } from "lucide-react"
import { useState } from "react"

function LikeButton() {
    const [liked, setLiked] = useState(false)
  return (
    <button 
      onClick={() => setLiked(!liked)}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition ${
        liked ? "bg-red-50 border-red-200 text-red-600" : "bg-white text-slate-600"
      }`}
    >
      <Heart size={18} fill={liked ? "currentColor" : "none"} />
      <span className="text-sm font-bold">{liked ? "1" : "0"}</span>
    </button>
  )
}

export default LikeButton