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
      You are an expert interviewer. Evaluate this interview answer for the following question:
      
      Question: "${question.question}"
      Answer: "${answer}"
      
      Question Type: ${question.type}
      Expected Key Points: ${question.keyPoints.join(", ")}
      Evaluation Criteria: ${question.evaluationCriteria.join(", ")}
      
      Provide evaluation in this JSON format only:
      {
        "score": number (0-10),
        "feedback": "string (constructive feedback)",
        "strengths": ["string"],
        "areasForImprovement": ["string"],
        "suggestedAnswer": "string (brief example of a strong answer)"
      }
    `;
  
    try {
      const result = await model.generateContent(evaluationPrompt);
      const response = result.response;
      const text = response.text();
      const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error("Error evaluating answer:", error);
      throw new Error("Failed to evaluate answer");
    }
  }
  
  export async function saveAIInterviewResult(questions, answers, evaluations) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
  
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
  
    if (!user) throw new Error("User not found");
  
    const questionResults = questions.map((q, index) => ({
      question: q.question,
      type: q.type,
      userAnswer: answers[index],
      evaluation: evaluations[index],
    }));
  
    // Calculate average score
    const averageScore = evaluations.reduce((acc, ev) => acc + ev.score, 0) / evaluations.length;
  
    // Generate overall improvement tip
    const improvementPrompt = `
      Based on these interview responses and evaluations:
      ${questionResults.map(r => 
        `Question: "${r.question}"
         Areas for Improvement: ${r.evaluation.areasForImprovement.join(", ")}`
      ).join("\n\n")}
  
      Provide a concise, encouraging improvement tip focusing on the key areas to work on.
      Keep it under 2 sentences and make it actionable.
    `;
  
    let improvementTip = null;
    try {
      const tipResult = await model.generateContent(improvementPrompt);
      improvementTip = tipResult.response.text().trim();
    } catch (error) {
      console.error("Error generating improvement tip:", error);
    }
  
    try {
      const assessment = await db.assessment.create({
        data: {
          userId: user.id,
          quizScore: averageScore * 10, // Convert to percentage
          questions: questionResults,
          category: "AI Interview",
          improvementTip,
        },
      });
  
      return assessment;
    } catch (error) {
      console.error("Error saving interview result:", error);
      throw new Error("Failed to save interview result");
    }
  }