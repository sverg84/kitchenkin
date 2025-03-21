"use client";

import { gql, useMutation } from "@apollo/client";
import { RecipeFormWrapper } from "./recipe-form-wrapper";
import type { GqlUpdateRecipeInput } from "@/lib/generated/graphql";
import { useRouter } from "next/navigation";
import type { RecipeEntity } from "@/lib/graphql/entities/recipe";

const UPDATE_RECIPE = gql`
  mutation UpdateRecipe($data: GqlUpdateRecipeInput!) {
    updateRecipe(data: $data) {
      id
    }
  }
`;

type MutationResult = {
  updateRecipe: { id: string };
};

type Props = Readonly<{
  categories: { id: string; name: string }[];
  initialRecipe: RecipeEntity;
}>;

export function EditRecipeFormWrapper({ categories, initialRecipe }: Props) {
  const router = useRouter();

  const [createRecipe, { error }] = useMutation<
    MutationResult,
    { data: GqlUpdateRecipeInput }
  >(UPDATE_RECIPE);

  const onSubmit = async (variables: unknown) => {
    const { data } = await createRecipe({
      variables: {
        data: variables as GqlUpdateRecipeInput,
      },
    });

    router.push(`/recipe/${data!.updateRecipe.id}`);
    router.refresh();
  };

  return (
    <RecipeFormWrapper
      categories={categories}
      formMode="update"
      initialRecipe={initialRecipe}
      mutationError={error}
      onSubmit={onSubmit}
    />
  );
}
