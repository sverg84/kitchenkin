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

interface UserProfileProps {
  user: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  recipes: GqlRecipe[];
}

export function UserProfile({ user, recipes }: UserProfileProps) {
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

      <Tabs defaultValue="recipes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recipes">My Recipes</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>
        <TabsContent value="recipes" className="space-y-4">
          <div className="flex justify-between">
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
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-center text-muted-foreground">
                You haven&apos;t saved any favorites yet.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
