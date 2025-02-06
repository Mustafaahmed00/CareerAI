"use client";

import { Trophy, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function QuizResult({
    result,
    hideStartNew = false,
    onStartNew,
}) {
    if (!result) return null;

    const isAIInterview = result.category === "AI Interview";

    return (
        <div className="mx-auto">
            <h1 className="flex items-center gap-2 text-3xl gradient-title">
                <Trophy className="h-6 w-6 text-yellow-500" />
                {isAIInterview ? "Interview Results" : "Quiz Results"}
            </h1>

            <CardContent className="space-y-6">
                {/* Score Overview */}
                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold">{result.quizScore.toFixed(1)}%</h3>
                    <Progress value={result.quizScore} className="w-full" />
                </div>

                {/* Improvement Tip (for both Quiz and Interview) */}
                {result.improvementTip && (
                    <div className="bg-muted p-4 rounded-lg">
                        <p className="font-medium">Overall Feedback:</p>
                        <p className="text-muted-foreground">{result.improvementTip}</p>
                    </div>
                )}

                {/* Questions Review */}
                <div className="space-y-4">
                    <h3 className="font-medium">Question Review</h3>
                    {result.questions.map((q, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="font-medium">{q.question}</p>
                                    <span className="text-sm text-muted-foreground">
                                        Type: {q.type}
                                    </span>
                                </div>
                                <span className="text-lg font-semibold">
                                    {isAIInterview ? `${q.evaluation?.score || 0}/10` : (q.isCorrect ? <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" /> : <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />)}
                                </span>
                            </div>

                            <div className="bg-muted/50 p-2 rounded">
                                <p className="font-medium">Your Answer:</p>
                                <p className="text-muted-foreground">{q.userAnswer}</p>
                            </div>

                            {isAIInterview ? (
                                <div className="space-y-2">
                                    <div className="bg-green-500/10 p-2 rounded">
                                        <p className="font-medium">Strengths:</p>
                                        <ul className="list-disc list-inside">
                                            {(q.evaluation?.strengths || []).map((strength, i) => (
                                                <li key={i} className="text-sm text-muted-foreground">
                                                    {strength}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="bg-yellow-500/10 p-2 rounded">
                                        <p className="font-medium">Areas for Improvement:</p>
                                        <ul className="list-disc list-inside">
                                            {(q.evaluation?.areasForImprovement || []).map((area, i) => (
                                                <li key={i} className="text-sm text-muted-foreground">
                                                    {area}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="bg-blue-500/10 p-2 rounded">
                                        <p className="font-medium">Example Answer:</p>
                                        <p className="text-sm text-muted-foreground">
                                            {q.evaluation?.suggestedAnswer}
                                        </p>
                                    </div>

                                    <div className="bg-muted p-2 rounded">
                                        <p className="font-medium">Feedback:</p>
                                        <p className="text-sm text-muted-foreground">
                                            {q.evaluation?.feedback}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    {!q.isCorrect && <p>Correct answer: {q.answer}</p>}
                                    <div className="text-sm bg-muted p-2 rounded mt-2">
                                        <p className="font-medium">Explanation:</p>
                                        <p>{q.explanation}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>

            {!hideStartNew && (
                <CardFooter>
                    <Button onClick={onStartNew} className="w-full">
                        {isAIInterview ? "Start New Interview" : "Start New Quiz"}
                    </Button>
                </CardFooter>
            )}
        </div>
    );
}