"use client";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecipeCard } from "@/components/recipe-card";
import { Plus } from "lucide-react";
import { GqlRecipe } from "@/lib/generated/graphql";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { UserProfileTabType } from "@/lib/auth/types";
import { useRouter } from "nextjs-toploader/app";

interface UserProfileProps {
  activeTab: UserProfileTabType;
  user: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  recipes: GqlRecipe[];
  favorites: GqlRecipe[];
}

const MotionTabsList = motion.create(TabsList);
const MotionTabsTrigger = motion.create(TabsTrigger);

export function UserProfile({
  activeTab,
  user,
  recipes,
  favorites,
}: UserProfileProps) {
  const router = useRouter();
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const tabsListRef = useRef<HTMLDivElement | null>(null);
  const [tabStyles, setTabStyles] = useState({
    x: 0,
    width: 0,
    height: 28,
  });

  useEffect(() => {
    const updateTabStyles = () => {
      const activeTabElement = tabRefs.current[activeTab];
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
  }, [activeTab]);

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
        value={activeTab}
        onValueChange={(value) => {
          router.push(`/profile?tab=${value}`);
        }}
        className="w-full"
      >
        <MotionTabsList
          ref={tabsListRef}
          layout={true}
          className="relative grid w-full grid-cols-2 z-0"
        >
          <MotionTabsTrigger
            value="recipes"
            ref={(el) => {
              tabRefs.current["recipes"] = el;
            }}
          >
            My Recipes
          </MotionTabsTrigger>
          <MotionTabsTrigger
            value="favorites"
            ref={(el) => {
              tabRefs.current["favorites"] = el;
            }}
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
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Recipes</h2>
            <Button asChild>
              <Link href="/recipes/new">
                <Plus className="mr-2 size-4" />
                Create Recipe
              </Link>
            </Button>
          </div>

          {recipes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="mb-4 text-center text-muted-foreground">
                  You haven&apos;t created any recipes yet.
                </p>
                <Button asChild>
                  <Link href="/recipes/new">
                    <Plus className="mr-2 size-4" />
                    Create Your First Recipe
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recipes.map((recipe) => (
                <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
                  <RecipeCard recipe={recipe} />
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="favorites">
          <Card>
            <CardHeader>
              <CardTitle>Favorite Recipes</CardTitle>
              <CardDescription>
                Recipes you&apos;ve saved as favorites will appear here.
              </CardDescription>
            </CardHeader>
            {favorites.length === 0 ? (
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-center text-muted-foreground">
                  You haven&apos;t saved any favorites yet.
                </p>
              </CardContent>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {favorites.map((recipe) => (
                  <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
                    <RecipeCard recipe={recipe} />
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
