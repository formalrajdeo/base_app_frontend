"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { authApi } from "@/lib/auth-api";

import { z } from "zod";
import { getErrorMessage } from "@/utils/errors";

import { Eye, EyeOff, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const login = useMutation({
    mutationFn: async (): Promise<any> => {
      loginSchema.parse(form);
      return authApi.post("/auth/sign-in/email", form);
    },
    onSuccess: () => {
      toast.success("Welcome back 🎉");
      router.push("/dashboard");
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err));
    },
  });

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      loginSchema.parse(form);
      login.mutate();
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(getErrorMessage(err));
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  const isLoading = login.status === "pending"; // TypeScript-safe

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Sign In</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-primary transition"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <Button
              className="w-full flex items-center justify-center gap-2 cursor-pointer"
              type="submit"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="animate-spin h-5 w-5" />}
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}