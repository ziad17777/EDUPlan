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
import { Loader2, Mail } from "lucide-react";
import { authedFetch } from "@/lib/api";

const API_BASE = (typeof window !== 'undefined' && window.EDUPLAN_API_BASE) || 'http://127.0.0.1:8000/api';

const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

export default function ForgetPassword() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`${API_BASE}/auth/password-reset/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });
      const resData = await res.json().catch(() => null);

      if (res.ok) {
        setSuccessMsg(resData?.message || "If this email exists, a reset link has been sent.");
        if (resData?.dev_token) {
          console.log("DEV TOKEN:", resData.dev_token);
        }
        // Redirect to rest-password page to enter the token
        setTimeout(() => {
          navigate('/auth/rest-password');
        }, 3000);
      } else {
        setServerError(resData?.email?.[0] || resData?.detail || "Invalid email format or failed to send.");
      }
    } catch (err) {
      setServerError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flex-grow flex items-center justify-center px-4 py-8 sm:py-16">
      <div className="w-full max-w-md mx-auto bg-white/5 dark:bg-white/5 p-6 sm:p-8 rounded-xl border border-white/10 dark:border-white/10 shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">Reset Password</h2>
          <p className="text-white/60 mt-2">
            Enter your email to receive a password reset link.
          </p>
        </div>

        {serverError && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {serverError}
          </div>
        )}
        
        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">
            {successMsg}
            <div className="mt-2 text-xs opacity-75">Redirecting...</div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail size={18} className="absolute top-1/2 bottom-1/2 my-auto left-4 text-white/50" />
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

            <Button className="w-full" type="submit" disabled={isLoading || successMsg}>
              {isLoading ? <><Loader2 className="animate-spin h-4 w-4 mr-2" /> Sending...</> : 'Send Reset Link'}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <Link to="/auth/signin" className="text-sm text-primary hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}
