// src/routes/pages/SignUp.page.jsx
import { useState } from "react";
import { Lock, User, Mail } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { register as apiRegister } from "@/api/auth";
import { useAuth } from "@/store/auth-context";

const schema = z.object({
  first_name: z.string().min(1, { message: "First name is required" }),
  last_name:  z.string().min(1, { message: "Last name is required" }),
  email:      z.string().email({ message: "Invalid email address" }),
  password:   z.string().min(6, { message: "Password must be at least 6 characters" }),
  password_confirm: z.string().min(6),
}).refine((d) => d.password === d.password_confirm, {
  message: "Passwords do not match",
  path: ["password_confirm"],
});

export default function SignUp() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [serverError, setServerError] = useState("");

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: "", last_name: "", email: "", password: "", password_confirm: "",
    },
  });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const res = await apiRegister(data);  // stores tokens in localStorage
      login(res.user);                      // updates auth context
      navigate("/app", { replace: true });
    } catch (err) {
      const errData = err?.data ?? {};
      const msg = Object.values(errData).flat().join(" ") || err.message || "Registration failed.";
      setServerError(msg);
    }
  };

  return (
    <section className="flex-grow flex items-center justify-center px-4 py-8 sm:py-16">
      <div className="w-full max-w-lg mx-auto bg-white/5 dark:bg-white/5 p-6 sm:p-8 rounded-xl border border-white/10 shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">Create an Account</h2>
          <p className="text-white/60 mt-2">Join EDUPlan and start your learning journey today.</p>
        </div>

        {serverError && (
          <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/40 px-4 py-3 text-sm text-red-300">
            {serverError}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

            {/* First name + Last name side by side */}
            <div className="flex gap-3">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="sr-only">First Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User size={18} className="absolute top-1/2 -translate-y-1/2 left-4 text-white/40" />
                        <Input placeholder="First Name" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="sr-only">Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail size={18} className="absolute top-1/2 -translate-y-1/2 left-4 text-white/40" />
                      <Input placeholder="Email Address" type="email" {...field} className="pl-10" />
                    </div>
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
                  <FormLabel className="sr-only">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock size={18} className="absolute top-1/2 -translate-y-1/2 left-4 text-white/40" />
                      <Input placeholder="Password" type="password" {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password_confirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock size={18} className="absolute top-1/2 -translate-y-1/2 left-4 text-white/40" />
                      <Input placeholder="Confirm Password" type="password" {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-center pt-2">
              <Button
                className="w-full sm:w-1/2 min-w-40"
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Creating account…" : "Create Account"}
              </Button>
            </div>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <span className="text-sm text-white/60">Already have an account? </span>
          <Link to="/auth/signin" className="font-semibold text-primary hover:underline text-sm">
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}
