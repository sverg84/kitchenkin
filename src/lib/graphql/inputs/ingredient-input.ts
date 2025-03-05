import { InputType, Field } from "type-graphql";

@InputType()
export class IngredientInput {
  @Field()
  name: string;

  @Field()
  amount: string;

  @Field({ nullable: true })
  unit?: string;
}
