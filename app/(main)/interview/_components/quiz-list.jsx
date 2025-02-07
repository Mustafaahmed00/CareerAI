"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QuizResult from "./quiz-result";

export default function QuizList({ assessments }) {
  const router = useRouter();
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until client-side
  if (!mounted) {
    return null;
  }

  const formatDate = (date) => {
    try {
      return format(new Date(date), "MMMM dd, yyyy HH:mm");
    } catch (error) {
      return "Invalid date";
    }
  };

  const renderAssessmentCard = (assessment, index) => {
    const isInterview = assessment.category === "AI Interview";

    return (
      <Card
        key={assessment.id}
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setSelectedQuiz(assessment)}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="gradient-title text-2xl">
              {isInterview ? "Interview" : "Quiz"} {index + 1}
            </CardTitle>
            <span
              className={`text-sm px-2 py-1 rounded ${
                isInterview
                  ? "bg-blue-500/10 text-blue-500"
                  : "bg-green-500/10 text-green-500"
              }`}
            >
              {assessment.category}
            </span>
          </div>
          <CardDescription className="flex justify-between w-full">
            <div>Score: {assessment.quizScore?.toFixed(1) || 0}%</div>
            <div>{formatDate(assessment.createdAt)}</div>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isInterview && assessment.strengths && assessment.strengths.length > 0 && (
            <div className="bg-green-500/10 p-3 rounded">
              <p className="font-medium text-sm mb-1">Key Strengths:</p>
              <ul className="list-disc list-inside">
                {assessment.strengths.map((strength, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {isInterview && assessment.areasForImprovement && assessment.areasForImprovement.length > 0 && (
            <div className="bg-yellow-500/10 p-3 rounded">
              <p className="font-medium text-sm mb-1">Areas to Improve:</p>
              <ul className="list-disc list-inside">
                {assessment.areasForImprovement.map((area, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {assessment.improvementTip && (
            <div className="bg-muted/50 p-3 rounded">
              <p className="text-sm text-muted-foreground">
                {assessment.improvementTip}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="gradient-title text-3xl md:text-4xl">
                Recent Assessments
              </CardTitle>
              <CardDescription>
                Review your past quiz and interview performance
              </CardDescription>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/interview/mock?mode=ai")}
                className="hidden md:block"
              >
                Start AI Interview
              </Button>
              <Button onClick={() => router.push("/interview/mock")}>
                Start New Quiz
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="md:hidden mb-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/interview/mock?mode=ai")}
            >
              Start AI Interview
            </Button>
          </div>
          <div className="space-y-4">
            {assessments?.map((assessment, i) => renderAssessmentCard(assessment, i))}
          </div>
        </CardContent>
      </Card>

      <Dialog 
        open={!!selectedQuiz} 
        onOpenChange={() => setSelectedQuiz(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedQuiz?.category === "AI Interview" ? "Interview" : "Quiz"}{" "}
              Results
            </DialogTitle>
          </DialogHeader>
          <QuizResult
            result={selectedQuiz}
            hideStartNew
            onStartNew={() => router.push("/interview/mock")}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}