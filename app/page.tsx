import Link from 'next/link'

// ISR: Revalidate every hour
export const revalidate = 3600

export default function HomePage() {
  const projects = [
    {id: 1, title: "Project 1", category: "Fullstack", slug: "project-1"},
    {id: 2, title: "Project 2", category: "Frontend", slug: "project-2"},
  ]
  return (
    <div className="space-y-8">
      <header className="text-center py-10">
        <h2 className="text-4xl font-extrabold">Discover Premium Projects</h2>
        <p className="text-slate-500 mt-2">Static content, updated hourly via ISR.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((p) => (
          <Link key={p.id} href={`/projects/${p.id}`} className="block p-6 bg-white rounded-xl border hover:shadow-lg transition">
            <span className="text-xs font-bold text-blue-500 uppercase">{p.category}</span>
            <h3 className="text-xl font-bold mt-1">{p.title}</h3>
            <p className="text-slate-500 mt-4 text-sm underline text-right">View Case Study →</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
