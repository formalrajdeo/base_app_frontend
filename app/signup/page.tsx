"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { authApi } from "@/lib/auth-api";

export default function SignupPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const signup = useMutation({
        mutationFn: async () => {
            return authApi.post("/auth/sign-up/email", form);
        },
        onSuccess: () => {
            toast.success("Account created 🚀");
            router.push("/dashboard");
        },
        onError: (err: any) => {
            toast.error(
                err?.response?.data?.message || "Signup failed ❌"
            );
        },
    });

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">
                        Sign Up
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    <Input
                        placeholder="Name"
                        value={form.name}
                        onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                        }
                    />

                    <Input
                        placeholder="Email"
                        value={form.email}
                        onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                        }
                    />

                    <Input
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={(e) =>
                            setForm({ ...form, password: e.target.value })
                        }
                    />

                    <Button
                        className="w-full"
                        onClick={() => signup.mutate()}
                        disabled={signup.isPending}
                    >
                        {signup.isPending ? "Creating account..." : "Sign Up"}
                    </Button>

                    <p className="text-sm text-center text-muted-foreground">
                        Already have an account?{" "}
                        <Link
                            href="/"
                            className="text-primary underline"
                        >
                            Sign in
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}