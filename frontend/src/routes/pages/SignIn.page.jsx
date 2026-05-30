// src/routes/pages/SignIn.page.jsx
import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { login as apiLogin } from "@/api/auth";
import { useAuth } from "@/store/auth-context";

const schema = z.object({
  email:    z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export default function SignIn() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [serverError, setServerError] = useState("");

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const res = await apiLogin(data);   // stores tokens in localStorage
      login(res.user);                    // updates auth context
      navigate("/app", { replace: true });
    } catch (err) {
      setServerError(err?.data?.detail ?? err.message ?? "Sign in failed.");
    }
  };

  return (
    <section className="flex-grow flex items-center justify-center px-4 py-8 sm:py-16">
      <div className="w-full max-w-md mx-auto bg-white/5 dark:bg-white/5 p-6 sm:p-8 rounded-xl border border-white/10 shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">Sign In</h2>
          <p className="text-white/60 mt-2">Welcome back to EDUPlan. Let's get learning!</p>
        </div>

        {serverError && (
          <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/40 px-4 py-3 text-sm text-red-300">
            {serverError}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email Address" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
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
                    <Input placeholder="Password" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-right">
              <Link to="/auth/forget-password" className="text-sm text-primary hover:underline">
                Forgot Password?
              </Link>
            </div>

            <div className="text-center">
              <Button
                className="w-full sm:w-1/2 min-w-40"
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Signing in…" : "Sign In"}
              </Button>
            </div>
          </form>
        </Form>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-white/20" />
          <span className="mx-4 text-sm text-white/60">Don't have an account?</span>
          <div className="flex-grow border-t border-white/20" />
        </div>

        <div className="mt-6 text-center">
          <Link to="/auth/signup" className="font-semibold text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </section>
  );
}
