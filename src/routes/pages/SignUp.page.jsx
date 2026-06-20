import { Lock, User, Mail } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { useAuth } from "@/store/auth";
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const signUpSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  passwordConfirm: z
    .string()
    .min(1, { message: "Please confirm your password" }),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Passwords don't match",
  path: ["passwordConfirm"],
});

export default function SignUp() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const form = useForm({
    resolver: zodResolver(signUpSchema),
    mode: "onSubmit",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const resp = await signup({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
      });
      if (resp.ok) {
        navigate('/app');
      } else {
        // handle field-level errors from backend
        const errors = resp.data;
        if (errors && typeof errors === 'object') {
          if (errors.email) form.setError('email', { message: Array.isArray(errors.email) ? errors.email[0] : errors.email });
          if (errors.password) form.setError('password', { message: Array.isArray(errors.password) ? errors.password[0] : errors.password });
          if (errors.first_name) form.setError('firstName', { message: Array.isArray(errors.first_name) ? errors.first_name[0] : errors.first_name });
          if (errors.last_name) form.setError('lastName', { message: Array.isArray(errors.last_name) ? errors.last_name[0] : errors.last_name });
          const generalMsg = errors.detail || errors.message || errors.non_field_errors?.[0];
          if (generalMsg) setServerError(generalMsg);
          else if (!errors.email && !errors.password && !errors.first_name && !errors.last_name) {
            setServerError('Sign up failed. Please check your details.');
          }
        } else {
          setServerError('Sign up failed. Please try again.');
        }
      }
    } catch {
      setServerError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flex-grow flex items-center justify-center px-4 py-8 sm:py-16">
      <div className="w-full max-w-lg mx-auto bg-white/5 dark:bg-white/5 p-6 sm:p-8 rounded-xl border border-white/10 dark:border-white/10 shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">Create an Account</h2>
          <p className="text-white/60 mt-2">
            Join eduplan and start your learning journey today.
          </p>
        </div>

        {serverError && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {serverError}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">First Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User
                          size={18}
                          className="absolute top-1/2 bottom-1/2 my-auto left-4"
                        />
                        <Input
                          placeholder="First Name"
                          type="text"
                          {...field}
                          className="pl-10 pr-4 py-3 rounded-lg"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Last Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User
                          size={18}
                          className="absolute top-1/2 bottom-1/2 my-auto left-4"
                        />
                        <Input
                          placeholder="Last Name"
                          type="text"
                          {...field}
                          className="pl-10 pr-4 py-3 rounded-lg"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute top-1/2 bottom-1/2 my-auto left-4"
                      />
                      <Input
                        placeholder="Email Address"
                        type="email"
                        {...field}
                        className="pl-10 pr-4 py-3 rounded-lg"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock
                        size={18}
                        className="absolute top-1/2 bottom-1/2 my-auto left-4"
                      />
                      <Input
                        placeholder="Password"
                        type="password"
                        {...field}
                        className="pl-10 pr-4 py-3 rounded-lg"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="passwordConfirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock
                        size={18}
                        className="absolute top-1/2 bottom-1/2 my-auto left-4"
                      />
                      <Input
                        placeholder="Confirm Password"
                        type="password"
                        {...field}
                        className="pl-10 pr-4 py-3 rounded-lg"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" /> Creating...
                </span>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>
        </Form>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-white/20" />
          <span className="mx-4 text-sm text-white/60">
            Already have an account?
          </span>
          <div className="flex-grow border-t border-white/20" />
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/auth/signin"
            className="font-semibold text-primary hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}
