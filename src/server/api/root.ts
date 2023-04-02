import { postRouter as post } from '~/server/api/routers/post';
import { userRouter as user } from '~/server/api/routers/user';
import { createTRPCRouter } from '~/server/api/trpc';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */

export const appRouter = createTRPCRouter({
  post,
  user
});

// export type definition of API
export type AppRouter = typeof appRouter;
