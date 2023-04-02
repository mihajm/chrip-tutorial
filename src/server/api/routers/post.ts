
import { clerkClient } from '@clerk/nextjs/server';
import { type Post } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { z } from 'zod';
import { createTRPCRouter, privateProcedure, publicProcedure } from '~/server/api/trpc';
import { filterUserForClient } from '~/server/helpers/filter-user-for-client';

const limit = 100;

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, '1 m'),
  analytics: true,
});

const getUsersForClient = (ids: string[]) =>  clerkClient.users.getUserList({
  userId: ids,
  limit
}).then((users) => users.map(filterUserForClient));

const addUserData = ({authorId, ...rest}: Post, users: Awaited<ReturnType<typeof getUsersForClient>>) => {
  const author = users.find((u) => u.id === authorId);

  if (!author?.username) throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Author not found'
  });


  return {
    ...rest,
    author: {
      ...author,
      username: author.username
    },
  };
};

const addUserDataToPosts = async (posts: Post[]) => {
  const users = await getUsersForClient(posts.map(({authorId}) => authorId));

  return posts.map((post) => addUserData(post, users));
};


export const postRouter = createTRPCRouter({
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      const posts = await ctx.prisma.post.findMany({
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      });

      return addUserDataToPosts(posts);
    }),
  getOne: publicProcedure
    .input(
      z.string()
    )
    .query(async ({ctx: {prisma}, input}) => {
      const post = await prisma.post.findUnique({
        where: {
          id: input
        }
      });

      if (!post) throw new TRPCError({
        code: 'NOT_FOUND',
      });
      

      return addUserData(post, await getUsersForClient([post.authorId]));
    }),
  
  getPostsForUser: publicProcedure
    .input(
      z.object({
        authorId: z.string()
      })
    )
    .query(async ({ctx: {prisma}, input: {authorId}}) => {
      
      const posts = await prisma.post.findMany({
        where: {
          authorId
        },
      });

  
      return addUserDataToPosts(posts);
    }),
  create: privateProcedure
    .input(
      z.object({
        content: z.string().min(1).max(144)
      })
    )
    .mutation(async ({ctx: {currentUser, prisma}, input: {content}}) => {

      const {success} = await ratelimit.limit(currentUser);

      if (!success) throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: 'You are posting too fast'
      });

      return prisma.post.create({
        data: {
          content,
          authorId: currentUser,
        }
      });

    })
});
