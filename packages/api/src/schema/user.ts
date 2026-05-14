import builder from "./builder";

builder.prismaNode("User", {
  id: { field: "id" },
  fields: (t) => ({
    name: t.exposeString("name"),
    rawId: t.exposeID("id", {
      description: "Raw database ID",
      nullable: false,
    }),
  }),
});
