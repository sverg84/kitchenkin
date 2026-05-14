import builder from "./builder";

builder.prismaNode("Image", {
  id: { field: "id" },
  fields: (t) => ({
    src: t.exposeString("src"),
    recipe: t.relation("recipe"),
  }),
});
