// @ts-nocheck
"use client";

import React, { useState } from "react";
import { Check, X } from "lucide-react";
import { Button, Card, CardContent } from "@student-erp/ui";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Starter",
    description: "Perfect for small training centers and bootcamps.",
    price: { monthly: 299, yearly: 249 },
    features: [
      "Up to 500 Students",
      "Basic Reporting",
      "Email Support",
      "Standard Integrations",
      "Community Access",
    ],
    missingFeatures: ["Custom Workflows", "API Access", "Dedicated Success Manager"],
    recommended: false,
  },
  {
    name: "Growth",
    description: "For growing K-12 schools and colleges.",
    price: { monthly: 599, yearly: 499 },
    features: [
      "Up to 5,000 Students",
      "Advanced Analytics",
      "Priority 24/7 Support",
      "Premium Integrations",
      "Custom Workflows",
      "API Access",
    ],
    missingFeatures: ["Dedicated Success Manager"],
    recommended: true,
  },
  {
    name: "Enterprise",
    description: "Full-scale solution for universities and large districts.",
    price: { monthly: "Custom", yearly: "Custom" },
    features: [
      "Unlimited Students",
      "Custom BI Dashboards",
      "Dedicated Success Manager",
      "On-premise Deployment Option",
      "White-labeling",
      "SLA Guarantees",
    ],
    missingFeatures: [],
    recommended: false,
  },
];

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <section className="py-24 bg-background relative overflow-hidden" id="pricing">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Simple, Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Choose the plan that fits your institution's size and needs. No hidden fees.
          </p>
          
          <div className="inline-flex items-center p-1 bg-card border border-border rounded-full">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${!isYearly ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${isYearly ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Yearly <span className="ml-1 text-xs text-primary-foreground/70 bg-primary-foreground/20 px-2 py-0.5 rounded-full">-15%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`relative ${plan.recommended ? 'md:-translate-y-4' : ''}`}
            >
              {plan.recommended && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold shadow-lg z-10">
                  Most Popular
                </div>
              )}
              <Card className={`h-full ${plan.recommended ? 'border-primary shadow-xl ring-1 ring-primary/20' : 'border-border bg-card/50'}`}>
                <CardContent className="p-8 flex flex-col h-full">
                  <h3 className="text-2xl font-display font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-6 min-h-[40px]">{plan.description}</p>
                  
                  <div className="mb-8">
                    <span className="text-4xl font-bold">
                      {typeof plan.price.monthly === 'number' ? '$' : ''}
                      {isYearly ? plan.price.yearly : plan.price.monthly}
                    </span>
                    {typeof plan.price.monthly === 'number' && (
                      <span className="text-muted-foreground">/mo</span>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full mb-8" 
                    variant={plan.recommended ? "default" : "outline"}
                    size="lg"
                  >
                    {plan.name === "Enterprise" ? "Contact Sales" : "Start Free Trial"}
                  </Button>
                  
                  <div className="space-y-4 flex-1">
                    <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Features</p>
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Check className="size-5 text-primary shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                    {plan.missingFeatures.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3 opacity-50">
                        <X className="size-5 text-muted-foreground shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
