import type { UserProfileTabType } from "@/lib/auth/types";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserProfile } from "@/components/profile/user-profile";
import { PreloadQuery } from "@/lib/graphql/client/apollo-client-server-factory";
import { RECIPES_FOR_USER_QUERY, FAVORITE_RECIPES_QUERY } from "@kk/graphql";
import { Suspense } from "react";
import { ProfileFallback } from "@/components/suspense-fallbacks/profile-fallback";

export default function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  return (
    <Suspense fallback={<ProfileFallback />}>
      <ProfilePageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ProfilePageContent({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { tab: rawTab } = await searchParams;
  const tab: UserProfileTabType =
    rawTab === "favorites" ? "favorites" : "recipes";
  const variables = { first: 24 };

  return (
    <div className="mx-auto px-4 py-8 max-w-7xl">
      <PreloadQuery
        query={
          tab === "recipes" ? RECIPES_FOR_USER_QUERY : FAVORITE_RECIPES_QUERY
        }
        variables={variables}
      >
        <UserProfile activeTab={tab} user={session.user} />
      </PreloadQuery>
    </div>
  );
}
