// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

// ✅ Dùng server-side env, không dùng authApi (client axios)
const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || "http://localhost:3001";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email/Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }

        try {
          // ✅ Dùng native fetch với absolute URL từ server-side env
          const res = await fetch(`${BACKEND_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              identifier: credentials.identifier,
              password: credentials.password,
            }),
          });

          if (!res.ok) return null;

          const data = await res.json();
          // Unwrap nếu BE trả về { success, data: { user, accessToken } }
          const response = data?.data ?? data;

          if (response?.user) {
            return {
              id: response.user.id,
              email: response.user.email,
              name: response.user.username,
              image: response.user.avatar,
              accessToken: response.accessToken,
              ...response.user,
            };
          }

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === "google") {
        token.provider = "google";
      }
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        // ✅ Lưu accessToken vào JWT nếu cần dùng sau
        token.accessToken = (user as any).accessToken;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl + "/dashboard";
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
