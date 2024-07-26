"use client";

import { api } from "@/trpc/react";
import { useState } from "react";
import { setToken } from "@/trpc/react";
import { deleteCookie, setCookie } from "cookies-next";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = api.post.login.useMutation({
    onSuccess: ({ accessToken }) => {
      setCookie("accessToken", accessToken);
      setToken(accessToken);
    },
  });

  const logoutMutation = api.post.logout.useMutation({
    onSuccess: () => {
      deleteCookie("accessToken");}
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await loginMutation.mutateAsync({
      email,
      password,
    });
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit">Login</button>
      </form>
        <button onClick={handleLogout}>Log out</button>
    </div>
  );
}
