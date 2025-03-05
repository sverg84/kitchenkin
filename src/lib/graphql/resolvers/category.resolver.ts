import { Resolver, Query, Arg } from "type-graphql";
import { CategoryEntity } from "../entities/category";
import { prisma } from "@/lib/prisma";

@Resolver(CategoryEntity)
export class CategoryResolver {
  @Query(() => [CategoryEntity])
  async categories() {
    return await prisma.category.findMany({
      include: {
        recipes: {
          include: {
            ingredients: true,
          },
        },
      },
    });
  }

  @Query(() => CategoryEntity, { nullable: true })
  async category(@Arg("id") id: string) {
    return await prisma.category.findUnique({
      where: { id },
      include: {
        recipes: {
          include: {
            ingredients: true,
          },
        },
      },
    });
  }
}
