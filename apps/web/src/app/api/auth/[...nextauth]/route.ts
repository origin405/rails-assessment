// src/app/api/auth/[...nextauth]/route.ts

import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// @ts-ignore
import { verify } from 'jsonwebtoken';

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        token: { label: "Token", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.token) return null;
        
        try {
          const decoded = verify(credentials.token, process.env.JWT_SECRET!) as { userId: string,  name: string, 
            email: string  };
          // Here you would typically fetch the user from your database
          // For this example, we'll just return the decoded token
          console.log("decoded:", decoded);
          console.log("decoded.userId:", decoded.userId);
          return { 
            id: decoded.userId, 
            name: decoded.name, 
            email: decoded.email 
          };
        } catch (error) {
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token, user }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      return session;
    }
  },
  // pages: {
  //   signIn: '/auth/signin',
  // },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };