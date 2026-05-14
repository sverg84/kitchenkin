import builder from "./builder";

builder.prismaNode("Ingredient", {
  id: { field: "id" },
  fields: (t) => ({
    name: t.exposeString("name", { nullable: false }),
    amount: t.exposeString("amount", { nullable: false }),
    unit: t.exposeString("unit", { nullable: false }),
  }),
});
