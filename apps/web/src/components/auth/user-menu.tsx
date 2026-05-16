"use client";

import Link from "next/link";
import { useTransition } from "react";

import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Plus } from "lucide-react";
import { logout } from "@/lib/auth/server-actions";
import { Skeleton } from "@/components/ui/skeleton";

export function UserMenu() {
  const { data: session, isPending } = authClient.useSession();
  const [isSigningOut, startTransition] = useTransition();

  if (isPending) {
    return <Skeleton className="size-10 rounded-full" />;
  }

  if (!session?.user) {
    return (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" asChild={true}>
          <Link href="/login">Sign In</Link>
        </Button>
        <Button size="sm" asChild={true}>
          <Link href="/register">Sign Up</Link>
        </Button>
      </div>
    );
  }

  const user = session.user;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={true}>
        <Button variant="ghost" className="relative size-10 rounded-full">
          <Avatar className="size-10">
            <AvatarImage src={user?.image ?? ""} alt={user?.name ?? "User"} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild={true}>
          <Link
            href="/profile"
            className="flex w-full cursor-pointer items-center"
          >
            <User className="mr-2 size-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild={true}>
          <Link
            href="/recipe/new"
            className="flex w-full cursor-pointer items-center"
          >
            <Plus className="mr-2 size-4" />
            Create Recipe
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          disabled={isSigningOut}
          onClick={() =>
            startTransition(async () => {
              await logout();
            })
          }
        >
          <LogOut className="mr-2 size-4" />
          {isSigningOut ? "Signing out..." : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
