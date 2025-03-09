"use client";

import type React from "react";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { login } from "@/lib/auth/server-actions";
import OAuthSection from "./oauth-section";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const zSchema = z.strictObject({
  email: z.string().trim().email("Please enter an email address"),
  password: z
    .string()
    .trim()
    .min(8, "Password must have at least 8 characters"),
});

export function LoginForm() {
  const [isLoading, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(zSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { control, handleSubmit, getValues } = form;

  async function onSubmit() {
    setError(null);

    try {
      await login("credentials", getValues());
    } catch {
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <Card>
      <Form {...form}>
        <form
          onSubmit={handleSubmit(() => {
            startTransition(async () => {
              await onSubmit();
            });
          })}
        >
          <CardContent className="flex flex-col gap-y-4 pt-6">
            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="name@example.com"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-primary underline-offset-4 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <Input {...field} type="password" disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && (
              <p className="text-sm text-destructive-foreground">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="flex items-center gap-2">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">OR</span>
              <Separator className="flex-1" />
            </div>
            <OAuthSection
              action="login"
              isLoading={isLoading}
              startTransition={startTransition}
            />
          </CardContent>
          <CardFooter className="flex justify-center border-t px-6 pt-4">
            <div className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-primary underline-offset-4 hover:underline"
              >
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
