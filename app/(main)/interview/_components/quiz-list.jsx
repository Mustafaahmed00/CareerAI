"use client";

import { useState } from "react";
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
           {assessments?.map((assessment, i) => (
             <Card
               key={assessment.id}
               className="cursor-pointer hover:bg-muted/50 transition-colors"
               onClick={() => setSelectedQuiz(assessment)}
             >
               <CardHeader>
                 <div className="flex items-center justify-between">
                   <CardTitle className="gradient-title text-2xl">
                     {assessment.category === "AI Interview" ? "Interview" : "Quiz"} {i + 1}
                   </CardTitle>
                   <span className={`text-sm px-2 py-1 rounded ${
                     assessment.category === "AI Interview" 
                       ? "bg-blue-500/10 text-blue-500"
                       : "bg-green-500/10 text-green-500"
                   }`}>
                     {assessment.category}
                   </span>
                 </div>
                 <CardDescription className="flex justify-between w-full">
                   <div>Score: {assessment.quizScore.toFixed(1)}%</div>
                   <div>
                     {format(
                       new Date(assessment.createdAt),
                       "MMMM dd, yyyy HH:mm"
                     )}
                   </div>
                 </CardDescription>
               </CardHeader>
               {assessment.improvementTip && (
                 <CardContent>
                   <p className="text-sm text-muted-foreground">
                     {assessment.improvementTip}
                   </p>
                 </CardContent>
               )}
             </Card>
           ))}
         </div>
       </CardContent>
     </Card>

     <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
       <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
         <DialogHeader>
           <DialogTitle>
             {selectedQuiz?.category === "AI Interview" ? "Interview" : "Quiz"} Results
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