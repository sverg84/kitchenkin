import { IsUrl, IsUUID } from "class-validator";
import { Field, ID, ObjectType } from "type-graphql";

@ObjectType("GqlImage")
export class ImageEntity {
  @IsUUID()
  @Field(() => ID)
  id: string;

  @IsUrl()
  @Field()
  original: string;

  @IsUrl()
  @Field()
  optimized: string;

  @IsUrl()
  @Field()
  small: string;

  @IsUrl()
  @Field()
  medium: string;

  @IsUrl()
  @Field()
  large: string;
}
