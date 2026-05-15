import * as PothosCore from "@pothos/core";

type SchemaBuilderCtor = (typeof import("@pothos/core"))["default"];

/** Bind Pothos default export; Vercel tsc mis-types `import from "@pothos/core"` as the module namespace. */
export const SchemaBuilder = PothosCore.default as unknown as SchemaBuilderCtor;
