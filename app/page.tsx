// app/page.tsx
import FeaturesSection from "@/components/landing-page/FeaturesSection";
import HeroSection from "@/components/landing-page/HeroSection";
import HowItWorksSection from "@/components/landing-page/HowItWorksSection";
import { LandingHeader } from "@/components/landing-page/LandingHeader";
import PricingSection from "@/components/landing-page/PricingSection";
import TestimonialsSection from "@/components/landing-page/TestimonialsSection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SaaSPro - Modern Auth for Developers",
  description: "Secure, scalable, and easy-to-integrate authentication for your apps.",
  openGraph: {
    title: "SaaSPro - Modern Auth for Developers",
    description: "Secure, scalable, and easy-to-integrate authentication for your apps.",
    url: "https://yourdomain.com",
  },
};

export default async function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      <LandingHeader />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
    </div>
  );
}