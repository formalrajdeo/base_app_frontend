"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { authApi } from "@/lib/auth-api";
import { z } from "zod";
import { getErrorMessage } from "@/utils/errors";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInResult = {
  twoFactorRedirect?: boolean;
  redirectUrl?: string;
  verified?: boolean;
};

export function SignInTab({
  openEmailVerificationTab,
  openForgotPassword,
}: {
  openEmailVerificationTab: (email: string) => void;
  openForgotPassword: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const signInMutation = useMutation({
    mutationFn: async (): Promise<SignInResult> => {
      signInSchema.parse(form); // validate
      const res = await authApi.post("/auth/sign-in/email", form);
      return res.data;
    },
    onSuccess: (data) => {
      if ((data as any).twoFactorRedirect) {
        router.push("/auth/2fa");
      } else {
        router.push("/");
      }
    },
    onError: (err: unknown) => {
      const message = getErrorMessage(err);
      if ((err as any)?.code === "EMAIL_NOT_VERIFIED") {
        openEmailVerificationTab(form.email);
      } else {
        toast.error(message);
      }
    },
  });

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      signInMutation.mutate();
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(getErrorMessage(err));
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  const isLoading = signInMutation.status === "pending";

  return (
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

      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={openForgotPassword}
          className="text-sm font-normal underline"
        >
          Forgot password?
        </Button>
      </div>

      <Button
        type="submit"
        className="w-full flex justify-center gap-2"
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="animate-spin h-5 w-5" />}
        {isLoading ? "Signing In..." : "Sign In"}
      </Button>
    </form>
  );
}