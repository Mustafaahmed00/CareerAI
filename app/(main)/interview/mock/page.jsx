// mock/page.jsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Quiz from "../_components/quiz";
import { useSearchParams } from "next/navigation";

export default function MockInterviewPage() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") || "mcq";
  const [mode, setMode] = useState(initialMode);

  return (
    <div className="container mx-auto space-y-4 py-6">
      <div className="flex flex-col space-y-2 mx-2">
        <Link href="/interview">
          <Button variant="link" className="gap-2 pl-0">
            <ArrowLeft className="h-4 w-4" />
            Back to Interview Preparation
          </Button>
        </Link>

        <div>
          <h1 className="text-6xl font-bold gradient-title">
            {mode === "ai" ? "AI Interview" : "Mock Interview"}
          </h1>
          <p className="text-muted-foreground">
            {mode === "ai" 
              ? "Practice with AI-powered behavioral and technical questions"
              : "Test your knowledge with industry-specific questions"
            }
          </p>
        </div>
      </div>

      <Tabs defaultValue={initialMode} className="mx-2" onValueChange={setMode}>
        <TabsList>
          <TabsTrigger value="mcq">Multiple Choice</TabsTrigger>
          <TabsTrigger value="ai">AI Interview</TabsTrigger>
        </TabsList>
      </Tabs>

      <Quiz mode={mode} />
    </div>
  );
}