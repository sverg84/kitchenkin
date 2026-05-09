import type { UserProfileTabType } from "@/lib/auth/types";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserProfile } from "@/components/profile/user-profile";
import { PreloadQuery } from "@/lib/graphql/client/apollo-client-server-factory";
import { RECIPES_FOR_USER_QUERY } from "@/lib/graphql/queries/my-recipes";
import { FAVORITE_RECIPES_QUERY } from "@/lib/graphql/queries/favorite-recipes";

export default async function ProfilePage({
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
