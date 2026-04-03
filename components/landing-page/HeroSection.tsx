// app/components/HeroSection.tsx
"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AnimatedAvatarGroup } from "./AnimatedAvatarGroup";
import { useSession } from "@/hooks/useSession";
import { useRouter } from "next/navigation";

interface HeroProps {
    session?: boolean;
}

export default function HeroSection() {
    const router = useRouter();
    const { data: sessionData, isLoading } = useSession();
    const isLoggedIn = !!sessionData?.session;

    const handleCTA = () => {
        if (isLoggedIn) {
            router.push('/dashboard')
        } else {
            router.push('/auth/login')
        }
    }

    return (
        <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 space-y-8 bg-linear-to-r from-indigo-600 via-purple-700 to-pink-600 text-white">
            <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-5xl font-extrabold max-w-3xl"
            >
                Modern Authentication APIs & UI Components for Developers
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="text-lg max-w-2xl mx-auto"
            >
                Secure, scalable, and easy-to-integrate authentication for your apps. Build faster, ship smarter.
            </motion.p>

            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.8, delay: 0.4 }}>
                <Button onClick={() => handleCTA()} size="lg">
                    {isLoggedIn ? "Go to Dashboard" : "Get Started"}
                </Button>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-12"
            >
                <AnimatedAvatarGroup />
            </motion.div>
        </section>
    );
}