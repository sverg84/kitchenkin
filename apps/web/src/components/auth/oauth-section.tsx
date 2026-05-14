import type { AuthActionType } from "@/lib/auth/types";
import type { TransitionStartFunction } from "react";
import { login } from "@/lib/auth/server-actions";
import { FaGoogle, FaReddit } from "react-icons/fa6";
import OAuthButton from "./oauth-button";

type Props = Readonly<{
  action: AuthActionType;
  isLoading: boolean;
  startTransition: TransitionStartFunction;
}>;

export default function OAuthSection({
  action,
  isLoading,
  startTransition,
}: Props) {
  const actionText = action === "register" ? "Sign up" : "Sign in";
  return (
    <div className="flex flex-col gap-y-4 mb-6">
      <OAuthButton
        disabled={isLoading}
        label={`${actionText} with Google`}
        Icon={FaGoogle}
        onClick={() => {
          startTransition(async () => {
            await login("google");
          });
        }}
      />
      <OAuthButton
        disabled={isLoading}
        label={`${actionText} with Reddit`}
        Icon={FaReddit}
        onClick={() => {
          startTransition(async () => {
            await login("reddit");
          });
        }}
      />
    </div>
  );
}
