'use client';

import React from 'react';
import { Button, Badge } from '@student-erp/ui';
import { ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import MagicRings from './MagicRings';

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      {/* Magic Rings Background */}
      <div className="absolute inset-0 -z-20 opacity-30 dark:opacity-40">
        <MagicRings
          color="#059212"
          colorTwo="#f59e0b"
          ringCount={8}
          speed={0.8}
          attenuation={15}
          lineThickness={3}
          baseRadius={0.15}
          radiusStep={0.08}
          scaleRate={0.05}
          opacity={1}
          blur={1}
          noiseAmount={0.05}
          rotation={0}
          ringGap={1.2}
          fadeIn={0.7}
          fadeOut={0.5}
          followMouse={true}
          mouseInfluence={0.1}
          hoverScale={1.1}
          parallax={0.05}
          clickBurst={true}
          alphaMode="coverage"
        />
      </div>

      {/* Background Gradients */}
      <div className="bg-primary/20 absolute top-1/2 left-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-3xl" />

      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-12 text-center">
          {/* Main Text Content */}
          <div className="flex max-w-4xl flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20 mb-6 px-4 py-1 text-sm"
              >
                New: AI-Ready Architecture
              </Badge>
            </motion.div>

            <h1 className="font-display mb-6 text-6xl leading-[1.1] font-bold tracking-tight text-balance md:text-7xl lg:text-8xl">
              <motion.span
                className="text-foreground inline-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Run Your Entire
              </motion.span>
              <br />
              <motion.span
                className="text-primary inline-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Institution
              </motion.span>
              <br />
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                From One Platform.
              </motion.span>
            </h1>

            <motion.p
              className="text-muted-foreground mx-auto mb-8 max-w-2xl text-lg text-balance md:text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              The modern, cloud-based Academic ERP built for schools, colleges, and universities.
              Digitize the complete lifecycle from admission to alumni.
            </motion.p>

            <motion.div
              className="mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Link href="/signup" className="w-full sm:w-auto">
                <Button size="xl" className="w-full sm:w-auto">
                  Get Started
                  <ArrowRight className="ml-2 size-5" />
                </Button>
              </Link>
              <Button size="xl" variant="outline" className="w-full sm:w-auto">
                View Features
              </Button>
            </motion.div>

            <motion.div
              className="text-muted-foreground flex flex-col items-center justify-center gap-4 text-sm sm:flex-row"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="border-background bg-secondary flex h-8 w-8 items-center justify-center rounded-full border-2"
                  >
                    <img
                      src={`https://i.pravatar.cc/100?img=${i + 10}`}
                      alt="User"
                      className="rounded-full"
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <Star className="fill-primary text-primary size-4" />
                <Star className="fill-primary text-primary size-4" />
                <Star className="fill-primary text-primary size-4" />
                <Star className="fill-primary text-primary size-4" />
                <Star className="fill-primary text-primary size-4" />
              </div>
              <span>Trusted by 500+ institutions</span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
