import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Trophy,
  Target,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import HeroSection from "@/components/hero";
import CTAButton from "@/components/CTAButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { features } from "@/data/features";
import { faqs } from "@/data/faqs";
import { howItWorks } from "@/data/howItWorks";
import Testimonials from '@/data/testimonial';
import { auth } from "@clerk/nextjs/server";
import { redirect } from 'next/navigation'; // Import redirect for navigation

export default async function LandingPage() {
  const { userId } = await auth(); // Get user authentication status on the server

  const handleStartJourneyClick = () => {
    if (userId) {
      // User is logged in, redirect to dashboard
      redirect('/dashboard');
    } else {
      // User is NOT logged in, redirect to sign-in
      redirect('/sign-in');
    }
  };
  return (
    <>
      <div className="grid-background"></div>

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-12">
            Powerful Features for Your Career Growth
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-2 hover:border-primary transition-colors duration-300"
              >
                <CardContent className="pt-6 text-center flex flex-col items-center">
                  <div className="flex flex-col items-center justify-center">
                    {feature.icon}
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/* Stats Section */}
<section className="w-full py-12 md:py-24 bg-muted/50">
  <div className="container mx-auto px-4 md:px-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
      <div className="flex flex-col items-center justify-center space-y-2">
        <h3 className="text-4xl font-bold text-gray-900">50+</h3>
        <p className="text-gray-600">Industries Covered</p>
      </div>
      <div className="flex flex-col items-center justify-center space-y-2">
        <h3 className="text-4xl font-bold text-gray-900">1000+</h3>
        <p className="text-gray-600">Interview Questions</p>
      </div>
      <div className="flex flex-col items-center justify-center space-y-2">
        <h3 className="text-4xl font-bold text-gray-900">95%</h3>
        <p className="text-gray-600">Success Rate</p>
      </div>
      <div className="flex flex-col items-center justify-center space-y-2">
        <h3 className="text-4xl font-bold text-gray-900">24/7</h3>
        <p className="text-gray-600">AI Support</p>
      </div>
    </div>
  </div>
</section>

      {/* How It Works Section */}
      <section className="w-full py-12 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">
              Four simple steps to accelerate your career growth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {howItWorks.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-xl">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* FAQ Section */}
<section className="w-full py-12 md:py-24 bg-gradient-to-b from-white to-gray-50">
  <div className="container mx-auto px-4 md:px-6">
    <div className="text-center max-w-3xl mx-auto mb-12">
      <h2 className="text-3xl font-bold tracking-tighter mb-4 text-gray-900">
        Frequently Asked Questions
      </h2>
      <p className="text-gray-600 max-w-xl mx-auto">
        Find answers to common questions about our platform
      </p>
    </div>
    
    <div className="max-w-3xl mx-auto">
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem 
            key={index} 
            value={`item-${index}`}
            className="bg-white mb-2 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <AccordionTrigger className="text-left px-4 hover:bg-gray-50 transition-colors duration-200 font-medium text-gray-900">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="px-4 text-gray-700">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </div>
</section>

      {/* CTA Section */}
      <section className="w-full">
        <div className="mx-auto py-24 gradient rounded-lg">
          <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter text-primary-foreground sm:text-4xl md:text-5xl">
              Ready to Accelerate Your Career?
            </h2>
            <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl">
              Join thousands of professionals who are advancing their careers
              with AI-powered guidance.
            </p>
            <CTAButton />
          </div>
        </div>
      </section>
    </>
  );
}