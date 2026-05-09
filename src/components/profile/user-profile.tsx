"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { UserProfileTabType } from "@/lib/auth/types";
import { useApolloClient } from "@apollo/client/react";
import { RECIPES_FOR_USER_QUERY } from "@/lib/graphql/queries/my-recipes";
import { FAVORITE_RECIPES_QUERY } from "@/lib/graphql/queries/favorite-recipes";
import ProfileFavorites from "./profile-favorites";
import ProfileRecipes from "./profile-recipes";

interface UserProfileProps {
  activeTab: UserProfileTabType;
  user: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const MotionTabsList = motion.create(TabsList);
const MotionTabsTrigger = motion.create(TabsTrigger);

export function UserProfile({ activeTab, user }: Readonly<UserProfileProps>) {
  // Refs
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const tabsListRef = useRef<HTMLDivElement | null>(null);

  // States
  const [tabStyles, setTabStyles] = useState({
    x: 0,
    width: 0,
    height: 28,
  });
  const [tab, setTab] = useState<UserProfileTabType>(activeTab);

  // Side Effects
  useEffect(() => {
    const updateTabStyles = () => {
      const activeTabElement = tabRefs.current[tab];
      if (activeTabElement) {
        setTabStyles({
          x: activeTabElement.offsetLeft,
          width: activeTabElement.offsetWidth,
          height: activeTabElement.offsetHeight,
        });
      }
    };

    // Initial tab style update
    updateTabStyles();

    // Set up ResizeObserver to handle resizing
    const resizeObserver = new ResizeObserver(updateTabStyles);
    if (tabsListRef.current) {
      resizeObserver.observe(tabsListRef.current); // Watch the Tabs.List for size changes
    }

    return () => {
      resizeObserver.disconnect(); // Clean up observer on unmount
    };
  }, [tab]);

  useEffect(() => {
    const handlePopState = () => {
      const url = new URL(window.location.href);
      const tabParam = url.searchParams.get("tab");
      setTab(tabParam === "favorites" ? "favorites" : "recipes");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const client = useApolloClient();

  // Memoized Functions
  const onMouseEnter = useCallback(
    async (tab: UserProfileTabType) => {
      if (tab === "recipes") {
        await client.query({
          query: RECIPES_FOR_USER_QUERY,
          variables: { first: 24 },
          fetchPolicy: "cache-first",
        });
      } else {
        await client.query({
          query: FAVORITE_RECIPES_QUERY,
          variables: { first: 24 },
          fetchPolicy: "cache-first",
        });
      }
    },
    [client]
  );

  const onValueChange = useCallback((value: string) => {
    setTab(value as UserProfileTabType);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", value);
    window.history.replaceState({}, "", url.toString());
  }, []);

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
        <Avatar className="size-24">
          <AvatarImage src={user.image || ""} alt={user.name || "User"} />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
        <div className="space-y-2 text-center sm:text-left">
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <Tabs
        defaultValue={activeTab}
        value={tab}
        onValueChange={onValueChange}
        className="w-full"
      >
        <MotionTabsList
          ref={tabsListRef}
          layout={true}
          className="relative grid w-full grid-cols-2 z-0"
        >
          <MotionTabsTrigger
            className="cursor-pointer"
            value="recipes"
            ref={(el) => {
              tabRefs.current["recipes"] = el;
            }}
            onMouseEnter={() => onMouseEnter("recipes")}
          >
            My Recipes
          </MotionTabsTrigger>
          <MotionTabsTrigger
            className="cursor-pointer"
            value="favorites"
            ref={(el) => {
              tabRefs.current["favorites"] = el;
            }}
            onMouseEnter={() => onMouseEnter("favorites")}
          >
            Favorites
          </MotionTabsTrigger>
          <motion.div
            className="absolute left-0 bg-background shadow-sm rounded-md -z-[1]"
            layoutId="active-indicator"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              left: tabStyles.x,
              width: tabStyles.width,
              height: tabStyles.height,
            }}
          />
        </MotionTabsList>
        <TabsContent value="recipes" className="space-y-4">
          <ProfileRecipes />
        </TabsContent>
        <TabsContent value="favorites" className="space-y-4">
          <ProfileFavorites />
        </TabsContent>
      </Tabs>
    </div>
  );
}
