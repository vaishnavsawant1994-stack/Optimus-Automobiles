import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: { signIn: '/login' },
  callbacks: {
    authorized({ token, req }) {
      if (!token) return false
      if (req.nextUrl.pathname.startsWith('/admin')) return token.role === 'ADMIN' || token.role === 'SUPER_ADMIN'
      return true
    },
  },
})

export const config = { matcher: ['/account/:path*', '/admin/:path*'] }
