import { createProxySSGHelpers } from '@trpc/react-query/ssg';
import SuperJSON from 'superjson';
import { prisma } from '~/server/db';
import { appRouter } from '../api/root';

export const  generateSSGHelper = () => createProxySSGHelpers({
  router: appRouter,
  ctx: {
    prisma,
    currentUser: null,
  },
  transformer: SuperJSON,
});