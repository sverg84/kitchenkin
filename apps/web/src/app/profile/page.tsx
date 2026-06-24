import type { UserProfileTabType } from "@/lib/auth/types";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserProfile } from "@/components/profile/user-profile";
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

  return (
    <div className="mx-auto px-4 py-8 max-w-7xl">
      <UserProfile activeTab={tab} user={session.user} />
    </div>
  );
}
