import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { User as PrismaUser } from "@prisma/client";
import bcryptjs from "bcryptjs";
import { deleteCookie } from "cookies-next";

export const postRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(6),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { name, email, password } = input;
      const userExists: PrismaUser | null = await ctx.db.user.findUnique({
        where: {
          email: email,
        },
      });

      if (userExists) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User already exists",
        });
      }

      const hashedPassword = await bcryptjs.hash(password, 10);

      await ctx.db.user.create({
        data: {
          name: name,
          email: email,
          password: hashedPassword,
        },
      });

      return { message: "Success" };
    }),
  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;
      const userExists: PrismaUser | null = await ctx.db.user.findUnique({
        where: {
          email: email,
        },
      });

      if (!userExists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const isPasswordValid = await bcryptjs.compare(
        password,
        userExists?.password,
      );
      if (!isPasswordValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid password",
        });
      }

      const accessToken = jwt.sign(
        {
          userId: userExists.id,
          email: userExists.email,
        },
        process.env.JWT_KEY!,
        {
          expiresIn: "1h",
        },
      );

      cookies().set("accessToken", accessToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 1000,
      });

      return { accessToken };
    }),
  logout: publicProcedure.mutation(() => {
    deleteCookie("accessToken");
    return { message: "Success" };
  }),
});
