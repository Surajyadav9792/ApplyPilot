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

// Programmatic cold email validator with strict 7-point check
function validateColdEmail(emailData, resumeInfo) {
  const { subject, emailBody } = emailData;
  if (!subject || !emailBody) {
    return { isValid: false, reason: "Missing subject or email body fields." };
  }

  const lowerBody = emailBody.toLowerCase();

  // 1. Is it a cold email? (Must contain Greeting, CTA, and Signature)
  const hasGreeting = lowerBody.includes("hi ") || lowerBody.includes("dear ") || lowerBody.includes("hello");
  const hasCTA = lowerBody.includes("call") || lowerBody.includes("chat") || lowerBody.includes("conversation") || lowerBody.includes("discussion") || lowerBody.includes("connect");
  const hasSignature = lowerBody.includes("github") && lowerBody.includes("linkedin");
  if (!hasGreeting || !hasCTA || !hasSignature) {
    return { isValid: false, reason: "Does not follow the basic structure of a cold email (missing Greeting, CTA, or Signature links)." };
  }

  // 2. Is it a cover letter? (If paragraphs are > 3 lines, or contains formal cover letter greetings/cliches)
  const paragraphs = emailBody.split(/\n\s*\n/);
  for (const para of paragraphs) {
    const lines = para.split("\n").filter(l => l.trim().length > 0);
    if (lines.length > 3) {
      return { isValid: false, reason: "Looks like a cover letter because it contains paragraphs longer than 3 lines." };
    }
  }

  // 3. Does it exceed 170 words?
  const words = emailBody.trim().split(/\s+/).length;
  if (words > 170) {
    return { isValid: false, reason: `Exceeds the 170-word limit (current: ${words} words).` };
  }

  // 4. Does it summarize the resume? (If it includes CGPA, university name, or too many details)
  const hasCGPA = lowerBody.includes("cgpa") || lowerBody.includes("8.10") || lowerBody.includes("8.1");
  const hasUniversity = lowerBody.includes("madan mohan") || lowerBody.includes("malaviya") || lowerBody.includes("mmmut");
  if (hasCGPA || hasUniversity) {
    return { isValid: false, reason: "Summarizes the resume by including school name or CGPA, which should be omitted." };
  }

  // 5. Does it mention more than one project?
  if (resumeInfo) {
    const knownProjects = ["AgenticForge", "CodeJudge"];
    let mentionedCount = 0;
    const detected = [];
    for (const proj of knownProjects) {
      if (lowerBody.includes(proj.toLowerCase())) {
        mentionedCount++;
        detected.push(proj);
      }
    }
    if (mentionedCount > 1) {
      return { isValid: false, reason: `Mentions more than one project (${detected.join(", ")}). Rule states ONLY ONE project is allowed.` };
    }
  }

  // 6. Does it list too many technologies? (Max 5 allowed)
  const techKeywords = [
    "react", "redux", "node", "express", "mongodb", "redis", "docker", 
    "websockets", "jwt", "langgraph", "langchain", "c++", "javascript", "html", "css"
  ];
  let techCount = 0;
  const foundTech = [];
  for (const tech of techKeywords) {
    if (lowerBody.includes(tech)) {
      techCount++;
      foundTech.push(tech);
    }
  }
  if (techCount > 5) {
    return { isValid: false, reason: `Lists too many technologies (${techCount} found: ${foundTech.join(", ")}). Limit to a maximum of 5.` };
  }

  // 7. Does it sound AI generated? (Check for common AI clichés/markers)
  const aiCliches = [
    "hope this email finds you well",
    "hope you are doing well",
    "hope you're doing well",
    "writing to express my interest",
    "writing to express interest",
    "please find attached",
    "delve",
    "testament",
    "innovative solutions",
    "keen to",
    "feel free to"
  ];
  for (const cliche of aiCliches) {
    if (lowerBody.includes(cliche)) {
      return { isValid: false, reason: `Sounds AI-generated because it contains the cliché phrase: "${cliche}".` };
    }
  }

  return { isValid: true };
}

// Generate Email
exports.generateEmail = async (req, res) => {
  const { prompt, resumeInfo } = req.body;

  if (!prompt) {
    return res.status(400).json({
      message: "Prompt is required",
    });
  }

  let attempt = 0;
  const maxAttempts = 3;
  let validationResult = { isValid: false };
  let parsedData = null;
  let feedbackText = "";

  const systemPrompt = `
You are an elite B2B cold email copywriter.
Your task is to generate a professional cold email package based on the candidate's profile details and the target job description.

The generated emailBody MUST ALWAYS follow this exact structural layout:

Subject: [Catchy, professional subject line]

[Greeting] (e.g. Hi [Recruiter Name], or Hi Hiring Team,)

[Opening Paragraph] (Exactly 2-3 lines)
- Must mention the target company name.
- Explain why the candidate is interested in this company (referencing their engineering culture, tech stack, or products).

[Project Highlight] (Exactly one paragraph, maximum 2 lines)
- Highlight ONLY ONE relevant project from the candidate's profile.
- Describe the project in one brief sentence focusing on business or technical impact.

[Skills] (Exactly one sentence)
- State the core technical skills (4-5 max) that directly align with the job description.

[Call to Action] (Exactly one sentence)
- Politely ask for a brief conversation or a 10-minute chat.

[Signature]
- Name
- Phone
- Email
- GitHub
- LinkedIn

CRITICAL CONSTRAINTS:
1. The entire emailBody must be under 170 words.
2. Never mention more than one project.
3. Never write paragraphs longer than 3 lines.
4. Never include candidate's CGPA.
5. NEVER use AI clichés like "I hope this email finds you well", "I hope you are doing well", "I am writing to express my interest", or "I recently came across your profile". Start directly and naturally.
6. Do not list more than 5 technology names in total.
7. The output must be returned as valid JSON in the following format:
{
  "subject": "Email Subject",
  "emailBody": "Email Body following the exact structure above",
  "linkedInDM": "LinkedIn DM Content",
  "followUpEmail": "Follow-up Email Content"
}
`;

  const userContent = resumeInfo ? PromptBuilder.build(resumeInfo, prompt) : prompt;

  console.log("\n=================== SYSTEM PROMPT SENT TO GEMINI ===================");
  console.log(systemPrompt);
  console.log("=====================================================================");

  while (attempt < maxAttempts && !validationResult.isValid) {
    attempt++;
    console.log(`\n--- Generation Attempt ${attempt}/${maxAttempts} ---`);

    try {
      const messages = [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userContent,
        }
      ];

      // If we failed previous attempts, append feedback to the request
      if (feedbackText) {
        messages.push({
          role: "user",
          content: `Your previous generation failed constraints with the following validation errors:\n${feedbackText}\n\nPlease regenerate the cold email correcting these errors, strictly adhering to the 170-word limit, single project limit, and structure layout.`
        });
      }

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openrouter/free",
          messages: messages,
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

      const choices = response.data?.choices;
      if (!choices || choices.length === 0) {
        const apiError = response.data?.error?.message || "Invalid response structure from AI model";
        throw new Error(apiError);
      }

      const aiResponse = choices[0]?.message?.content;
      if (!aiResponse) {
        throw new Error("No content returned from AI model");
      }

      parsedData = extractJSON(aiResponse);
      if (!parsedData) {
        console.error("Attempt failed to parse JSON:", aiResponse);
        feedbackText = "AI response was not valid JSON. Ensure you return strictly valid JSON and nothing else.";
        continue;
      }

      // Run programmatic validator
      validationResult = validateColdEmail(parsedData, resumeInfo);
      if (!validationResult.isValid) {
        console.warn(`Validation failed on attempt ${attempt}:`, validationResult.reason);
        feedbackText = validationResult.reason;
      } else {
        console.log(`Validation succeeded on attempt ${attempt}!`);
      }

    } catch (err) {
      console.error(`Error on generation attempt ${attempt}:`, err.message);
      if (attempt === maxAttempts) {
        return res.status(500).json({
          message: "Error generating email after multiple attempts",
          error: err.message,
        });
      }
    }
  }

  if (!validationResult.isValid || !parsedData) {
    return res.status(500).json({
      message: "Generated email failed structural validation constraints. Please try again.",
      error: feedbackText
    });
  }

  try {
    const { subject, emailBody, linkedInDM, followUpEmail } = parsedData;

    await EmailHistory.create({
      user: req.user._id,
      Prompt: prompt,
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
    console.error("Error saving email history:", error.message);
    return res.status(500).json({
      message: "Error saving email history",
      error: error.message,
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