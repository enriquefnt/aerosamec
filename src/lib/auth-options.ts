import type { Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: { email?: string; password?: string } | undefined): Promise<{
        id: string;
        email: string;
        name: string;
        rol: string;
        funcion: string;
        telefono?: string;
      } | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const usuario = await prisma.usuario.findUnique({
            where: {
              email: credentials.email
            }
          });

          if (!usuario || !usuario.activo) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            usuario.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: usuario.id,
            email: usuario.email,
            name: `${usuario.nombre} ${usuario.apellido}`,
            rol: usuario.rol,
            funcion: usuario.funcion,
            telefono: usuario.telefono || undefined
          };
        } catch (error) {
          console.error('Error en autenticación:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({
      token,
      user
    }: {
      token: JWT & { rol?: string; funcion?: string; telefono?: string };
      user?: { rol?: string; funcion?: string; telefono?: string; id?: string; email?: string; name?: string } | undefined;
    }) {
      if (user) {
        token.rol = user.rol || 'USER';
        token.funcion = user.funcion || '';
        token.telefono = user.telefono || '';
      }
      return token;
    },
    async session({
      session,
      token
    }: {
      session: Session;
      token: JWT & { rol?: string; funcion?: string; telefono?: string; sub?: string };
    }) {
      if (token && session.user) {
        session.user.id = token.sub || '';
        session.user.rol = token.rol || '';
        session.user.funcion = token.funcion || '';
        session.user.telefono = token.telefono;
      }
      return session;
    }
  },
  pages: {
    signIn: '/'
  },
  secret: process.env.NEXTAUTH_SECRET || 'tu-secreto-super-seguro-aqui'
};
