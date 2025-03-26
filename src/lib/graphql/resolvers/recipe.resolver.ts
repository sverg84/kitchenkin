import {
  Resolver,
  Query,
  Arg,
  Ctx,
  Authorized,
  ID,
  FieldResolver,
  Root,
} from "type-graphql";
import { RecipeEntity } from "../entities/recipe";
import { prisma } from "@/lib/prisma";
import type { GraphQLContext } from "../context";

@Resolver(RecipeEntity)
export class RecipeResolver {
  @FieldResolver(() => ID)
  async authorId(@Root() recipe: RecipeEntity): Promise<string> {
    const { authorId } = await prisma.recipe.findUniqueOrThrow({
      where: { id: recipe.id },
      select: { authorId: true },
    });

    return authorId;
  }

  @FieldResolver(() => String)
  async authorName(@Root() recipe: RecipeEntity): Promise<string | null> {
    const {
      author: { name },
    } = await prisma.recipe.findUniqueOrThrow({
      where: { id: recipe.id },
      select: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    return name;
  }

  @Query(() => [RecipeEntity])
  async recipes() {
    return await prisma.recipe.findMany({
      include: {
        category: true,
        ingredients: true,
        image: true,
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
        image: true,
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
        image: true,
      },
    });
  }

  /**
   * Retrieve all Recipes authored by the acting user
   */
  @Authorized()
  @Query(() => [RecipeEntity])
  async myRecipes(@Ctx() { user }: GraphQLContext) {
    return await prisma.recipe.findMany({
      where: {
        authorId: user!.id,
      },
      include: {
        category: true,
        ingredients: true,
        image: true,
      },
    });
  }

  /**
   * Retrieve all Recipes that have been
   * marked as "Favorite" by the acting user
   */
  @Authorized()
  @Query(() => [RecipeEntity])
  async favoriteRecipes(@Ctx() { user }: GraphQLContext) {
    return await prisma.recipe.findMany({
      where: {
        favoritedBy: {
          some: { id: user!.id },
        },
      },
      include: {
        category: true,
        ingredients: true,
        image: true,
      },
    });
  }
}
