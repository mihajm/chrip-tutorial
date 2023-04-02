
import type { User } from '@clerk/nextjs/dist/api';
import { clerkClient } from '@clerk/nextjs/server';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, privateProcedure, publicProcedure } from '~/server/api/trpc';
import { prisma } from '~/server/db';

const limit = 100;

const filterUserForClient = (
  {id, username, profileImageUrl}: User
) =>({
  id,
  username,
  profileImageUrl
});


const getUsersForClient = (ids: string[]) =>  clerkClient.users.getUserList({
  userId: ids,
  limit
}).then((users) => users.map(filterUserForClient));


export const postRouter = createTRPCRouter({
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      const posts = await ctx.prisma.post.findMany({
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      });

      const users = await getUsersForClient(posts.map(({authorId}) => authorId));

      return posts.map(({authorId, ...rest} ) => {

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

      });
    }),

  create: privateProcedure
    .input(
      z.object({
        content: z.string().min(1).max(144)
      })
    )
    .mutation(({ctx: {currentUser}, input: {content}}) => {

      return prisma.post.create({
        data: {
          content,
          authorId: currentUser,
        }
      });

    })
});
