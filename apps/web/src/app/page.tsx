import React from "react";
import { Header } from "../../components/landing/Header";
import { Hero } from "../../components/landing/Hero";
import { MediaSection } from "../../components/landing/MediaSection";
import { FeatureShowcase } from "../../components/landing/FeatureShowcase";
import { Testimonials } from "../../components/landing/Testimonials";
import { FAQSection } from "../../components/landing/FAQSection";
import { FinalCTA } from "../../components/landing/FinalCTA";
import { Footer } from "../../components/landing/Footer";

export default function Home(): React.JSX.Element {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Header />
      <Hero />
      <MediaSection />
      <FeatureShowcase />
      <Testimonials />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}
