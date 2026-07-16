export const queryKeys = {
  recipes: {
    all: ["recipes"] as const,
    list: (params: { search?: string | null }) =>
      ["recipes", "list", params] as const,
    mine: (params: { first?: number } = {}) =>
      ["recipes", "mine", params] as const,
    favorites: (params: { first?: number } = {}) =>
      ["recipes", "favorites", params] as const,
    detail: (id: string) => ["recipes", "detail", id] as const,
  },
} as const;
