// src/server/routers/_app.ts

import { router } from '../trpc';
import { authRouter } from './auth';
import { boardRouter } from './board';

export const appRouter = router({
  auth: authRouter,
  board: boardRouter,
});

export type AppRouter = typeof appRouter;