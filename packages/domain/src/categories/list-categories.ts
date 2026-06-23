import "server-only";

import type { CategoryConnection } from "@kk/shared";
import { prisma } from "@kk/db";

export async function listCategories({
  first = 100,
  after,
}: {
  first?: number;
  after?: string | null;
} = {}): Promise<CategoryConnection> {
  const take = first;
  const categories = await prisma.category.findMany({
    take: take + 1,
    ...(after
      ? {
          cursor: { id: after },
          skip: 1,
        }
      : {}),
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const hasNextPage = categories.length > take;
  const sliced = hasNextPage ? categories.slice(0, take) : categories;

  return {
    exists: sliced.length > 0,
    pageInfo: {
      hasPreviousPage: Boolean(after),
      hasNextPage,
      startCursor: sliced[0]?.id ?? null,
      endCursor: sliced[sliced.length - 1]?.id ?? null,
    },
    edges: sliced.map((category) => ({
      cursor: category.id,
      node: category,
    })),
  };
}
