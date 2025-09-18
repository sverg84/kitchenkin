/*
  Warnings:

  - You are about to drop the column `large` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `medium` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `optimized` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `original` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `small` on the `Image` table. All the data in the column will be lost.
  - Added the required column `src` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Image" DROP COLUMN "large",
DROP COLUMN "medium",
DROP COLUMN "optimized",
DROP COLUMN "original",
DROP COLUMN "small",
ADD COLUMN     "src" TEXT NOT NULL;
