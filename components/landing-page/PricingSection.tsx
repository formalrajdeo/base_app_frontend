// app/components/PricingSection.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface PricingProps {
    session?: boolean;
}

const PLANS = [
    { name: "Starter", price: "$0", features: ["Basic Auth", "100 Users"] },
    { name: "Pro", price: "$29/mo", features: ["All Starter Features", "Unlimited Users", "Premium Support"] },
    { name: "Enterprise", price: "Contact Us", features: ["Custom Integrations", "Dedicated Support"] },
];

export default function PricingSection() {
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
        <section className="py-24 px-6 bg-gray-50 dark:bg-gray-900 text-center">
            <h2 className="text-3xl font-bold mb-12">Pricing</h2>
            <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
                {PLANS.map((plan, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: idx * 0.2 }}
                        className="p-6 border rounded-lg bg-white dark:bg-gray-800 flex flex-col justify-between"
                    >
                        <h3 className="text-xl font-semibold mb-4">{plan.name}</h3>
                        <p className="text-3xl font-bold mb-4">{plan.price}</p>
                        <ul className="text-sm text-muted-foreground mb-6">
                            {plan.features.map((f, i) => (
                                <li key={i}>• {f}</li>
                            ))}
                        </ul>
                        <Button onClick={() => handleCTA()} variant="default">
                            {isLoggedIn ? "Go to Dashboard" : "Get Started"}
                        </Button>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}