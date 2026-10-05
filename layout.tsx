import type { Metadata } from "next";
import { cookies } from "next/headers";
import LoginForm from "@/app/login-form";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduManage | School operations, made clear",
  description: "A focused student management workspace for modern schools.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  let authenticated = false;
  if (session) {
    try {
      const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } });
      authenticated = user?.role === session.role;
    } catch {
      authenticated = false;
    }
  }

  return <html lang="en"><body>{authenticated ? children : <LoginForm />}</body></html>;
}
