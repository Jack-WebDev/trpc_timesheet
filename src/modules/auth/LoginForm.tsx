"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { api, setToken } from "@/trpc/react";
import { getCookie, setCookie } from "cookies-next";
import { toast } from "react-toastify";
import { TRPCClientError } from "@trpc/client";
import { jwtDecode } from "jwt-decode";
import {useRouter } from "next/navigation";

type CustomJwtPayload = {
  id: string;
  email: string;
  role: string;
  isAdmin: boolean;
  isManager: boolean;
};

const formSchema = z.object({
  email: z
    .string()
    .toLowerCase()
    .email({ message: "Please add a valid email" })
    .refine((email) => email.endsWith("@ndt.co.za"), {
      message: "Email must be a valid NDT email",
    }),
  password: z.string(),
});

export function LoginForm() {
  const router =  useRouter()
  const loginMutation = api.auth.login.useMutation({
    onSuccess: ({ accessToken,refreshToken }) => {
      setCookie("accessToken", accessToken);
      setCookie("refreshToken", refreshToken);
      setToken(accessToken);
    },
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    loginMutation.mutate(
      {
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: () => {
          const token = getCookie("accessToken");
  
          if (token) {
            const user = jwtDecode<CustomJwtPayload>(token);
            console.log(user)

            if(user?.role === "Admin") {
              router.push("/dashboard/admin");
            } else if(user?.role === "Manager") {
              router.push("dashboard/manager");
            } else if(user?.role === "Employee") {
              router.push("/dashboard/employee");
            }
          } else {
            return null;
          }

        },
        onError: (error) => {
          if (error instanceof TRPCClientError) {
            toast.error(error.message); 
          } else {
            console.error("Unexpected error:", error);
            toast.error("An unexpected error occurred."); 
          }
        },
      },
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your email"
                  {...field}
                  className="rounded-xl hover:border-primary"
                  type="email"
                />
              </FormControl>
              <FormMessage style={{ color: "red" }} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your password"
                  {...field}
                  className="rounded-xl hover:border-primary"
                  type="password"
                />
              </FormControl>
              <FormMessage style={{ color: "red" }} />
            </FormItem>
          )}
        />
        <Link
          href={"/forgot-password"}
          className="relative left-[9.5rem] top-[5px] text-sm font-semibold text-primary"
        >
          Forgot Password?
        </Link>
        <Button type="submit" className="login_btn w-full hover:bg-primary">
          Let Me In
        </Button>
      </form>
    </Form>
  );
}
