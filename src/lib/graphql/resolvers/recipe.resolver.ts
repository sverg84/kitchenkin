import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Ctx,
  Authorized,
  ID,
} from "type-graphql";
import { RecipeEntity } from "../entities/recipe";
import { CreateRecipeInput } from "../inputs/recipe-input";
import { prisma } from "@/lib/prisma";
import type { GraphQLContext } from "../context";

@Resolver(RecipeEntity)
export class RecipeResolver {
  @Query(() => [RecipeEntity])
  async recipes() {
    return await prisma.recipe.findMany({
      include: {
        category: true,
        ingredients: true,
      },
    });
  }

  @Query(() => RecipeEntity, { nullable: true })
  async recipe(@Arg("id", () => ID) id: string) {
    return await prisma.recipe.findUnique({
      where: { id },
      include: {
        category: true,
        ingredients: true,
      },
    });
  }

  @Query(() => [RecipeEntity])
  async searchRecipes(@Arg("query") query: string) {
    return await prisma.recipe.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        category: true,
        ingredients: true,
      },
    });
  }

  @Authorized()
  @Query(() => [RecipeEntity])
  async myRecipes(@Ctx() { user }: GraphQLContext) {
    if (!user?.id) {
      throw new Error("Not authenticated");
    }

    return await prisma.recipe.findMany({
      where: {
        userId: user.id,
      },
      include: {
        category: true,
        ingredients: true,
      },
    });
  }

  @Authorized()
  @Mutation(() => RecipeEntity)
  async createRecipe(
    @Arg("data", () => CreateRecipeInput) data: CreateRecipeInput,
    @Ctx() { user }: GraphQLContext
  ) {
    if (!user?.id) {
      throw new Error("Not authenticated");
    }

    const { ingredients, ...recipeData } = data;

    return await prisma.recipe.create({
      data: {
        ...recipeData,
        userId: user.id,
        ingredients: {
          create: ingredients,
        },
      },
      include: {
        category: true,
        ingredients: true,
      },
    });
  }

  @Authorized()
  @Mutation(() => RecipeEntity, { nullable: true })
  async deleteRecipe(@Arg("id") id: string, @Ctx() { user }: GraphQLContext) {
    if (!user?.id) {
      throw new Error("Not authenticated");
    }

    // Check if the recipe belongs to the user
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!recipe || recipe.userId !== user.id) {
      throw new Error("Not authorized to delete this recipe");
    }

    return await prisma.recipe.delete({
      where: { id },
      include: {
        category: true,
        ingredients: true,
      },
    });
  }
}
