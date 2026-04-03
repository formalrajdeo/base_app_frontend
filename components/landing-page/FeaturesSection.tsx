// app/components/FeaturesSection.tsx
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const FEATURES = [
    { title: "Secure Auth", description: "End-to-end encryption and secure login flows." },
    { title: "Scalable API", description: "Handles thousands of users without breaking a sweat." },
    { title: "Prebuilt UI", description: "Beautiful, customizable components for your app." },
    { title: "Developer Friendly", description: "Well-documented SDKs and examples." },
];

export default function FeaturesSection() {
    return (
        <section className="py-24 px-6 bg-background dark:bg-background/90">
            <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {FEATURES.map((feature, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                    >
                        <Card className="p-6 text-center">
                            <CardHeader className="flex justify-center mb-4">
                                <Check className="h-8 w-8 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}