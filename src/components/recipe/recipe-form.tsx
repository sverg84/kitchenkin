"use client";

import type React from "react";

import { useRouter } from "next/navigation";
import { gql, useMutation } from "@apollo/client";
import { Controller, useFieldArray, useForm } from "react-hook-form";
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
import type { GqlCreateRecipeInput } from "@/lib/generated/graphql";
import { useTransition, useRef } from "react";

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
  servings: z.coerce.number().gt(0),
  categoryId: z.string().cuid(),
  instructions: z.array(z.string().trim().nonempty()),
  image: z.strictObject({
    encoded: z.string().base64().nonempty(),
    fileName: z.string().nonempty(),
    fileType: z.string().nonempty(),
  }),
  ingredients: z
    .strictObject({
      name: z.string().trim().nonempty(),
      amount: z
        .string()
        .trim()
        .regex(
          /^\d+(?: \d+\/\d+)?$|^\d+\/\d+$|^\d*(?:\.\d{1,2})?$/,
          "Amount must be a whole number, a fraction, a mixed number, or a decimal with up to 2 decimal points (e.g., '2' or '1/2')"
        ),
      unit: z.string().trim().nonempty("Please select a unit"),
    })
    .array(),
});

type RecipeFormData = z.infer<typeof zSchema>;

export function RecipeForm({ categories }: RecipeFormProps) {
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, startTransition] = useTransition();
  const [createRecipe, { error: mutationError }] = useMutation<
    MutationResult,
    { data: GqlCreateRecipeInput }
  >(CREATE_RECIPE);

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
  const { control, handleSubmit, getValues, setValue, watch } = form;

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

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imageFile = e.target.files?.item(0);
    if (!imageFile) {
      return;
    }
    const reader = new FileReader();

    reader.onloadend = () => {
      // Remove data prefix to get base64 string of image
      const imageEncoded = reader.result!.toString().split(",")[1];

      setValue("image.fileName", imageFile.name);
      setValue("image.fileType", imageFile.type);
      setValue("image.encoded", imageEncoded);
    };

    reader.readAsDataURL(imageFile);
  };

  const onSubmit = async () => {
    try {
      const { servings, ...values } = getValues();
      const { data } = await createRecipe({
        variables: {
          data: { ...values, servings: parseInt(String(servings), 10) },
        },
      });

      router.push(`/recipes/${data!.createRecipe.id}`);
      router.refresh();
    } catch (err) {
      console.error("Error creating recipe:", err);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form
            onSubmit={handleSubmit(() => {
              startTransition(async () => {
                await onSubmit();
              });
            })}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-3">
                <div className="col-2 flex flex-col justify-center gap-y-2">
                  <Label>Image</Label>
                  <Input
                    className="hidden"
                    ref={imageInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp,.heic,.heif"
                    onChange={handleImageFileChange}
                  />
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      imageInputRef?.current?.click();
                    }}
                  >
                    Choose File
                  </Button>
                  <span className="self-center">
                    {form.watch("image.fileName") || "No image selected"}
                  </span>
                </div>
              </div>

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
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger aria-invalid={!!error}>
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
