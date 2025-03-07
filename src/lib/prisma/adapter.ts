import { PrismaAdapter } from "@auth/prisma-adapter";
import { type Adapter } from "next-auth/adapters";
import { prisma } from ".";
import { redis } from "../redis";

const adapter = PrismaAdapter(prisma);

// Set expiration time to 30 minutes
const secondsToken = "EX";
const seconds = 60 * 30;

function getRedisKey(sessionToken: string) {
  return `session:${sessionToken}`;
}

const CustomPrismaAdapter: Adapter = {
  ...adapter,

  async deleteSession(sessionToken) {
    await Promise.all([
      redis.del(getRedisKey(sessionToken)),
      adapter.deleteSession!(sessionToken),
    ]);
  },

  async updateSession(session) {
    const updatedSession = await adapter.updateSession!(session);

    if (updatedSession) {
      await redis.set(
        getRedisKey(session.sessionToken),
        JSON.stringify(updatedSession),
        secondsToken,
        seconds
      );
    }
    return updatedSession;
  },

  async getSessionAndUser(sessionToken) {
    const redisKey = getRedisKey(sessionToken);

    const cachedSession = await redis.get(redisKey);
    if (cachedSession) {
      return JSON.parse(cachedSession);
    }

    const sessionAndUser = await adapter.getSessionAndUser!(sessionToken);

    if (sessionAndUser) {
      await redis.set(
        redisKey,
        JSON.stringify(sessionAndUser),
        secondsToken,
        seconds
      );
    }

    return sessionAndUser;
  },
};

export default CustomPrismaAdapter;
