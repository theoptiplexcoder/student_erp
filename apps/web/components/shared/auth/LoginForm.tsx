"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, KeyRound, Smartphone, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button, Input, Label, Checkbox } from "@student-erp/ui";
import { AuthDivider } from "./AuthDivider";
import { SocialLoginButtons } from "./SocialLoginButtons";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "../../../src/lib/supabase/client";

type AuthMode = "password" | "magic-link" | "otp";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("password");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = createClient();

    try {
      if (mode === "password") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setError(error.message);
          setIsLoading(false);
          return;
        }

        router.push("/post-login");
        router.refresh();
      } else if (mode === "magic-link") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          },
        });

        if (error) {
          setError(error.message);
        } else {
          setError(null);
          alert("Check your email for the magic link.");
        }
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">
            {mode === "otp" ? "Phone Number or Email" : "Email Address"}
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-2.5 text-muted-foreground">
              {mode === "otp" ? <Smartphone className="size-4" /> : <Mail className="size-4" />}
            </div>
            <Input
              id="email"
              name="email"
              type={mode === "otp" ? "text" : "email"}
              placeholder={mode === "otp" ? "+1 (555) 000-0000" : "name@institution.edu"}
              className="pl-9 h-11"
              required
              autoComplete="username"
            />
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          {mode === "password" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a
                  href="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-2.5 text-muted-foreground">
                  <KeyRound className="size-4" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-9 pr-9 h-11"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {mode === "password" && (
          <div className="flex items-center space-x-2 pt-1 pb-2">
            <Checkbox id="remember" />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Remember this device
            </label>
          </div>
        )}

        <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 size-5 animate-spin" />
          ) : mode === "password" ? (
            "Sign In"
          ) : mode === "magic-link" ? (
            "Send Magic Link"
          ) : (
            "Send OTP"
          )}
          {!isLoading && mode !== "password" && <ArrowRight className="ml-2 size-4" />}
        </Button>
      </form>

      <div className="mt-4 flex flex-col gap-2">
        {mode !== "password" && (
          <Button variant="ghost" className="w-full h-10 text-muted-foreground" onClick={() => setMode("password")}>
            Sign in with Password
          </Button>
        )}
        {mode !== "magic-link" && (
          <Button variant="ghost" className="w-full h-10 text-muted-foreground" onClick={() => setMode("magic-link")}>
            Sign in with Magic Link
          </Button>
        )}
        {mode !== "otp" && (
          <Button variant="ghost" className="w-full h-10 text-muted-foreground" onClick={() => setMode("otp")}>
            Sign in with OTP
          </Button>
        )}
      </div>

      <AuthDivider />

      <SocialLoginButtons />

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Are you a prospective student?{" "}
        <a href="/signup" className="font-semibold text-primary hover:underline">
          Apply Now
        </a>
      </p>
    </div>
  );
}
