import React from 'react';
import { Header } from '../../components/landing/Header';
import { Hero } from '../../components/landing/Hero';
import { MediaSection } from '../../components/landing/MediaSection';
import { FeatureShowcase } from '../../components/landing/FeatureShowcase';
import { PersonaSection } from '../../components/landing/PersonaSection';
import { SecuritySection } from '../../components/landing/SecuritySection';
import { Testimonials } from '../../components/landing/Testimonials';
import { FAQSection } from '../../components/landing/FAQSection';
import { FinalCTA } from '../../components/landing/FinalCTA';
import { Footer } from '../../components/landing/Footer';

export default function Home(): React.JSX.Element {
  return (
    <div className="bg-background text-foreground selection:bg-primary/20 selection:text-primary flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <MediaSection />
        <FeatureShowcase />
        <PersonaSection />
        <SecuritySection />
        <Testimonials />
        <FAQSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
