"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@apollo/client"
import { gql } from "@apollo/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus } from "lucide-react"

const CREATE_RECIPE = gql`
  mutation CreateRecipe($data: CreateRecipeInput!) {
    createRecipe(data: $data) {
      id
      title
    }
  }
`

interface Category {
  id: string
  name: string
}

interface RecipeFormProps {
  categories: Category[]
}

export function RecipeForm({ categories }: RecipeFormProps) {
  const router = useRouter()
  const [createRecipe, { loading, error }] = useMutation(CREATE_RECIPE)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [prepTime, setPrepTime] = useState("")
  const [cookTime, setCookTime] = useState("")
  const [servings, setServings] = useState(4)
  const [categoryId, setCategoryId] = useState("")
  const [ingredients, setIngredients] = useState([{ name: "", amount: "", unit: "" }])
  const [instructions, setInstructions] = useState([""])

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: "", amount: "", unit: "" }])
  }

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const handleIngredientChange = (index: number, field: string, value: string) => {
    const newIngredients = [...ingredients]
    newIngredients[index] = { ...newIngredients[index], [field]: value }
    setIngredients(newIngredients)
  }

  const handleAddInstruction = () => {
    setInstructions([...instructions, ""])
  }

  const handleRemoveInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index))
  }

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...instructions]
    newInstructions[index] = value
    setInstructions(newInstructions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { data } = await createRecipe({
        variables: {
          data: {
            title,
            description,
            prepTime,
            cookTime,
            servings: Number.parseInt(servings.toString()),
            categoryId,
            ingredients: ingredients.filter((ing) => ing.name && ing.amount),
            instructions: instructions.filter((inst) => inst.trim() !== ""),
          },
        },
      })

      router.push(`/recipes/${data.createRecipe.id}`)
      router.refresh()
    } catch (err) {
      console.error("Error creating recipe:", err)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Recipe Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="prepTime">Prep Time</Label>
                <Input
                  id="prepTime"
                  placeholder="e.g. 15 min"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="cookTime">Cook Time</Label>
                <Input
                  id="cookTime"
                  placeholder="e.g. 30 min"
                  value={cookTime}
                  onChange={(e) => setCookTime(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="servings">Servings</Label>
                <Input
                  id="servings"
                  type="number"
                  min="1"
                  value={servings}
                  onChange={(e) => setServings(Number.parseInt(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger>
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
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Ingredients</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddIngredient}>
                  <Plus className="mr-1 size-4" />
                  Add Ingredient
                </Button>
              </div>

              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-end gap-2">
                  <div className="grid flex-1 gap-1">
                    <Label htmlFor={`amount-${index}`} className="text-xs">
                      Amount
                    </Label>
                    <Input
                      id={`amount-${index}`}
                      value={ingredient.amount}
                      onChange={(e) => handleIngredientChange(index, "amount", e.target.value)}
                      placeholder="2"
                    />
                  </div>

                  <div className="grid flex-1 gap-1">
                    <Label htmlFor={`unit-${index}`} className="text-xs">
                      Unit
                    </Label>
                    <Input
                      id={`unit-${index}`}
                      value={ingredient.unit}
                      onChange={(e) => handleIngredientChange(index, "unit", e.target.value)}
                      placeholder="tbsp"
                    />
                  </div>

                  <div className="grid flex-[3] gap-1">
                    <Label htmlFor={`name-${index}`} className="text-xs">
                      Name
                    </Label>
                    <Input
                      id={`name-${index}`}
                      value={ingredient.name}
                      onChange={(e) => handleIngredientChange(index, "name", e.target.value)}
                      placeholder="Olive oil"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveIngredient(index)}
                    disabled={ingredients.length === 1}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Instructions</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddInstruction}>
                  <Plus className="mr-1 size-4" />
                  Add Step
                </Button>
              </div>

              {instructions.map((instruction, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="mt-2 flex size-6 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {index + 1}
                  </div>

                  <div className="grid flex-1 gap-1">
                    <Textarea
                      value={instruction}
                      onChange={(e) => handleInstructionChange(index, e.target.value)}
                      placeholder={`Step ${index + 1}`}
                      rows={2}
                    />
                  </div>

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

          {error && (
            <div className="text-sm text-destructive">{error.message || "An error occurred. Please try again."}</div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Recipe"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

