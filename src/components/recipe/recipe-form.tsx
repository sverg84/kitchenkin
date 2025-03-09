"use client";

import type React from "react";

import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { gql } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const CREATE_RECIPE = gql`
  mutation CreateRecipe($data: CreateRecipeInput!) {
    createRecipe(data: $data) {
      id
      title
    }
  }
`;

interface Category {
  id: string;
  name: string;
}

interface RecipeFormProps {
  categories: Category[];
}

const unitItems = {
  capacity: [
    { value: "cup", label: "cup(s)" },
    { value: "fl oz", label: "fluid ounce(s)" },
    { value: "L", label: "liter(s)" },
    { value: "mL", label: "milliliter(s)" },
    { value: "tbsp", label: "tablespoon(s)" },
    { value: "tsp", label: "teaspoon(s)" },
  ],
  mass: [
    { value: "g", label: "gram(s)" },
    { value: "kg", label: "kilogram(s)" },
    { value: "mg", label: "milligram(s)" },
    { value: "oz", label: "ounce(s)" },
    { value: "lb", label: "pound(s)" },
  ],
} as const;

const recipeTimePattern = /^\d+\s?(min|minutes)$/;

const zSchema = z.strictObject({
  title: z.string().trim().nonempty(),
  description: z.string().trim().nonempty(),
  prepTime: z.string().trim().regex(recipeTimePattern),
  cookTime: z.string().trim().regex(recipeTimePattern),
  servings: z.number().gt(0),
  categoryId: z.string().cuid(),
  instructions: z.array(z.string().trim().nonempty()),
  ingredients: z
    .strictObject({
      name: z.string().trim().nonempty(),
      amount: z
        .string()
        .trim()
        .regex(
          /^\d+\/\d+$|^\d+$/,
          "Amount must be a whole number or a fraction (e.g., '2' or '1/2')"
        ),
      unit: z.string().trim().nonempty("Please select a unit"),
    })
    .array(),
});

type RecipeFormData = z.infer<typeof zSchema>;

export function RecipeForm({ categories }: RecipeFormProps) {
  const router = useRouter();
  const [createRecipe, { loading, error: mutationError }] =
    useMutation(CREATE_RECIPE);

  const form = useForm<RecipeFormData>({
    resolver: zodResolver(zSchema),
    defaultValues: {
      title: "",
      description: "",
      prepTime: "",
      cookTime: "",
      servings: 0,
      instructions: [""],
      ingredients: [{ name: "", amount: "", unit: "" }],
    },
  });
  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
    watch,
  } = form;

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({ control, name: "ingredients" });

  const instructions = watch("instructions");

  const handleAddInstruction = () => {
    setValue("instructions", [...instructions, ""]);
  };

  const handleRemoveInstruction = (index: number) => {
    setValue(
      "instructions",
      instructions.filter((_, i) => i !== index)
    );
  };

  const onSubmit = async () => {
    try {
      const { data } = await createRecipe({
        variables: {
          data: getValues(),
        },
      });

      router.push(`/recipes/${data.createRecipe.id}`);
      router.refresh();
    } catch (err) {
      console.error("Error creating recipe:", err);
    }
  };

  console.log(errors);

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipe Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={control}
                  name="prepTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prep Time</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 15 min" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="cookTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cook Time</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 30 min" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="servings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Servings</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={control}
                name="categoryId"
                render={({ field, fieldState: { error } }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Select>
                        <SelectTrigger aria-invalid={!!error} {...field}>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Ingredients</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendIngredient({ name: "", amount: "", unit: "" })
                    }
                  >
                    <Plus className="mr-1 size-4" />
                    Add Ingredient
                  </Button>
                </div>

                {ingredientFields.map((ingredient, index) => (
                  <div key={ingredient.id} className="flex items-end gap-2">
                    <FormField
                      control={control}
                      name={`ingredients.${index}.amount`}
                      render={({ field }) => (
                        <FormItem className="grid flex-1 gap-1">
                          <FormLabel className="text-xs">Amount</FormLabel>
                          <FormControl>
                            <Input placeholder="2" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name={`ingredients.${index}.unit`}
                      render={({ fieldState: { error } }) => (
                        <FormItem className="grid flex-1 gap-1">
                          <FormLabel className="text-xs">Unit</FormLabel>
                          <FormControl>
                            <Combobox
                              buttonProps={{
                                "aria-invalid": !!error,
                                placeholder: "Select a unit",
                              }}
                              commandProps={{ placeholder: "Search units" }}
                              items={{ itemsGrouped: unitItems }}
                              onSelect={(value: string) => {
                                setValue(`ingredients.${index}.unit`, value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name={`ingredients.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="grid flex-[3] gap-1">
                          <FormLabel className="text-xs">Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Olive oil" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeIngredient(index)}
                      disabled={ingredientFields.length === 1}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Instructions</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddInstruction}
                  >
                    <Plus className="mr-1 size-4" />
                    Add Step
                  </Button>
                </div>

                {instructions.map((_, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="mt-2 flex size-6 items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {index + 1}
                    </div>

                    <Controller
                      control={control}
                      name={`instructions.${index}`}
                      render={({ field, fieldState: { error } }) => (
                        <div className="grid flex-1 gap-1">
                          <Textarea
                            aria-invalid={!!error}
                            placeholder={`Step ${index + 1}`}
                            rows={2}
                            {...field}
                          />
                          {error?.message && (
                            <p className="text-destructive-foreground text-sm">
                              {error.message}
                            </p>
                          )}
                        </div>
                      )}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveInstruction(index)}
                      disabled={instructions.length === 1}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {mutationError && (
              <p className="text-sm text-destructive-foreground">
                {mutationError.message ||
                  "An error occurred. Please try again."}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Recipe"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
