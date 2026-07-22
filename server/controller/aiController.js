const axios = require("axios");
const { PromptBuilder } = require("../utils/promptBuilder");
const EmailHistory = require("../models/EmailHistory");

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
        model: "openrouter/free",
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
        max_tokens: 1024,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiResponse = response.data.choices[0].message.content;

    // Clean up any markdown code block wrappers and extract JSON block
    let cleanResponse = aiResponse.trim();
    if (cleanResponse.startsWith("```")) {
      cleanResponse = cleanResponse.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
    }
    
    // Extract JSON block using regex to ignore conversational preambles
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanResponse = jsonMatch[0];
    }

    const {
      subject,
      emailBody,
      linkedInDM,
      followUpEmail,
    } = JSON.parse(cleanResponse);

    await EmailHistory.create({
      user: req.user._id,
      Prompt: prompt, // Fixed: Schema requires 'Prompt' with capital P
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