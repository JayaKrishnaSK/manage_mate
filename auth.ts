import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/lib/validations/auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validate credentials
          const validation = loginSchema.safeParse(credentials);
          if (!validation.success) {
            return null;
          }

          const { email, password } = validation.data;

          // Import dynamically to avoid edge runtime issues
          const { User } = await import("@/models/User");
          const { verifyPassword } = await import("@/lib/auth-helpers");
          const connectToDatabase = (await import("@/lib/db")).default;

          // Connect to database
          await connectToDatabase();

          // Find user
          const user = (await User.findOne({
            email,
            isActive: true,
          }).lean()) as any;
          if (!user) {
            return null;
          }

          // Verify password
          const isValidPassword = await verifyPassword(password, user.password);
          if (!isValidPassword) {
            return null;
          }

          // Return user object with serializable data
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.roles[0] || "user",
            roles: Array.isArray(user.roles) ? user.roles.slice() : [], // Ensure plain array
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Persist user data to the token
      if (user) {
        token.roles = Array.isArray(user.roles) ? [...user.roles] : [];
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.sub!;
        session.user.roles = token.roles as string[];
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.AUTH_SECRET,
});
