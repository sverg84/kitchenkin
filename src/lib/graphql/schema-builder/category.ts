import { prisma } from "@/lib/prisma";
import builder from "./builder";

builder.prismaNode("Category", {
  id: { field: "id" },
  fields: (t) => ({
    name: t.exposeString("name", { nullable: false }),
    rawId: t.exposeID("id", {
      description: "Raw database ID",
      nullable: false,
    }),
  }),
});

builder.queryField("categories", (t) =>
  t.prismaConnection({
    type: "Category",
    cursor: "id",
    authScopes: { public: true },
    nullable: false,
    edgesNullable: false,
    nodeNullable: false,
    resolve: (query) => prisma.category.findMany({ ...query }),
  })
);
