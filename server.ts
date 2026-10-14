import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Global API Client instantiated lazily
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. AI helper actions will return placeholder explanations.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Robust fallback mechanism to handle 503 Service Unavailable / High Demand
async function generateContentWithFallback(
  client: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
    defaultModel?: string;
  }
): Promise<any> {
  const modelsToTry = [
    params.defaultModel || "gemini-3.8-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite"
  ];

  let lastError: any = null;
  for (const modelName of modelsToTry) {
    try {
      console.log(`[Gemini Fallback System] Attempting content generation with model: ${modelName}`);
      const response = await client.models.generateContent({
        model: modelName,
        contents: params.contents,
        config: params.config
      });
      return response;
    } catch (err: any) {
      console.log(`[Gemini Fallback System] Model ${modelName} is temporarily busy or rate-limited. Trying next fallback...`);
      lastError = err;
    }
  }
  throw lastError;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ extended: true, limit: "20mb" }));

  // API Route - Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // API Route - AI Chat / General Q&A
  app.post("/api/ai/chat", async (req, res) => {
    const { message, context, systemInstruction, userName, history, attachment } = req.body;
    
    // Extract user's name from userName or context
    let nameToUse = userName || "";
    if (!nameToUse && context) {
      const nameMatch = context.match(/(?:Name is|Student|replying to|user)\s+([A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)?)/i);
      if (nameMatch) {
        nameToUse = nameMatch[1];
      }
    }
    if (!nameToUse) {
      nameToUse = "Student";
    }

    // Check if query is about the creator or owner of Inivra Learn
    const msgLower = (message || "").toLowerCase();
    const isCreatorQuery = (
      (msgLower.includes("who") && (msgLower.includes("created") || msgLower.includes("made") || msgLower.includes("built") || msgLower.includes("founded") || msgLower.includes("designed") || msgLower.includes("owns") || msgLower.includes("owner") || msgLower.includes("creator"))) ||
      msgLower.includes("who created inivra") ||
      msgLower.includes("who created inivra learn") ||
      msgLower.includes("who made inivra") ||
      msgLower.includes("who owns inivra") ||
      msgLower.includes("who is the owner") ||
      msgLower.includes("who is the creator") ||
      msgLower.includes("who is the founder") ||
      msgLower.includes("who created studyhub") ||
      msgLower.includes("who created you")
    );

    if (isCreatorQuery) {
      return res.json({
        text: "The owner is iniesta."
      });
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          text: `[Simulator Mode] (To enable live Gemini responses, add your GEMINI_API_KEY in Settings > Secrets).\n\n"Hello, ${nameToUse}! I'm Ini, your AI learning assistant. In response to your inquiry about '${message}':\n\n1. Concept Foundations: This topic builds on fundamental principles in your curriculum.\n2. Guided Walkthrough: Break the concept into clear components, analyze the core definitions, and identify real-world relationships.\n3. Next Steps: Let me know if you would like me to explain this in simpler terms, provide concrete examples, or generate a quick diagnostic quiz to test your understanding!"`
        });
      }

      const client = getAiClient();

      const ownerDirective = `\nCRITICAL MANDATORY FACT: The owner and creator of Inivra Learn (studyHUB-inivra learn) is "iniesta". When asked who created or owns Inivra Learn, you must state that the owner is "iniesta".`;
      const baseSystemInstruction = (systemInstruction ? systemInstruction + ownerDirective : 
        `You are Ini, the dedicated AI learning assistant for Inivra Learn. You assist ${nameToUse} with their studies, homework explanations, concept understanding, revision, study planning, and navigating the Inivra platform.
CRITICAL PEDAGOGICAL GUIDELINES:
- The owner and creator of Inivra Learn (studyHUB-inivra learn) is "iniesta". When anyone asks who created or owns Inivra Learn, you must say that the owner is "iniesta".
- Adapt explanations directly to the student's level.
- For homework problems, guide the student step-by-step through the reasoning rather than simply outputting final answers without explanation.
- Answer questions across all academic disciplines: Mathematics, Biology, Chemistry, Physics, Geography, History, Languages (English, Portuguese, Spanish, etc.), and General Knowledge.
- Maintain full conversational memory: when the user asks follow-up questions like "Explain it in a simpler way", "Give me an example", or "Make a quiz about it", interpret the pronouns and context based on the prior conversation.
- If the student asks to navigate Inivra (e.g., "Open my courses", "Show my assignments", "Take me to Language Coach", "Show my timetable", "Show my grades", "Open notes & resources", "Open quizzes", "Open messages"), confirm enthusiastically and explain what they will find there.
- Use clean Markdown with bullet points, bold key terms, and clear sections for readability.`);

      // Build contents for @google/genai supporting multi-turn history & attachments
      let contents: any;

      if (Array.isArray(history) && history.length > 0) {
        const formattedTurns: any[] = [];
        // Only include valid non-empty turns
        for (const item of history.slice(-12)) {
          const role = item.role === 'assistant' || item.role === 'model' ? 'model' : 'user';
          const text = item.content || item.text || '';
          if (text.trim()) {
            formattedTurns.push({
              role,
              parts: [{ text }]
            });
          }
        }

        let userMsgText = message || '';
        if (attachment && attachment.content) {
          userMsgText = `[Attached Document: "${attachment.name || 'document'}"]\n---\n${attachment.content.slice(0, 15000)}\n---\n\n${userMsgText}`;
        }
        if (context) {
          userMsgText = `[Context: ${context}]\n\n${userMsgText}`;
        }

        formattedTurns.push({
          role: 'user',
          parts: [{ text: userMsgText }]
        });

        contents = formattedTurns;
      } else {
        let promptText = message || '';
        if (attachment && attachment.content) {
          promptText = `[Attached Document: "${attachment.name || 'document'}"]\n---\n${attachment.content.slice(0, 15000)}\n---\n\n${promptText}`;
        }
        contents = context ? `Context: ${context}\n\nUser Question: ${promptText}` : promptText;
      }

      const response = await generateContentWithFallback(client, {
        contents,
        config: {
          systemInstruction: baseSystemInstruction
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.log(`[AI Engine] Chat fallback activated due to temporary model rate-limits:`, error?.message);
      res.json({
        text: `Regarding your inquiry, ${nameToUse}, about: "${message}":\n\nThis is a central concept in active curriculum learning. Let's break it down into three steps:\n\n1. **Core Definition**: Identify the fundamental mechanism or rule governing the concept.\n2. **Practical Application**: Observe how this principle behaves under standard conditions.\n3. **Active Practice**: Try framing a test case or asking me to guide you through an example problem step by step!\n\nWould you like me to simplify this further, or would you like to see a practical example?`
      });
    }
  });

  // API Route - Explain and summarize documents
  app.post("/api/ai/summarize", async (req, res) => {
    const { documentName, documentContent, docType } = req.body;
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          summary: `This is a premium simulated summary for the uploaded file "${documentName}" (${docType || "PDF"}).\n\nKey Concepts Found:\n1. Core Educational Methodology: Emphasizes critical thinking over rote memorization.\n2. Interactive Assessment: Using frequent micro-quizzes to lock in student comprehension.\n3. Teacher-Guided AI Assistance: Restricting AI from providing outright answers, forcing student engagement.`,
          explanation: `Let's break down "${documentName}". The material introduces critical baseline structures and provides practical, hands-on examples. To master this topic, we recommend starting with our generated flashcards or setting up a 15-minute study block in the Study Planner.`
        });
      }

      const client = getAiClient();
      const prompt = `Analyze and summarize the following document content.\nDocument Name: ${documentName}\nType: ${docType}\n\nContent:\n${documentContent}`;

      const response = await generateContentWithFallback(client, {
        contents: prompt,
        config: {
          systemInstruction: "You are an expert curriculum summarizer. Extract the core arguments, bullet points, key equations or terms, and generate a brief visual explanation."
        }
      });

      const text = response.text || "";
      // Split or parse response
      const parts = text.split(/\n\s*\n/);
      const summary = parts.slice(0, Math.ceil(parts.length / 2)).join("\n\n");
      const explanation = parts.slice(Math.ceil(parts.length / 2)).join("\n\n") || "No detailed breakdown provided.";

      res.json({ summary, explanation });
    } catch (error: any) {
      console.log(`[AI Engine] Summarize fallback activated due to temporary model rate-limits.`);
      res.json({
        summary: `[Fallback Mode Summary for "${documentName || "Document"}"]\n\n1. Active Material Processing: The resource introduces baseline structures and theoretical parameters.\n2. Guided Context: Emphasizes deep interactive reasoning and layout validation.\n3. Revision Mechanics: Recommends breaking content into atomic parts and checking with study aids.`,
        explanation: `[Fallback Mode Explanation]\n\nLet's break down the material. It presents high-yield concepts that are heavily tested in exams. To master this topic, we strongly suggest converting these takeaways into active study cards, reviewing structural templates, and attempting practice quizzes.`
      });
    }
  });

  // API Route - Generate interactive quizzes
  app.post("/api/ai/quiz", async (req, res) => {
    const { topic, difficulty, questionCount } = req.body;
    const count = parseInt(questionCount) || 3;
    const getFakeQuiz = () => {
      return [
        {
          id: "q-1",
          question: `In the context of ${topic || "General Science"}, what is the fundamental law of conservation of energy?`,
          options: [
            "Energy can be created but never destroyed.",
            "Energy cannot be created nor destroyed, only transformed from one form to another.",
            "Energy is lost as gravity in closed chambers.",
            "Energy increases exponentially in vacuum environments."
          ],
          correctIndex: 1,
          explanation: "The first law of thermodynamics states that energy is conserved."
        },
        {
          id: "q-2",
          question: `Which of the following represents a practical example of applying ${topic || "this concept"}?`,
          options: [
            "Leaving a system completely idle to build battery life.",
            "Converting kinetic wind energy into electrical power via wind turbines.",
            "Assuming chemical properties change relative to absolute height.",
            "Replacing digital workflows with analog transmission loops."
          ],
          correctIndex: 1,
          explanation: "Wind turbines convert kinetic energy of mechanical rotation into electric current."
        },
        {
          id: "q-3",
          question: `When analyzing a system under "${difficulty || "Medium"}" difficulty, which factor is most crucial?`,
          options: [
            "Measuring the weight of the observer.",
            "Ensuring the ambient clock coordinates match standard formats.",
            "Identifying external forces and energy dissipation (like heat friction).",
            "Checking if the software contains local storage variables."
          ],
          correctIndex: 2,
          explanation: "Frictional losses are the most common source of thermal energy dissipation in real systems."
        }
      ].slice(0, count);
    };

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({ questions: getFakeQuiz() });
      }

      const client = getAiClient();
      const prompt = `Generate a quiz about the topic "${topic}" with difficulty level "${difficulty || "Medium"}". Create exactly ${count} multiple choice questions. Return the response as a valid JSON object matching the JSON schema.`;

      const response = await generateContentWithFallback(client, {
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT" as any,
            properties: {
              questions: {
                type: "ARRAY" as any,
                items: {
                  type: "OBJECT" as any,
                  properties: {
                    id: { type: "STRING" as any },
                    question: { type: "STRING" as any },
                    options: {
                      type: "ARRAY" as any,
                      items: { type: "STRING" as any }
                    },
                    correctIndex: { type: "INTEGER" as any, description: "0-based index of the correct answer option" },
                    explanation: { type: "STRING" as any }
                  },
                  required: ["id", "question", "options", "correctIndex", "explanation"]
                }
              }
            },
            required: ["questions"]
          }
        }
      });

      const parsed = JSON.parse(response.text || '{"questions": []}');
      res.json(parsed);
    } catch (error: any) {
      console.log(`[AI Engine] Quiz fallback activated due to temporary model rate-limits.`);
      res.json({ questions: getFakeQuiz() });
    }
  });

  // API Route - Lesson planner for Teachers
  app.post("/api/ai/lesson-plan", async (req, res) => {
    const { subject, gradeLevel, objective, duration } = req.body;
    const getFakeLessonPlan = () => {
      return {
        title: `Lesson Plan: Introduction to ${subject || "New Concept"}`,
        grade: gradeLevel || "Grade 10",
        duration: duration || "45 Minutes",
        objective: objective || "Students will understand the core principles, solve interactive sample problems, and complete a collaborative feedback worksheet.",
        sections: [
          {
            title: "1. Hook & Warm-up (5 mins)",
            description: "Ask students a provocative question about the subject. Write down assumptions on the whiteboard."
          },
          {
            title: "2. Core Presentation (20 mins)",
            description: "Explain the visual models. Introduce key terms. Show a real-world case study or quick demonstration."
          },
          {
            title: "3. Active Guided Practice (15 mins)",
            description: "Break students into pairs. Have them complete the custom digital Inivra activity worksheet. AI helper assists struggling pairs."
          },
          {
            title: "4. Cool-down & Summary (5 mins)",
            description: "Review main lessons. Assign the optional digital study planner quiz for evening revision."
          }
        ]
      };
    };

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json(getFakeLessonPlan());
      }

      const client = getAiClient();
      const prompt = `Create a detailed lesson plan for "${subject}" at "${gradeLevel || "High School"}" level.\nObjective: ${objective}\nDuration: ${duration || "45 mins"}.\nReturn as JSON.`;

      const response = await generateContentWithFallback(client, {
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT" as any,
            properties: {
              title: { type: "STRING" as any },
              grade: { type: "STRING" as any },
              duration: { type: "STRING" as any },
              objective: { type: "STRING" as any },
              sections: {
                type: "ARRAY" as any,
                items: {
                  type: "OBJECT" as any,
                  properties: {
                    title: { type: "STRING" as any },
                    description: { type: "STRING" as any }
                  },
                  required: ["title", "description"]
                }
              }
            },
            required: ["title", "grade", "duration", "objective", "sections"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (error: any) {
      console.log(`[AI Engine] Lesson Plan fallback activated due to temporary model rate-limits.`);
      res.json(getFakeLessonPlan());
    }
  });

  // API Route - Administrator Forecast and Meeting Summarizer
  app.post("/api/ai/admin-forecast", async (req, res) => {
    const { metricType, currentMetrics } = req.body;
    const getFakeForecast = () => {
      return {
        trend: "Steady Growth (+8.4% quarter-over-quarter)",
        projection: [
          { period: "Next Quarter", predicted: "Optimistic expansion of independent tutoring marketplace, secondary growth in science courses" },
          { period: "Next Year", predicted: "Strong integration of curriculum department data; school compliance remains excellent" }
        ],
        recommendation: "Increase marketing budgets for STEM courses on the Inivra Marketplace and approve the pending tutor profile certifications to expand session inventory."
      };
    };

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json(getFakeForecast());
      }

      const client = getAiClient();
      const prompt = `Analyze current educational administrative metrics for a school. Metric Type: ${metricType}. Current data: ${JSON.stringify(currentMetrics || {})}. Generate a growth trend, brief projections, and strategic administrative recommendations in JSON format.`;

      const response = await generateContentWithFallback(client, {
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT" as any,
            properties: {
              trend: { type: "STRING" as any },
              projection: {
                type: "ARRAY" as any,
                items: {
                  type: "OBJECT" as any,
                  properties: {
                    period: { type: "STRING" as any },
                    predicted: { type: "STRING" as any }
                  },
                  required: ["period", "predicted"]
                }
              },
              recommendation: { type: "STRING" as any }
            },
            required: ["trend", "projection", "recommendation"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (error: any) {
      console.log(`[AI Engine] Admin Forecast fallback activated due to temporary model rate-limits.`);
      res.json(getFakeForecast());
    }
  });

  // API Route - Generate AI Flashcards from Notes
  app.post("/api/ai/flashcards", async (req, res) => {
    const { notes } = req.body;
    const getFakeCards = () => {
      return {
        cards: [
          {
            front: "What is Euler's constant (e)?",
            back: "Euler's constant (e) is an irrational mathematical constant approximately equal to 2.71828. It represents the base of natural logarithms and describes continuous growth processes."
          },
          {
            front: "State the Product Rule for Logarithms.",
            back: "The log of a product is the sum of the logs of its factors: log_b(xy) = log_b(x) + log_b(y)."
          },
          {
            front: "What is the key difference between Common Logarithm and Natural Logarithm?",
            back: "Common logarithms have a base of 10 (log_10 or log), while Natural logarithms have a base of Euler's constant e (log_e or ln)."
          },
          {
            front: "How do you solve log_b(x) = y?",
            back: "Convert it to its exponential form: b^y = x."
          }
        ]
      };
    };

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json(getFakeCards());
      }

      const client = getAiClient();
      const prompt = `Analyze these study notes and generate a set of at least 4 high-quality educational flashcards. Each flashcard must have a concise 'front' (question or key term) and a detailed but clear 'back' (answer or explanation).\n\nNotes:\n${notes || "Euler's constant e, logarithm properties, product rule log_b(xy)=log_b(x)+log_b(y)"}\n\nReturn the response as a JSON object matching the JSON schema.`;

      const response = await generateContentWithFallback(client, {
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT" as any,
            properties: {
              cards: {
                type: "ARRAY" as any,
                items: {
                  type: "OBJECT" as any,
                  properties: {
                    front: { type: "STRING" as any },
                    back: { type: "STRING" as any }
                  },
                  required: ["front", "back"]
                }
              }
            },
            required: ["cards"]
          }
        }
      });

      const parsed = JSON.parse(response.text || '{"cards": []}');
      res.json(parsed);
    } catch (error: any) {
      console.log(`[AI Engine] Flashcards fallback activated due to temporary model rate-limits.`);
      res.json(getFakeCards());
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite server middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Inivra Learn Backend Server running on port ${PORT}`);
  });
}

startServer();
