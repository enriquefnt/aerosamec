import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      rol: string
      telefono?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    rol: string
    telefono?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    rol: string
    telefono?: string
  }
}