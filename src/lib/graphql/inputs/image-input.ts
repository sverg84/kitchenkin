import { IsBase64, IsMimeType } from "class-validator";
import { InputType, Field } from "type-graphql";

@InputType("GqlImageInput")
export class ImageInput {
  @Field()
  fileName: string;

  @IsMimeType()
  @Field()
  fileType: string;

  @IsBase64()
  @Field()
  encoded: string;
}
