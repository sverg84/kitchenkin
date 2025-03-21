-- DropIndex
DROP INDEX "Recipe_id_authorId_key";

-- CreateIndex
CREATE INDEX "Recipe_authorId_idx" ON "Recipe"("authorId");
