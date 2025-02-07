"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateQuiz() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      industry: true,
      skills: true,
    },
  });

  if (!user) throw new Error("User not found");

  const prompt = `
    Generate 10 technical interview questions for a ${
      user.industry
    } professional${
    user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
  }.
    
    Each question should be multiple choice with 4 options.
    
    Return the response in this JSON format only, no additional text:
    {
      "questions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string"
        }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    const quiz = JSON.parse(cleanedText);

    return quiz.questions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz questions");
  }
}

export async function saveQuizResult(questions, answers, score) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const questionResults = questions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers[index],
    isCorrect: q.correctAnswer === answers[index],
    explanation: q.explanation,
  }));

  // Get wrong answers
  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);

  // Only generate improvement tips if there are wrong answers
  let improvementTip = null;
  if (wrongAnswers.length > 0) {
    const wrongQuestionsText = wrongAnswers
      .map(
        (q) =>
          `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`
      )
      .join("\n\n");

    const improvementPrompt = `
      The user got the following ${user.industry} technical interview questions wrong:

      ${wrongQuestionsText}

      Based on these mistakes, provide a concise, specific improvement tip.
      Focus on the knowledge gaps revealed by these wrong answers.
      Keep the response under 2 sentences and make it encouraging.
      Don't explicitly mention the mistakes, instead focus on what to learn/practice.
    `;

    try {
      const tipResult = await model.generateContent(improvementPrompt);

      improvementTip = tipResult.response.text().trim();
      console.log(improvementTip);
    } catch (error) {
      console.error("Error generating improvement tip:", error);
      // Continue without improvement tip if generation fails
    }
  }

  try {
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: score,
        questions: questionResults,
        category: "Technical",
        improvementTip,
      },
    });

    return assessment;
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw new Error("Failed to save quiz result");
  }
}

export async function getAssessments() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const assessments = await db.assessment.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return assessments;
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw new Error("Failed to fetch assessments");
  }
}
export async function generateAIQuestion() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
  
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: {
        industry: true,
        skills: true,
        experience: true,
      },
    });
  
    if (!user) throw new Error("User not found");
  
    const prompt = `
      Generate 5 behavioral and technical interview questions for a ${user.industry} professional${
      user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
    } and ${user.experience || 0} years of experience.
      
      The questions should assess both technical knowledge and soft skills.
      Include a mix of behavioral, problem-solving, and technical questions.
      
      Return the response in this JSON format only, no additional text:
      {
        "questions": [
          {
            "question": "string",
            "type": "behavioral|technical",
            "evaluationCriteria": ["string"],
            "keyPoints": ["string"]
          }
        ]
      }
    `;
  
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
      const interview = JSON.parse(cleanedText);
  
      return interview.questions;
    } catch (error) {
      console.error("Error generating AI interview:", error);
      throw new Error("Failed to generate interview questions");
    }
  }
  
  export async function evaluateAIAnswer(question, answer) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
  
    const evaluationPrompt = `
      You are an expert interviewer evaluating a candidate's response.
      
      Question: "${question.question}"
      Candidate's Answer: "${answer}"
      Question Type: ${question.type}
      Key Points Expected: ${question.keyPoints.join(", ")}
      Evaluation Criteria: ${question.evaluationCriteria.join(", ")}
  
      Provide a detailed evaluation in this exact JSON format:
      {
        "score": A number from 0-100 representing overall quality,
        "detailedFeedback": "Specific, constructive feedback about the answer",
        "keyStrengths": ["List 2-3 specific strong points"],
        "improvementAreas": ["List 2-3 specific areas to improve"],
        "modelAnswer": "A concise example of an excellent answer",
        "technicalAccuracy": A number from 0-100 for technical questions only,
        "communicationClarity": A number from 0-100,
        "completeness": A number from 0-100
      }
  
      When evaluating:
      1. Consider both technical accuracy and communication clarity
      2. Check if all key points were addressed
      3. Assess the structure and completeness of the answer
      4. Evaluate practical examples or experience mentioned
      5. Consider the depth of technical understanding shown
    `;
  
    try {
      const result = await model.generateContent(evaluationPrompt);
      const response = result.response;
      const text = response.text();
      const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
      const evaluation = JSON.parse(cleanedText);
  
      return {
        score: evaluation.score || 0,
        feedback: evaluation.detailedFeedback || "No feedback provided",
        strengths: evaluation.keyStrengths || [],
        areasForImprovement: evaluation.improvementAreas || [],
        suggestedAnswer: evaluation.modelAnswer || "No model answer provided",
        technicalAccuracy: evaluation.technicalAccuracy || 0,
        communicationClarity: evaluation.communicationClarity || 0,
        completeness: evaluation.completeness || 0
      };
    } catch (error) {
      console.error("Error evaluating answer:", error);
      throw new Error("Failed to evaluate answer");
    }
  }
  
  export async function saveAIInterviewResult(questions, answers, evaluations) {
    try {
      console.log('Input data:', { questions, answers, evaluations });
      
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");
  
      const user = await db.user.findUnique({
        where: { clerkUserId: userId }
      });
      if (!user) throw new Error("User not found");
  
      const scores = evaluations.reduce((acc, ev) => ({
        overall: acc.overall + (ev?.score || 0),
        technical: acc.technical + (ev?.technicalAccuracy || 0),
        communication: acc.communication + (ev?.communicationClarity || 0)
      }), { overall: 0, technical: 0, communication: 0 });
  
      const count = evaluations.length;
      const finalScores = {
        overall: Math.round(scores.overall / count),
        technical: Math.round(scores.technical / count),
        communication: Math.round(scores.communication / count)
      };
  
      console.log('Calculated scores:', finalScores);
  
      const assessment = await db.assessment.create({
        data: {
          userId: user.id,
          quizScore: finalScores.overall,
          technicalScore: finalScores.technical,
          communicationScore: finalScores.communication,
          questions: questions.map((q, i) => ({
            question: q.question,
            type: q.type,
            userAnswer: answers[i],
            evaluation: evaluations[i]
          })),
          category: "AI Interview",
          improvementTip: "Keep practicing and focusing on clear, detailed responses."
        }
      });
  
      console.log('Created assessment:', assessment);
      return assessment;
    } catch (error) {
      console.error('Error in saveAIInterviewResult:', error);
      throw error;
    }
  }