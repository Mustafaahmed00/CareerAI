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

    const renderAIInterview = (q, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="font-medium">{q.question}</p>
                    <span className="text-sm text-muted-foreground">
                        Type: {q.type || 'General'}
                    </span>
                </div>
                <div className="text-right">
                    <span className="text-lg font-semibold">
                        {q.evaluation?.score ? `${q.evaluation.score}%` : 'N/A'}
                    </span>
                </div>
            </div>

            <div className="grid gap-4">
                {/* Technical and Communication Scores */}
                {q.evaluation && (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-500/10 p-3 rounded">
                            <p className="text-sm font-medium">Technical Accuracy</p>
                            <p className="text-lg">{q.evaluation.technicalAccuracy || 0}%</p>
                        </div>
                        <div className="bg-purple-500/10 p-3 rounded">
                            <p className="text-sm font-medium">Communication</p>
                            <p className="text-lg">{q.evaluation.communicationClarity || 0}%</p>
                        </div>
                    </div>
                )}

                {/* User's Answer */}
                <div className="bg-muted/50 p-3 rounded">
                    <p className="font-medium">Your Response:</p>
                    <p className="text-muted-foreground whitespace-pre-wrap">{q.userAnswer || 'No answer provided'}</p>
                </div>

                {/* Strengths */}
                {q.evaluation?.strengths?.length > 0 && (
                    <div className="bg-green-500/10 p-3 rounded">
                        <p className="font-medium">Key Strengths:</p>
                        <ul className="list-disc list-inside space-y-1">
                            {q.evaluation.strengths.map((strength, i) => (
                                <li key={i} className="text-muted-foreground">
                                    {strength}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Areas for Improvement */}
                {q.evaluation?.areasForImprovement?.length > 0 && (
                    <div className="bg-yellow-500/10 p-3 rounded">
                        <p className="font-medium">Areas for Improvement:</p>
                        <ul className="list-disc list-inside space-y-1">
                            {q.evaluation.areasForImprovement.map((area, i) => (
                                <li key={i} className="text-muted-foreground">
                                    {area}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Model Answer */}
                {q.evaluation?.suggestedAnswer && (
                    <div className="bg-blue-500/10 p-3 rounded">
                        <p className="font-medium">Example Strong Response:</p>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                            {q.evaluation.suggestedAnswer}
                        </p>
                    </div>
                )}

                {/* Detailed Feedback */}
                {q.evaluation?.feedback && (
                    <div className="bg-muted p-3 rounded">
                        <p className="font-medium">Detailed Feedback:</p>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                            {q.evaluation.feedback}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderQuiz = (q, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
                <p className="font-medium">{q.question}</p>
                {q.isCorrect ? 
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" /> : 
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                }
            </div>

            <div className="bg-muted/50 p-2 rounded">
                <p className="font-medium">Your Answer:</p>
                <p className="text-muted-foreground">{q.userAnswer || 'No answer provided'}</p>
            </div>

            {!q.isCorrect && q.answer && (
                <div className="bg-green-500/10 p-2 rounded">
                    <p className="font-medium">Correct Answer:</p>
                    <p className="text-muted-foreground">{q.answer}</p>
                </div>
            )}

            {q.explanation && (
                <div className="bg-muted p-2 rounded">
                    <p className="font-medium">Explanation:</p>
                    <p className="text-sm text-muted-foreground">{q.explanation}</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="mx-auto space-y-6">
            <h1 className="flex items-center gap-2 text-3xl gradient-title">
                <Trophy className="h-6 w-6 text-yellow-500" />
                {isAIInterview ? "Interview Results" : "Quiz Results"}
            </h1>

            <CardContent className="space-y-6">
                {/* Overall Scores */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-muted p-4 rounded-lg text-center">
                        <h4 className="font-medium mb-1">Overall Score</h4>
                        <p className="text-2xl font-bold">{result.quizScore?.toFixed(1) || 0}%</p>
                        <Progress value={result.quizScore || 0} className="mt-2" />
                    </div>
                    
                    {isAIInterview && (
                        <>
                            {result.technicalScore !== undefined && (
                                <div className="bg-blue-500/10 p-4 rounded-lg text-center">
                                    <h4 className="font-medium mb-1">Technical Score</h4>
                                    <p className="text-2xl font-bold">{result.technicalScore.toFixed(1)}%</p>
                                </div>
                            )}
                            {result.communicationScore !== undefined && (
                                <div className="bg-purple-500/10 p-4 rounded-lg text-center">
                                    <h4 className="font-medium mb-1">Communication Score</h4>
                                    <p className="text-2xl font-bold">{result.communicationScore.toFixed(1)}%</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Overall Feedback */}
                {result.improvementTip && (
                    <div className="bg-muted p-4 rounded-lg">
                        <p className="font-medium">Overall Feedback:</p>
                        <p className="text-muted-foreground">{result.improvementTip}</p>
                    </div>
                )}

                {/* Questions Review */}
                <div className="space-y-4">
                    <h3 className="font-medium text-lg">
                        {isAIInterview ? "Response Analysis" : "Question Review"}
                    </h3>
                    {result.questions?.map((q, index) => 
                        isAIInterview ? renderAIInterview(q, index) : renderQuiz(q, index)
                    )}
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