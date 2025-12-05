import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import { getUserById } from "@/data/user"
import authConfig from "@/auth.config"

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = NextAuth({
    adapter: PrismaAdapter(db),
    session: { strategy: "jwt" },

    pages: {
        signIn: "/login",
        error: "/auth-error",
    },

    events: {
        async linkAccount({ user }) {
            if (!user?.id) return;
            await db.user.update({
                where: { id: user.id },
                data: { emailVerified: new Date() },
            });
        },
    },

    callbacks: {
        async signIn({ user, account }) {
            // Allow OAuth logins directly
            if (account?.provider !== "credentials") return true;

            if (!user?.id) return false;

            const existingUser = await getUserById(user.id);
            if (!existingUser) return false;

            // Allow all valid users to sign in
            return true;
        },

        async jwt({ token }) {
            if (!token.sub) return token;

            const existingUser = await getUserById(token.sub);
            if (!existingUser) return token;

            token.role = existingUser.role;
            return token;
        },

        async session({ token, session }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
                session.user.role = token.role as "ADMIN" | "USER";
            }
            return session;
        },
    },

    ...authConfig,
});