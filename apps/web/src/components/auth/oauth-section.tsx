"use client";

import type { TransitionStartFunction } from "react";
import { FaGoogle, FaReddit } from "react-icons/fa6";

import { authClient } from "@/lib/auth/auth-client";

import OAuthButton from "./oauth-button";

type SocialProvider = "google" | "reddit";

type Props = Readonly<{
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

  async function signInWith(provider: SocialProvider) {
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: "/",
    });
    if (error) throw new Error(error.message ?? `${actionText} failed`);
  }

  function handleSocial(provider: SocialProvider) {
    startTransition(async () => {
      await signInWith(provider);
    });
  }

  return (
    <div className="flex flex-col gap-y-4 mb-6">
      <OAuthButton
        disabled={isLoading}
        label={`${actionText} with Google`}
        Icon={FaGoogle}
        onClick={() => handleSocial("google")}
      />
      <OAuthButton
        disabled={isLoading}
        label={`${actionText} with Reddit`}
        Icon={FaReddit}
        onClick={() => handleSocial("reddit")}
      />
    </div>
  );
}
