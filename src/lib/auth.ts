import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                console.log("Authorize called with:", credentials?.email);
                if (!credentials?.email || !credentials?.password) {
                    console.log("Missing credentials");
                    throw new Error("Invalid credentials");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                console.log("User found:", user ? "YES" : "NO");

                if (!user) {
                    console.log("No user found for email:", credentials.email);
                    throw new Error("User not found");
                }

                const isPasswordValid = await compare(credentials.password, user.password);
                console.log("Password valid:", isPasswordValid);

                if (!isPasswordValid) {
                    throw new Error("Invalid password");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    companyId: user.companyId
                };
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    cookies: {
        sessionToken: {
            name: `next-auth.session-token-v2`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production'
            }
        }
    },
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
                token.companyId = user.companyId;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (token) {
                session.user.role = token.role;
                session.user.id = token.id as string;
                session.user.companyId = token.companyId as string | null;
            }
            return session;
        }
    },
    pages: {
        signIn: "/auth/login", // Custom login page (we'll create later)
    }
};
