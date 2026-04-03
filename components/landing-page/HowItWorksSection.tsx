// app/components/HowItWorksSection.tsx
"use client";

import { motion } from "framer-motion";

const STEPS = [
    { step: 1, title: "Sign Up", description: "Create your developer account in seconds." },
    { step: 2, title: "Integrate SDK", description: "Add authentication to your app in minutes." },
    { step: 3, title: "Go Live", description: "Securely authenticate your users at scale." },
];

export default function HowItWorksSection() {
    return (
        <section className="py-24 px-6 bg-gray-50 dark:bg-gray-900 text-center">
            <h2 className="text-3xl font-bold mb-12">How It Works</h2>
            <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
                {STEPS.map((step, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: idx * 0.2 }}
                        className="p-6 border rounded-lg bg-white dark:bg-gray-800"
                    >
                        <div className="text-4xl font-bold text-primary mb-4">{step.step}</div>
                        <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}