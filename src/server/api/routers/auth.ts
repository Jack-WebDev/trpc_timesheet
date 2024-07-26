import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { User as PrismaUser } from "@prisma/client";
import bcryptjs from "bcryptjs";
import { deleteCookie } from "cookies-next";

export const authRouter = createTRPCRouter({
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
          ndtEmail: email,
        },
      });

      try {
        if (!userExists) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Email Not Found. Please Try Again.",
          });
        }

        if (userExists?.password) {
          const isPasswordValid = await bcryptjs.compare(
            password,
            userExists.password,
          );
          if (!isPasswordValid) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid Password! Try Again.",
            });
          }
        } else {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No Password Found ",
          });
        }

        const accessToken = jwt.sign(
          {
            userId: userExists.id,
            name: userExists.name,
            surname: userExists.surname,
            email: userExists.ndtEmail,
            role: userExists.role,
          },
          process.env.JWT_KEY!,
          {
            expiresIn: "1h",
          },
        );

        const refreshToken = jwt.sign(
          {
            userId: userExists.id,
          },
          process.env.REFRESH_KEY!,
          {
            expiresIn: "7d",
          },
        );

        await ctx.db.userSession.create({
          data: {
            userID: userExists.id,
            refreshToken: refreshToken,
          },
        });

        cookies().set("accessToken", accessToken, {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 1000,
        });

        cookies().set("refreshToken", refreshToken, {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 1000,
        });

        return { accessToken, refreshToken };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user session",
          cause: error,
        });
      }
    }),
  logout: publicProcedure.mutation(() => {
    deleteCookie("accessToken");
    deleteCookie("refreshToken");
    return { message: "Success" };
  }),
  refreshToken: publicProcedure
    .input(
      z.object({
        id: z.string(),
        refreshToken: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, refreshToken } = input;

      try {
        const user = await ctx.db.user.findUnique({
          where: {
            id: id,
          },
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User Not Found",
          });
        }

        const userSession = await ctx.db.userSession.findFirst({
          where: {
            userID: user.id,
            refreshToken: refreshToken,
          },
        });

        if (!userSession) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Invalid refresh token",
          });
        }

        type JwtPayload = {
          userID: string;
        };

        const decoded: JwtPayload = jwt.verify(
          refreshToken,
          process.env.REFRESH_KEY!,
        ) as JwtPayload;

        if (!decoded) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Invalid refresh token",
          });
        }

        const accessToken = jwt.sign(
          {
            userID: decoded.userID,
          },
          process.env.JWT_KEY!,
          {
            expiresIn: "15m",
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
      } catch (error) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid refresh token",
        });
      }
    }),
});
