import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/store/auth";

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export default function SignIn() {
  const { signin } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const form = useForm({
    resolver: zodResolver(signInSchema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const resp = await signin({ email: data.email, password: data.password });
      if (resp.ok) {
        navigate('/app');
      } else {
        const msg = resp.data?.detail || resp.data?.message || resp.data?.error || 'Invalid email or password';
        setServerError(msg);
      }
    } catch (err) {
      console.error('Sign in error', err);
      setServerError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flex-grow flex items-center justify-center px-4 py-8 sm:py-16">
      <div className="w-full max-w-md mx-auto bg-white/5 dark:bg-white/5 p-6 sm:p-8 rounded-xl border border-white/10 dark:border-white/10 shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">Sign In</h2>
          <p className="text-white/60 mt-2">
            Welcome back to eduplan. Let's get learning!
          </p>
        </div>

        {serverError && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
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
                    <Input
                      placeholder="Email Address"
                      type="email"
                      {...field}
                      className="pl-10"
                    />
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
                    <Input
                      placeholder="Password"
                      type="password"
                      {...field}
                      className="pl-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-right">
              <Link
                to="/auth/forget-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <div className="text-center">
              <Button className="w-full sm:w-1/2 min-w-40" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" /> Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </div>
          </form>
        </Form>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-white/20" />
          <span className="mx-4 text-sm text-white/60">
            Don't have an account?
          </span>
          <div className="flex-grow border-t border-white/20" />
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/auth/signup"
            className="font-semibold text-primary hover:underline"
          >
            Sign up
          </Link>
        </div>
      </div>
    </section>
  );
}
