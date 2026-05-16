"use client";

import type { TransitionStartFunction } from "react";
import { FaGoogle } from "react-icons/fa6";

import { authClient } from "@/lib/auth/auth-client";

import OAuthButton from "./oauth-button";

type Props = Readonly<{
  /** @deprecated parity with old layout — Google-only OAuth for now */
  action: "login" | "register";
  isLoading: boolean;
  startTransition: TransitionStartFunction;
}>;

export default function OAuthSection({
  action,
  isLoading,
  startTransition,
}: Props) {
  const actionText = action === "register" ? "Sign up" : "Sign in";

  async function signInGoogle() {
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
    if (error) throw new Error(error.message ?? `${actionText} failed`);
  }

  return (
    <div className="flex flex-col gap-y-4 mb-6">
      <OAuthButton
        disabled={isLoading}
        label={`${actionText} with Google`}
        Icon={FaGoogle}
        onClick={() => {
          startTransition(async () => {
            await signInGoogle();
          });
        }}
      />
    </div>
  );
}
