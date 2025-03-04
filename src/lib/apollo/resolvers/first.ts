import { Query, Resolver } from "type-graphql";

@Resolver()
export default class FirstResolver {
  @Query(() => String)
  helloWorld() {
    return "Hello World!";
  }
}
