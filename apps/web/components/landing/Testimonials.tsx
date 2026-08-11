"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Card, Avatar, AvatarFallback, AvatarImage } from "@student-erp/ui";

const testimonials = [
  {
    name: "Dr. Sarah Jenkins",
    role: "Dean of Admissions",
    institution: "Westwood University",
    text: "Student ERP completely revolutionized how we handle incoming applications. Our processing time dropped by 60%, and the student experience is seamless.",
    image: "https://i.pravatar.cc/150?img=47"
  },
  {
    name: "Prof. Michael Chang",
    role: "Head of Computer Science",
    institution: "Tech Institute of America",
    text: "The integration between course management and grading is flawless. I spend less time doing administrative work and more time actually teaching.",
    image: "https://i.pravatar.cc/150?img=11"
  },
  {
    name: "Elena Rodriguez",
    role: "Registrar",
    institution: "Global Arts College",
    text: "We used to dread registration week. With this platform, it handles thousands of concurrent users without a hiccup. Truly enterprise-grade.",
    image: "https://i.pravatar.cc/150?img=5"
  },
  {
    name: "James Wilson",
    role: "IT Director",
    institution: "National Public Schools",
    text: "The AI-ready architecture and robust APIs allowed us to connect our legacy systems easily. The rollout was the smoothest I've seen in my 20-year career.",
    image: "https://i.pravatar.cc/150?img=33"
  }
];

export function Testimonials() {
  return (
    <section className="py-24 bg-muted/30 relative">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-display font-bold mb-6"
          >
            Trusted by the Best
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            See how forward-thinking institutions are transforming their campus operations with our platform.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Card className="h-full p-6 flex flex-col justify-between bg-card hover:shadow-xl transition-all hover:-translate-y-1 border-border/50">
                <div>
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="size-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-foreground/80 mb-6 italic leading-relaxed text-sm">
                    "{testimonial.text}"
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-primary/20">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold text-sm font-display">{testimonial.name}</h4>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
