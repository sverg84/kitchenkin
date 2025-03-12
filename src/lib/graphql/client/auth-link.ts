import { setContext } from "@apollo/client/link/context";
import type { Session } from "next-auth";

interface AuthSession extends Session {
  sessionToken: string;
}

const createAuthLink = (session: Session | null) =>
  setContext(async (_, { headers }) => {
    // Get the authentication token from the session
    console.log("apollo session", session);
    const token = session ? (session as AuthSession).sessionToken : null;

    // Return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        Authorization: token ? `Bearer ${token}` : "",
      },
    };
  });

export default createAuthLink;
