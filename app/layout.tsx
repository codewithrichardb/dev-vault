import { Metadata } from 'next'
import React from 'react'
import {auth, signOut} from '@/lib/auth'
import Link from 'next/link'
import "./globals.css"

//1. add meta data
export const metadata: Metadata = {
  title: "DevVault | Creator Showcase",
  description: "The ultimate vault for developer projects and premium case studies"
}

async function RootLayout({children}: {children: React.ReactNode}) {
  const session = await auth()
  return (
   <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <nav className="flex items-center justify-between p-6 bg-white border-b">
          <Link href="/" className="text-xl font-bold tracking-tighter">🛡️ DevVault</Link>
          <div className="flex gap-4 items-center">
            {session ? (
              <>
                <span className="text-sm text-slate-600">Hi, {session.user?.name}</span>
                <form action={async () => { "use server"; await signOut(); }}>
                  <button type="button" className="text-sm font-medium text-red-600">Sign Out</button>
                </form>
              </>
            ) : (
              <Link href="/api/auth/signin" className="text-sm font-medium text-blue-600">Sign In</Link>
            )}
          </div>
        </nav>
        <main className="max-w-5xl mx-auto py-10 px-6">{children}</main>
      </body>
    </html>
  )
}

export default RootLayout