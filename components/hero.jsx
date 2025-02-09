"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const HeroSection = () => {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const imageRef = useRef(null);

  const handleStartJourneyClick = () => {
    if (isSignedIn) {
      router.push("/dashboard");
    } else {
      router.push("/sign-in");
    }
  };

  useEffect(() => {
    const imageElement = imageRef.current;
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 100) {
        imageElement?.classList.add("scrolled");
      } else {
        imageElement?.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="hero-section w-full pt-36 md:pt-48 pb-10">
      <div className="space-y-6 text-center">
        <div className="space-y-6 mx-auto">
          <h1 className="text-5xl md:text-6xl lg:text-7xl">
            <span className="gradient-title animate-gradient font-extrabold">
              Accelerate Your Career
            </span>
            <br />
            <span className="gradient-title animate-gradient font-extrabold">
              With AI-Powered Coaching
            </span>
          </h1>
          <p className="hero-text mx-auto max-w-[600px] text-muted-foreground md:text-xl">
            Master interviews, build confidence, and unlock your professional potential with personalized AI guidance.
          </p>
        </div>
        <div className="flex justify-center space-x-4">
          <Button 
            size="lg" 
            className="px-8"
            onClick={handleStartJourneyClick}
          >
            Get Started
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="px-8 text-gray-900 hover:text-black hover:bg-gray-100 border-gray-300"
            onClick={() => window.open("https://www.linkedin.com/in/mustafa-ahmed002/", "_blank")}
          >
            Contact me
          </Button>
        </div>
        <div className="hero-image-wrapper mt-5 md:mt-0">
          <div ref={imageRef} className="hero-image">
            <Image
              src="/careerai1.png"
              width={1280}
              height={720}
              alt="Dashboard Preview"
              className="rounded-lg shadow-2xl border mx-auto"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;