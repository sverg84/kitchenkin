"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth as betterAuth } from "@kk/auth/next";

export async function logout() {
  await betterAuth.api.signOut({
    headers: await headers(),
  });
  redirect("/");
}
