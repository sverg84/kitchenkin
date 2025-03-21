"use client";

import { gql, useMutation } from "@apollo/client";
import { RecipeFormWrapper } from "./recipe-form-wrapper";
import type { GqlCreateRecipeInput } from "@/lib/generated/graphql";
import { useRouter } from "next/navigation";

const CREATE_RECIPE = gql`
  mutation CreateRecipe($data: GqlCreateRecipeInput!) {
    createRecipe(data: $data) {
      id
    }
  }
`;

type MutationResult = {
  createRecipe: { id: string };
};

type Props = Readonly<{
  categories: { id: string; name: string }[];
}>;

export function NewRecipeFormWrapper({ categories }: Props) {
  const router = useRouter();

  const [createRecipe, { error }] = useMutation<
    MutationResult,
    { data: GqlCreateRecipeInput }
  >(CREATE_RECIPE);

  const onSubmit = async (variables: unknown) => {
    const { data } = await createRecipe({
      variables: {
        data: variables as GqlCreateRecipeInput,
      },
    });

    router.push(`/recipe/${data!.createRecipe.id}`);
    router.refresh();
  };

  return (
    <RecipeFormWrapper
      categories={categories}
      formMode="create"
      mutationError={error}
      onSubmit={onSubmit}
    />
  );
}
