import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserProfile } from "@/components/auth/user-profile";
import { getRecipesByUser } from "@/lib/graphql/server-fetch";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const recipes = await getRecipesByUser();

  return (
    <div className="mx-auto px-4 py-8 max-w-7xl">
      <UserProfile user={session.user} recipes={recipes} />
    </div>
  );
}
