import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// OpenAI setup
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Test route
app.get("/", (req, res) => {
  res.send("Server is working 🚀");
});

// AI Diet Generator Route
app.post("/generate-diet-plan", async (req, res) => {
  try {
    const { age, weight, height, goal } = req.body;

    const prompt = const prompt = 
You are a professional nutritionist.

Create a simple Indian daily diet plan for a person.

Age: ${age}
Weight: ${weight} kg
Height: ${height} cm
Goal: ${goal}

Return ONLY valid JSON in this format:
{
  "breakfast": "string",
  "lunch": "string",
  "dinner": "string",
  "snacks": "string",
  "water": "string",
  "tips": "string"
}
;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    let text = response.choices[0].message.content;

    // 🛡️ SAFE JSON PARSE (prevents crashes)
    let plan;
    try {
      plan = JSON.parse(text);
    } catch (err) {
      // fallback if AI adds extra text
      const cleanText = text.match(/\{[\s\S]*\}/);
      plan = cleanText ? JSON.parse(cleanText[0]) : {};
    }

    res.json({
      success: true,
      plan,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "AI generation failed",
    });
  }
});

// Start server
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000 🚀");
});
