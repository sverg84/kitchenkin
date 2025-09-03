import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserProfile } from "@/components/auth/user-profile";
import { UserProfileTabType } from "@/lib/auth/types";
import { getRecipesByUser } from "@/lib/graphql/server-fetch";
import { Recipe } from "@/lib/generated/graphql/graphql";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const params = await searchParams;
  const activeTab = params.tab as UserProfileTabType;

  const recipes = activeTab === "recipes" ? await getRecipesByUser() : [];
  const favorites: Recipe[] = activeTab === "favorites" ? [] : [];

  return (
    <div className="mx-auto px-4 py-8 max-w-7xl">
      <UserProfile
        activeTab={activeTab}
        user={session.user}
        recipes={recipes}
        favorites={favorites}
      />
    </div>
  );
}
