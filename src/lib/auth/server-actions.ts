"use server";

import { signIn, signOut } from "@/auth";

export async function login(provider: string, data?: Record<string, unknown>) {
  await signIn(provider, { ...data, redirect: true, redirectTo: "/" });
}

export async function logout() {
  await signOut({ redirect: true, redirectTo: "/" });
}
