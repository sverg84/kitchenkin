"use client";

import type React from "react";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { login } from "@/lib/auth/server-actions";
import OAuthSection from "./oauth-section";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "@/components/ui/form";

const PASSWORD_DESCRIPTION = "Password must be at least 8 characters long";

const zSchema = z.strictObject({
  name: z.string().trim().nonempty("Please enter your name"),
  email: z.string().trim().email("Please enter an email address"),
  password: z.string().trim().min(8, PASSWORD_DESCRIPTION),
});

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(zSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const { control, handleSubmit, getValues } = form;

  async function onSubmit() {
    setError(null);
    const formData = getValues();

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to register");
      }

      // Sign in the user after successful registration
      await login("credentials", formData);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message || "Something went wrong. Please try again.");
      }
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="John Doe"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" disabled={isLoading} />
                  </FormControl>
                  <p
                    aria-invalid={!!error}
                    className="text-sm text-muted-foreground aria-invalid:text-destructive-foreground"
                  >
                    {PASSWORD_DESCRIPTION}
                  </p>
                </FormItem>
              )}
            />
            {error && (
              <p className="text-sm text-destructive-foreground">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>

            <div className="flex items-center gap-2">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">OR</span>
              <Separator className="flex-1" />
            </div>

            <OAuthSection
              action="register"
              isLoading={isLoading}
              startTransition={startTransition}
            />
          </CardContent>
          <CardFooter className="flex justify-center border-t px-6 pt-4">
            <div className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
