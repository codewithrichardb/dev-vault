import LikeButton from '@/components/LikeButton'
import NoteForm from '@/components/NoteForm'
import { auth } from '@/lib/auth'
import Image from 'next/image'
import { redirect } from 'next/navigation'

// Dynamic metadata
export async function generateMetadata({params}: {params: {id: string}}) {
    return {
        title: `DevVault | Project ${params.id}`,
    }
}

async function Project({params}: {params: {id: string}}) {
  const session = await auth()

  // Premium check
  if(!session){
    redirect('/api/auth/signin')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-slate-200">
        <Image 
          src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800" 
          alt="Project Cover" 
          fill 
          className="object-cover" 
        />
      </div>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Project: {params.id}</h1>
        <LikeButton /> {/* Client Component at the Table */}
      </div>
      <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl">
        <h4 className="font-bold text-blue-800">Premium Insight</h4>
        <p className="text-blue-700 text-sm mt-2">Because you are logged in as {session.user?.email}, you can see this restricted code architecture breakdown.</p>
      </div>
      <NoteForm projectId={params.id} />
    </div>
  )
}

export default Project