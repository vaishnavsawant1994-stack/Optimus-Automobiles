import type { DefaultSession } from 'next-auth'
import type { UserRole, UserStatus } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
      status: UserStatus
      sessionVersion: number
    } & DefaultSession['user']
    authError?: 'SESSION_REVOKED' | 'ACCOUNT_INACTIVE'
  }

  interface User {
    role: UserRole
    status: UserStatus
    sessionVersion: number
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: UserRole
    status?: UserStatus
    sessionVersion?: number
    authError?: 'SESSION_REVOKED' | 'ACCOUNT_INACTIVE'
  }
}
