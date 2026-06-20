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
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Loader2, Key, Lock } from "lucide-react";

const API_BASE = (typeof window !== 'undefined' && window.EDUPLAN_API_BASE) || 'http://127.0.0.1:8000/api';

const schema = z.object({
  token: z.string().min(1, { message: "Token is required" }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
  newPasswordConfirm: z.string().min(1, { message: "Please confirm your password" }),
}).refine((data) => data.newPassword === data.newPasswordConfirm, {
  message: "Passwords don't match",
  path: ["newPasswordConfirm"],
});

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      token: searchParams.get("token") || "",
      newPassword: "",
      newPasswordConfirm: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError(null);
    
    try {
      const res = await fetch(`${API_BASE}/auth/password-reset/confirm/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: data.token,
          new_password: data.newPassword,
          new_password_confirm: data.newPasswordConfirm,
        }),
      });
      const resData = await res.json().catch(() => null);

      if (res.ok) {
        setSuccessMsg("Password reset successfully!");
        setTimeout(() => {
          navigate('/auth/signin');
        }, 2000);
      } else {
        setServerError(resData?.token?.[0] || resData?.non_field_errors?.[0] || resData?.detail || "Invalid token or validation error.");
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
          <h2 className="text-3xl font-bold text-white">Set New Password</h2>
          <p className="text-white/60 mt-2">
            Enter your reset token and your new password.
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
            <div className="mt-2 text-xs opacity-75">Redirecting to sign in...</div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Reset Token</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Key size={18} className="absolute top-1/2 bottom-1/2 my-auto left-4 text-white/50" />
                      <Input
                        placeholder="Reset Token"
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
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock size={18} className="absolute top-1/2 bottom-1/2 my-auto left-4 text-white/50" />
                      <Input
                        type="password"
                        placeholder="New Password"
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
              name="newPasswordConfirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Confirm New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock size={18} className="absolute top-1/2 bottom-1/2 my-auto left-4 text-white/50" />
                      <Input
                        type="password"
                        placeholder="Confirm New Password"
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
              {isLoading ? <><Loader2 className="animate-spin h-4 w-4 mr-2" /> Resetting...</> : 'Reset Password'}
            </Button>
          </form>
        </Form>
      </div>
    </section>
  );
}
