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
  
      // Ensure all required fields are present
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
    // Get the current user
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
  
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");
  
    // Calculate overall, technical, and communication scores from evaluation metrics
    const overallScore = evaluations.reduce((acc, ev) => acc + ev.score, 0) / evaluations.length;
    const technicalScore = evaluations.reduce((acc, ev) => acc + (ev.technicalAccuracy || 0), 0) / evaluations.length;
    const communicationScore = evaluations.reduce((acc, ev) => acc + (ev.communicationClarity || 0), 0) / evaluations.length;
  
    // Create an array to store detailed question results
    const questionResults = questions.map((q, index) => ({
      question: q.question,
      type: q.type,
      userAnswer: answers[index],
      evaluation: {
        // Use defaults if any key is missing
        score: evaluations[index].score || 0,
        technicalAccuracy: evaluations[index].technicalAccuracy || 0,
        communicationClarity: evaluations[index].communicationClarity || 0,
        completeness: evaluations[index].completeness || 0,
        detailedFeedback: evaluations[index].detailedFeedback || "",
        keyStrengths: evaluations[index].keyStrengths || [],
        improvementAreas: evaluations[index].improvementAreas || [],
        modelAnswer: evaluations[index].modelAnswer || ""
      }
    }));
  
    // Aggregate feedback: unique strengths and areas for improvement
    const allStrengths = evaluations.flatMap(ev => ev.strengths || []);
    const allAreasForImprovement = evaluations.flatMap(ev => ev.areasForImprovement || []);
    const uniqueStrengths = [...new Set(allStrengths)].slice(0, 3);
    const uniqueAreasForImprovement = [...new Set(allAreasForImprovement)].slice(0, 3);
  
    try {
      // Save the assessment record to the database.
      // Note: Make sure your Prisma schema has the technicalScore column.
      const assessment = await db.assessment.create({
        data: {
          userId: user.id,
          quizScore: overallScore,
          technicalScore: technicalScore,   // Maps average technical accuracy to database column
          communicationScore: communicationScore,
          questions: questionResults,
          category: "AI Interview",
          strengths: uniqueStrengths,
          areasForImprovement: uniqueAreasForImprovement,
          improvementTip: generateOverallFeedback(evaluations),
        },
      });
  
      return assessment;
    } catch (error) {
      console.error("Error saving interview result:", error);
      throw new Error("Failed to save interview result");
    }
  }
  
  
  function generateOverallFeedback(evaluations) {
    // Analyze common patterns in feedback
    const commonStrengths = findCommonPatterns(evaluations.flatMap(ev => ev.strengths));
    const commonWeaknesses = findCommonPatterns(evaluations.flatMap(ev => ev.areasForImprovement));
  
    return `Strong in ${commonStrengths[0] || 'communication'}. Focus on improving ${commonWeaknesses[0] || 'specific examples'} for better responses.`;
  }
  
  function findCommonPatterns(items) {
    const frequency = {};
    items.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1;
    });
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .map(([item]) => item);
  }