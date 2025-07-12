import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    accessToken?: string
    user: {
      /** The user's postal address. */
      role?: string
    } & DefaultSession["user"]
  }

  interface User {
    role?: string,
    accessToken?: string
  }
}

import { JWT } from "next-auth/jwt"

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when signed, also verified) */
  interface JWT {
    role?: string,
    accessToken?: string
  }
}
