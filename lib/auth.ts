import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

export const {handlers, auth, signIn, signOut} = NextAuth({
    providers: [GitHub],
    callbacks: {
        authorized({auth, request: {nextUrl}}) {
            const isLoggedIn = !!auth?.user
            const isOnDashboardPage = nextUrl.pathname.startsWith('/dashboard')
            if(!isLoggedIn && isOnDashboardPage) {
                return false
            }
            return true
        },
    }
})