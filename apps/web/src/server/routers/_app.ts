// src/server/routers/_app.ts

import { router } from '../trpc';
import { authRouter } from './auth';

export const appRouter = router({
  auth: authRouter,
  // Add other routers here as needed
});

export type AppRouter = typeof appRouter;