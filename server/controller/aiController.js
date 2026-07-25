const axios = require("axios");
const { PromptBuilder } = require("../utils/promptBuilder");
const EmailHistory = require("../models/EmailHistory");

// Helper to extract and parse JSON from messy LLM responses
function extractJSON(text) {
  if (!text) return null;
  
  // 1. Try to parse directly
  try {
    return JSON.parse(text.trim());
  } catch (e) {}

  // 2. Extract content between first '{' and last '}'
  const firstBracket = text.indexOf("{");
  const lastBracket = text.lastIndexOf("}");
  
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    const jsonString = text.substring(firstBracket, lastBracket + 1);
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      // 3. Fallback: Clean common JSON errors like unescaped newlines in values
      try {
        const cleaned = jsonString.replace(/:\s*"([^"]*)"/g, (match, p1) => {
          return ': "' + p1.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/"/g, '\\"') + '"';
        });
        return JSON.parse(cleaned);
      } catch (e2) {
        console.error("Failed to parse cleaned JSON string:", e2);
      }
    }
  }
  return null;
}

// Generate Email
exports.generateEmail = async (req, res) => {
  const { prompt, resumeInfo } = req.body;

  if (!prompt) {
    return res.status(400).json({
      message: "Prompt is required",
    });
  }

  try {
    const systemPrompt = `
You are an expert cold email copywriter.

Your task is to generate a professional cold email package based on the candidate's profile details and the target job description.

CRITICAL RULES:
1. Read the candidate's profile details carefully if provided.
2. Always use and incorporate the candidate's real Skills listed in their profile.
3. Always use and mention the candidate's real Projects and technologies listed in their profile.
4. Always use and mention the candidate's real Education details.
5. NEVER invent, exaggerate, or hallucinate skills or qualifications not present in the profile.
6. NEVER invent projects or accomplishments.
7. NEVER invent experience, past jobs, roles, or companies.
8. Use proper, professional formatting with clean spacing and paragraph breaks.
9. If any profile information is missing, do not guess, assume, or fabricate it.
10. Generate exactly:
    - Cold Email (Subject & Body)
    - LinkedIn DM
    - Follow-up Message

Return ONLY valid JSON in the following format:
{
  "subject": "Email Subject",
  "emailBody": "Email Body",
  "linkedInDM": "LinkedIn DM Content",
  "followUpEmail": "Follow-up Email Content"
}
`;

    const userContent = resumeInfo ? PromptBuilder.build(resumeInfo, prompt) : prompt;

    console.log("\n=================== SYSTEM PROMPT SENT TO GEMINI ===================");
    console.log(systemPrompt);
    console.log("=====================================================================");

    console.log("\n==================== USER PROMPT SENT TO GEMINI ====================");
    console.log(userContent);
    console.log("=====================================================================\n");

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3-8b-instruct:free",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userContent,
          },
        ],
        max_tokens: 2048,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // API Response Guards
    const choices = response.data?.choices;
    if (!choices || choices.length === 0) {
      const apiError = response.data?.error?.message || "Invalid response structure from AI model";
      throw new Error(apiError);
    }

    const aiResponse = choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error("No content returned from AI model");
    }

    // Parse Response using robust extractor
    const parsedData = extractJSON(aiResponse);
    if (!parsedData) {
      console.error("Raw AI response failed to parse as JSON:", aiResponse);
      throw new Error("AI response format was invalid. Please try again.");
    }

    const { subject, emailBody, linkedInDM, followUpEmail } = parsedData;

    if (!subject || !emailBody) {
      throw new Error("AI output was missing email subject or body fields");
    }

    await EmailHistory.create({
      user: req.user._id,
      Prompt: prompt, // Schema requires 'Prompt' with capital P
      subject,
      emailBody,
      linkedInDM,
      followUpEmail,
    });

    return res.status(200).json({
      message: "Email generated successfully",
      data: {
        subject,
        emailBody,
        linkedInDM,
        followUpEmail,
      },
    });

  } catch (error) {
    console.error("Error generating email:", error.response?.data || error.message);

    return res.status(500).json({
      message: "Error generating email",
      error: error.response?.data || error.message,
    });
  }
};

// Get Email History
exports.getEmailHistory = async (req, res) => {
  try {
    const emailHistory = await EmailHistory.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json(emailHistory);

  } catch (error) {
    console.error("Error fetching email history:", error);

    return res.status(500).json({
      message: "Error fetching email history",
      error: error.message,
    });
  }
};