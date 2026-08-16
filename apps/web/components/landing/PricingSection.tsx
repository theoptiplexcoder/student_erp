'use client';

import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button, Card, CardContent } from '@student-erp/ui';
import { motion } from 'framer-motion';

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for small training centers and bootcamps.',
    price: { monthly: 299, yearly: 249 },
    features: [
      'Up to 500 Students',
      'Basic Reporting',
      'Email Support',
      'Standard Integrations',
      'Community Access',
    ],
    missingFeatures: ['Custom Workflows', 'API Access', 'Dedicated Success Manager'],
    recommended: false,
  },
  {
    name: 'Growth',
    description: 'For growing K-12 schools and colleges.',
    price: { monthly: 599, yearly: 499 },
    features: [
      'Up to 5,000 Students',
      'Advanced Analytics',
      'Priority 24/7 Support',
      'Premium Integrations',
      'Custom Workflows',
      'API Access',
    ],
    missingFeatures: ['Dedicated Success Manager'],
    recommended: true,
  },
  {
    name: 'Enterprise',
    description: 'Full-scale solution for universities and large districts.',
    price: { monthly: 'Custom', yearly: 'Custom' },
    features: [
      'Unlimited Students',
      'Custom BI Dashboards',
      'Dedicated Success Manager',
      'On-premise Deployment Option',
      'White-labeling',
      'SLA Guarantees',
    ],
    missingFeatures: [],
    recommended: false,
  },
];

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <section className="bg-background relative overflow-hidden py-24" id="pricing">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="font-display mb-6 text-4xl font-bold md:text-5xl">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Choose the plan that fits your institution's size and needs. No hidden fees.
          </p>

          <div className="bg-card border-border inline-flex items-center rounded-full border p-1">
            <button
              onClick={() => setIsYearly(false)}
              className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${!isYearly ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${isYearly ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Yearly{' '}
              <span className="text-primary-foreground/70 bg-primary-foreground/20 ml-1 rounded-full px-2 py-0.5 text-xs">
                -15%
              </span>
            </button>
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-3">
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
                <div className="bg-primary text-primary-foreground absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full px-4 py-1 text-sm font-bold shadow-lg">
                  Most Popular
                </div>
              )}
              <Card
                className={`h-full ${plan.recommended ? 'border-primary ring-primary/20 shadow-xl ring-1' : 'border-border bg-card/50'}`}
              >
                <CardContent className="flex h-full flex-col p-8">
                  <h3 className="font-display mb-2 text-2xl font-bold">{plan.name}</h3>
                  <p className="text-muted-foreground mb-6 min-h-[40px] text-sm">
                    {plan.description}
                  </p>

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
                    className="mb-8 w-full"
                    variant={plan.recommended ? 'default' : 'outline'}
                    size="lg"
                  >
                    {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                  </Button>

                  <div className="flex-1 space-y-4">
                    <p className="text-muted-foreground mb-4 text-sm font-bold tracking-wider uppercase">
                      Features
                    </p>
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Check className="text-primary size-5 shrink-0" />
                        <span className="text-foreground text-sm">{feature}</span>
                      </div>
                    ))}
                    {plan.missingFeatures.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3 opacity-50">
                        <X className="text-muted-foreground size-5 shrink-0" />
                        <span className="text-muted-foreground text-sm">{feature}</span>
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
