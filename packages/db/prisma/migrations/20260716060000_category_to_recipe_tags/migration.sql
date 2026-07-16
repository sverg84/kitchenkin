-- CreateEnum
CREATE TYPE "RecipeTag" AS ENUM (
  'Weeknight',
  'OnePot',
  'Bake',
  'Grill',
  'Stovetop',
  'Soup',
  'Salad',
  'Breakfast',
  'Dessert',
  'Vegetarian',
  'Vegan',
  'HighProtein',
  'Pasta',
  'Seafood',
  'Chicken',
  'Beef',
  'Pork'
);

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN "tags" "RecipeTag"[] NOT NULL DEFAULT ARRAY[]::"RecipeTag"[];

-- DropForeignKey
ALTER TABLE "Recipe" DROP CONSTRAINT "Recipe_categoryId_fkey";

-- AlterTable
ALTER TABLE "Recipe" DROP COLUMN "categoryId";

-- DropTable
DROP TABLE "Category";
