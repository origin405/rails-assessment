// src/server/routers/auth.ts

import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
// @ts-ignore
import { hash, compare } from 'bcrypt';
// @ts-ignore
import { sign } from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export const authRouter = router({
  register: publicProcedure
    .input(z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6),
    }))
    .mutation(async ({ input }) => {
      const { name, email, password } = input;

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User already exists with that email',
        });
      }

      const hashedPassword = await hash(password, 10);
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword },
      });

      const token = sign({ 
        userId: user.id, 
        name: user.name, 
        email: user.email 
      },  process.env.JWT_SECRET!, { expiresIn: '1d' });

      return { token };
    }),

  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { email, password } = input;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No user found with that email',
        });
      }

      const isPasswordValid = await compare(password, user.password);
      if (!isPasswordValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid password',
        });
      }

      const token = sign({ 
        userId: user.id, 
        name: user.name, 
        email: user.email 
      },  process.env.JWT_SECRET!, { expiresIn: '1d' });

      return {  token };
    }),
});