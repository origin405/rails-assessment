import { router, publicProcedure } from '../trpc';
import { z } from 'zod';

export const appRouter = router({
  hello: publicProcedure
    .input(z.string().nullish())
    .query(({ input }) => {
      return `Hello ${input ?? 'World'}`;
    }),
});

export type AppRouter = typeof appRouter;