// app/components/TestimonialsSection.tsx
"use client";

import { motion } from "framer-motion";

const TESTIMONIALS = [
    { name: "Alice", quote: "SaaSPro made auth integration so easy!" },
    { name: "Bob", quote: "Our team ships faster thanks to prebuilt UI components." },
    { name: "Charlie", quote: "Highly scalable and secure for our production app." },
];

export default function TestimonialsSection() {
    return (
        <section className="py-24 px-6 bg-background text-center">
            <h2 className="text-3xl font-bold mb-12">What Our Users Say</h2>
            <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
                {TESTIMONIALS.map((t, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: idx * 0.2 }}
                        className="p-6 border rounded-lg bg-white dark:bg-gray-800"
                    >
                        <p className="text-sm italic mb-4">"{t.quote}"</p>
                        <span className="font-semibold">{t.name}</span>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}