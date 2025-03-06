"use server";

import { signIn, signOut } from "@/auth";

const redirectProps = {
  redirect: true,
  redirectTo: "/",
};

export async function login(provider: string, data?: Record<string, unknown>) {
  await signIn(provider, { ...data, ...redirectProps });
}

export async function logout() {
  await signOut(redirectProps);
}
