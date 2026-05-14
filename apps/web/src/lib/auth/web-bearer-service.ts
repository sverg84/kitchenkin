import { createWebBearerService } from "@kk/auth";

import { getRedis } from "@/lib/redis";

export const webBearer = createWebBearerService({ getRedis });
