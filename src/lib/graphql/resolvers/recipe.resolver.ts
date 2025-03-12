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
import type { Image } from "@prisma/client";

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
      },
    });
  }

  @Authorized()
  @Query(() => [RecipeEntity])
  async myRecipes(@Ctx() { user }: GraphQLContext) {
    return await prisma.recipe.findMany({
      where: {
        userId: user!.id,
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
    const { image: imageInput, ingredients, categoryId, ...recipeData } = data;

    const fileExtensions = [
      "image/jpg",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
    ];
    console.log(fileExtensions);
    const validFileExtensions = new Set(fileExtensions);

    let imageData: Image | undefined = undefined;
    if (imageInput) {
      if (!validFileExtensions.has(imageInput.fileType)) {
        throw new Error(
          `File must be an image of type: ${fileExtensions.join(", ")}`
        );
      }

      const imageResponse = await fetch(process.env.IMAGE_UPLOAD_ENDPOINT!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: imageInput.fileName,
          image: imageInput.encoded,
        }),
      });

      if (!imageResponse.ok) {
        const { error } = await imageResponse.json();
        throw new Error(error);
      }

      imageData = await imageResponse.json();
    }

    return await prisma.recipe.create({
      data: {
        ...recipeData,
        category: {
          connect: {
            id: categoryId,
          },
        },
        user: {
          connect: {
            id: user!.id,
          },
        },
        ingredients: {
          create: ingredients,
        },
        image: imageData
          ? {
              create: imageData,
            }
          : undefined,
      },
      include: {
        category: true,
        ingredients: true,
        image: true,
      },
    });
  }

  @Authorized()
  @Mutation(() => RecipeEntity, { nullable: true })
  async deleteRecipe(@Arg("id") id: string, @Ctx() { user }: GraphQLContext) {
    // Check if the recipe belongs to the user
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!recipe || recipe.userId !== user!.id) {
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
