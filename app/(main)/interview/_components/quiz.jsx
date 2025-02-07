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
import { useRouter } from "next/navigation";

// Helper function to convert Blob to Base64
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]); // Remove base64 prefix
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function Quiz({ mode = "mcq" }) {
  // State management
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [aiAnswer, setAIAnswer] = useState("");
  const [evaluations, setEvaluations] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [recordedChunks, setRecordedChunks] = useState([]);
  
  const mediaRecorderRef = useRef(null);
  const router = useRouter();

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

  // Start recording using MediaRecorder with real-time transcription
  // Update these parts in your Quiz component

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 48000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
  
      const mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        toast.error('Browser does not support required audio format');
        return;
      }
  
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 48000
      });
  
      const chunks = []; // Store all chunks
  
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
  
      // When recording stops, process the entire audio
      mediaRecorder.onstop = async () => {
        try {
          // Create a unique ID for the loading toast
          const loadingToastId = toast.loading('Converting speech to text...');
          
          const blob = new Blob(chunks, { type: mimeType });
          const base64Audio = await blobToBase64(blob);
          
          const response = await fetch('/api/transcribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              audio: base64Audio,
              fullTranscription: true
            }),
          });
  
          if (!response.ok) {
            // Dismiss the loading toast and show error
            toast.dismiss(loadingToastId);
            throw new Error('Transcription failed');
          }
  
          const data = await response.json();
          
          // Dismiss the loading toast
          toast.dismiss(loadingToastId);
          
          if (data.transcript) {
            setAIAnswer(prev => {
              const trimmedPrev = prev.trim();
              const separator = trimmedPrev ? ' ' : '';
              return trimmedPrev + separator + data.transcript.trim();
            });
            toast.success('Speech converted to text successfully!');
          } else {
            toast.error('No speech detected');
          }
        } catch (error) {
          console.error('Transcription error:', error);
          toast.error('Failed to convert speech to text');
        }
      };
  
      // Collect data in larger chunks
      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      toast.success('Recording started. Speak clearly.');
  
    } catch (error) {
        console.error('Error starting recording:', error);
        if (error.name === 'NotAllowedError') {
          toast.error('Microphone permission denied');
        } else if (error.name === 'NotFoundError') {
          toast.error('No microphone found');
        } else {
          toast.error('Failed to start recording: ' + error.message);
        }
      }
    };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
      setIsRecording(false);
    }
  };

  // Handle AI interview flow
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
      console.error("AI evaluation error:", error);
      toast.error("Failed to evaluate answer");
    }
  };

  // Handle quiz answers (for MCQ mode)
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
      console.error("Quiz completion error:", error);
      toast.error(error.message || "Failed to save quiz results");
    }
  };

  const finishInterview = async (finalAnswers, finalEvaluations) => {
    try {
      await saveQuizResultFn(quizData, finalAnswers, finalEvaluations);
      toast.success("Interview completed! Redirecting to Interview Preparation page...");
      router.push("/interview");
    } catch (error) {
      console.error("Interview completion error:", error);
      toast.error(error.message || "Failed to save interview results");
    }
  };

  const startNewQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setEvaluations([]);
    setShowExplanation(false);
    setAIAnswer("");
    setInterimTranscript('');
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

  if (generatingQuiz) {
    return <BarLoader className="mt-4" width={"100%"} color="gray" />;
  }

  if (resultData) {
    return (
      <div className="mx-2">
        <QuizResult result={resultData} onStartNew={startNewQuiz} />
      </div>
    );
  }

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
          <div className="relative">
            <Textarea
              value={aiAnswer + (interimTranscript ? ` ${interimTranscript}` : '')}
              onChange={(e) => setAIAnswer(e.target.value)}
              placeholder="Type your answer here or use voice input..."
              className="min-h-[120px]"
            />
            {interimTranscript && (
              <div className="absolute bottom-2 right-2">
                <span className="text-xs text-muted-foreground animate-pulse">
                  Listening...
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              {isRecording ? "Recording... Click mic to stop" : "Click mic to start recording"}
            </p>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => isRecording ? stopRecording() : startRecording()}
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

  // MCQ Mode
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