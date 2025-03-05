export interface GraphQLContext {
  user?: {
    id: string
    email?: string | null
    name?: string | null
  } | null
}

