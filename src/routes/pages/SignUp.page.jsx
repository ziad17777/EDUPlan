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
import { Link } from "react-router-dom"; // or your routing library

// 1. Define a more complete schema including name, role, grade
const signUpSchema = z.object({
  name: z.string().nonempty({ message: "Full name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export default function SignUp() {
  const form = useForm({
    resolver: zodResolver(signUpSchema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data) => {
    console.log("Sign up data:", data);
    // call your API / backend to register user
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Full Name</FormLabel>
                  <FormControl>
                    <div className="relative ">
                      <User
                        size={18}
                        className=" absolute top-1/2 bottom-1/2 my-auto left-4"
                      />
                      <Input
                        placeholder="Full Name"
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
                        className=" absolute top-1/2 bottom-1/2 my-auto left-4"
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
                        className=" absolute top-1/2 bottom-1/2 my-auto left-4"
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

            <Button
              className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
              type="submit"
            >
              Sign Up
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
