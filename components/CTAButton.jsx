// components/CTAButton.js
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function CTAButton() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  const handleStartJourneyClick = () => {
    if (isSignedIn) {
      router.push("/dashboard");
    } else {
      router.push("/sign-in");
    }
  };

  return (
    <Button
      size="lg"
      variant="secondary"
      className="h-11 mt-5 animate-bounce"
      onClick={handleStartJourneyClick}
    >
      Start Your Journey Today <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );
}
