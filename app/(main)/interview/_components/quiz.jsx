"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  generateQuiz, 
  saveQuizResult, 
  generateAIQuestion,  
  evaluateAIAnswer,    
  saveAIInterviewResult 
} from "@/actions/interview";
import QuizResult from "./quiz-result";
import useFetch from "@/hooks/use-fetch";
import { BarLoader } from "react-spinners";
import { Mic, MicOff } from "lucide-react";

export default function Quiz({ mode = "mcq" }) { 
  // State management
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [aiAnswer, setAIAnswer] = useState("");
  const [evaluations, setEvaluations] = useState([]); 
  const [isRecording, setIsRecording] = useState(false);

  // Refs for recording
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // API hooks
  const {
    loading: generatingQuiz,
    fn: generateQuizFn,
    data: quizData,
  } = useFetch(mode === "mcq" ? generateQuiz : generateAIQuestion);

  const {
    loading: savingResult,
    fn: saveQuizResultFn,
    data: resultData,
    setData: setResultData,
  } = useFetch(mode === "mcq" ? saveQuizResult : saveAIInterviewResult);

  const {
    loading: evaluating,
    fn: evaluateAnswerFn,
  } = useFetch(evaluateAIAnswer);

  // Voice recording functions
  // Update the voice recording functions in your Quiz component
  const startRecording = async () => {
    try {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsRecording(false);

                let errorMessage = "An error occurred during speech recognition. Please try again.";

                switch (event.error) {
                    case 'network':
                        errorMessage = "Network error. Would you like to try again?";
                        toast.error(errorMessage, {
                            action: {
                                label: "Retry",
                                onClick: () => {
                                    startRecording();
                                },
                            },
                        });
                        return; // Important: Stop further processing in case of network error with retry
                    case 'not-allowed':
                    case 'permission-denied':
                        errorMessage = "Microphone access was denied. Please ensure your browser has permission to use the microphone.";
                        break;
                    case 'no-speech':
                        errorMessage = "No speech was detected. Please speak clearly into the microphone.";
                        break;
                    case 'audio-capture':
                        errorMessage = "No microphone was detected. Please connect a microphone and try again.";
                        break;
                    default:
                        // More specific error handling if needed
                        errorMessage = `Speech recognition error: ${event.error}`;
                }
                toast.error(errorMessage);
            };


            recognition.onstart = () => {
                setIsRecording(true);
                toast.success("Recording started. Speak clearly into your microphone.");
            };

            recognition.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                setAIAnswer(prev => {
                    const newText = finalTranscript || interimTranscript;
                    return prev ? `${prev} ${newText}` : newText;
                });
            };

            recognition.onend = () => {
                setIsRecording(false);
                if (!mediaRecorderRef.current) { // Check if stopped due to error
                    return;
                }
                toast.success("Recording stopped");
            };

            mediaRecorderRef.current = recognition;
            recognition.start();
        } else {
            toast.error("Speech recognition is not supported in your browser. Please use Chrome or Edge.");
        }
    } catch (error) {
        console.error('Speech recognition error:', error);
        toast.error("Failed to start recording. Please try again or type your answer.");
        setIsRecording(false);
    }
};
  
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null; // Clear the reference
    }
  };
  
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Handle AI interview
  const handleAINext = async () => {
    if (!aiAnswer.trim()) return;

    try {
      const evaluation = await evaluateAnswerFn(quizData[currentQuestion], aiAnswer);
      const newEvaluations = [...evaluations];
      newEvaluations[currentQuestion] = evaluation;
      setEvaluations(newEvaluations);

      const newAnswers = [...answers];
      newAnswers[currentQuestion] = aiAnswer;
      setAnswers(newAnswers);

      if (currentQuestion < quizData.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setAIAnswer("");
      } else {
        await finishInterview(newAnswers, newEvaluations);
      }
    } catch (error) {
      console.error('AI evaluation error:', error);
      toast.error("Failed to evaluate answer");
    }
  };

  // Handle quiz answers
  const handleAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (mode === "ai") {
      handleAINext();
      return;
    }

    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === quizData[index].correctAnswer) {
        correct++;
      }
    });
    return (correct / quizData.length) * 100;
  };

  const finishQuiz = async () => {
    const score = calculateScore();
    try {
      await saveQuizResultFn(quizData, answers, score);
      toast.success("Quiz completed!");
    } catch (error) {
      console.error('Quiz completion error:', error);
      toast.error(error.message || "Failed to save quiz results");
    }
  };

  const finishInterview = async (finalAnswers, finalEvaluations) => {
    try {
      await saveQuizResultFn(quizData, finalAnswers, finalEvaluations);
      toast.success("Interview completed!");
    } catch (error) {
      console.error('Interview completion error:', error);
      toast.error(error.message || "Failed to save interview results");
    }
  };

  const startNewQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setEvaluations([]);
    setShowExplanation(false);
    setAIAnswer("");
    generateQuizFn();
    setResultData(null);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        stopRecording();
      }
    };
  }, [isRecording]);

  useEffect(() => {
    if (quizData) {
      setAnswers(new Array(quizData.length).fill(null));
      setEvaluations(new Array(quizData.length).fill(null));
    }
  }, [quizData]);

  // Loading state
  if (generatingQuiz) {
    return <BarLoader className="mt-4" width={"100%"} color="gray" />;
  }

  // Show results if completed
  if (resultData) {
    return (
      <div className="mx-2">
        <QuizResult result={resultData} onStartNew={startNewQuiz} />
      </div>
    );
  }

  // Initial state
  if (!quizData) {
    return (
      <Card className="mx-2">
        <CardHeader>
          <CardTitle>
            {mode === "ai" ? "Ready for your interview?" : "Ready to test your knowledge?"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {mode === "ai" 
              ? "You'll be asked a series of behavioral and technical questions tailored to your industry. Take your time to provide detailed responses."
              : "This quiz contains 10 questions specific to your industry and skills. Take your time and choose the best answer for each question."
            }
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={generateQuizFn} className="w-full">
            {mode === "ai" ? "Start Interview" : "Start Quiz"}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // AI Interview mode
  if (mode === "ai") {
    return (
      <Card className="mx-2">
        <CardHeader>
          <CardTitle>
            Question {currentQuestion + 1} of {quizData?.length || 0}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Type: {quizData[currentQuestion]?.type}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg font-medium">{quizData[currentQuestion]?.question}</p>
          <Textarea
            value={aiAnswer}
            onChange={(e) => setAIAnswer(e.target.value)}
            placeholder="Type your answer here or use voice input..."
            className="min-h-[120px]"
          />
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              {isRecording ? "Recording... Click mic to stop" : "Click mic to start recording"}
            </p>
            <Button 
              variant="outline" 
              size="icon"
              onClick={toggleRecording}
              className={isRecording ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : ""}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            onClick={handleNext}
            disabled={!aiAnswer.trim() || savingResult || evaluating || isRecording}
            title={evaluating ? "Evaluating answer..." : ""} 
          >
            {evaluating ? (
              <>
                <BarLoader color="white" width={20} height={2} className="mr-2" />
                Evaluating...
              </>
            ) : currentQuestion < quizData.length - 1 ? (
              "Next Question"
            ) : (
              "Finish Interview"
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // MCQ Quiz mode
  return (
    <Card className="mx-2">
      <CardHeader>
        <CardTitle>
          Question {currentQuestion + 1} of {quizData.length}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg font-medium">{quizData[currentQuestion].question}</p>
        <RadioGroup
          onValueChange={handleAnswer}
          value={answers[currentQuestion]}
          className="space-y-2"
        >
          {quizData[currentQuestion].options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>

        {showExplanation && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="font-medium">Explanation:</p>
            <p className="text-muted-foreground">{quizData[currentQuestion].explanation}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {!showExplanation && (
          <Button
            onClick={() => setShowExplanation(true)}
            variant="outline"
            disabled={!answers[currentQuestion]}
          >
            Show Explanation
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={!answers[currentQuestion] || savingResult}
          className="ml-auto"
        >
          {savingResult ? (
            <BarLoader color="white" width={20} height={2} className="mr-2" />
          ) : currentQuestion < quizData.length - 1 ? (
            "Next Question"
          ) : (
            "Finish Quiz"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}