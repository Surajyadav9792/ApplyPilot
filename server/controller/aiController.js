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

// Normalize AI response field names to expected camelCase format
function normalizeEmailData(data) {
  if (!data) return null;
  
  // Helper: find a value from multiple possible keys
  const pick = (...keys) => {
    for (const k of keys) {
      if (data[k] !== undefined && data[k] !== null) return data[k];
    }
    return undefined;
  };

  // Map common alternative field names
  const normalized = {
    subject: pick("subject", "Subject", "email_subject", "emailSubject"),
    greeting: pick("greeting", "Greeting", "salutation", "Salutation"),
    opening: pick("opening", "Opening", "introduction", "Introduction", "intro"),
    projectHighlight: pick("projectHighlight", "project_highlight", "ProjectHighlight", "project", "Project", "projects"),
    skills: pick("skills", "Skills", "technical_skills", "technicalSkills"),
    cta: pick("cta", "CTA", "Cta", "call_to_action", "callToAction"),
    signature: pick("signature", "Signature", "sign", "contact"),
    linkedInDM: pick("linkedInDM", "linkedin_dm", "LinkedInDM", "linkedinDM", "linkedin_message"),
    followUpEmail: pick("followUpEmail", "follow_up_email", "FollowUpEmail", "followup_email", "followUp"),
  };

  // Normalize signature sub-fields
  if (normalized.signature && typeof normalized.signature === "object") {
    const sig = normalized.signature;
    normalized.signature = {
      name: sig.name || sig.Name || "",
      phone: sig.phone || sig.Phone || sig.phone_number || "",
      email: sig.email || sig.Email || sig.email_address || "",
      github: sig.github || sig.GitHub || sig.github_link || "",
      linkedin: sig.linkedin || sig.LinkedIn || sig.linkedin_link || "",
    };
  }

  return normalized;
}

// Reconstruct flat email body from structured JSON for validation/compatibility
function buildBodyText(data) {
  const { greeting, opening, projectHighlight, skills, cta, signature } = data;
  const name = signature?.name || "";
  const phone = signature?.phone || "";
  const email = signature?.email || "";
  const github = signature?.github || "";
  const linkedin = signature?.linkedin || "";
  const sigText = `${name}\nPhone: ${phone}\nEmail: ${email}\nGitHub: ${github}\nLinkedIn: ${linkedin}`;
  
  return `${greeting || ""}\n\n${opening || ""}\n\n${projectHighlight || ""}\n\n${skills || ""}\n\n${cta || ""}\n\n${sigText}`;
}

// Programmatic cold email validator with strict 7-point check
function validateColdEmail(emailData, resumeInfo) {
  const { subject, greeting, opening, projectHighlight, skills, cta, signature } = emailData;
  if (!subject || !greeting || !opening || !projectHighlight || !skills || !cta || !signature) {
    return { isValid: false, reason: "Missing required structured email fields." };
  }

  const emailBody = buildBodyText(emailData);
  const lowerBody = emailBody.toLowerCase();

  // 1. Is it a cold email? (Must contain Greeting, CTA, and Signature)
  const hasGreeting = lowerBody.includes("hi ") || lowerBody.includes("dear ") || lowerBody.includes("hello");
  const hasCTA = lowerBody.includes("call") || lowerBody.includes("chat") || lowerBody.includes("conversation") || lowerBody.includes("discussion") || lowerBody.includes("connect");
  const hasSignature = lowerBody.includes("github") && lowerBody.includes("linkedin");
  if (!hasGreeting || !hasCTA || !hasSignature) {
    return { isValid: false, reason: "Does not follow the basic structure of a cold email (missing Greeting, CTA, or Signature links)." };
  }

  // 2. Is it a cover letter? (If paragraphs are > 3 lines, or contains formal cover letter greetings/cliches)
  const paragraphs = [opening, projectHighlight, skills, cta];
  for (const para of paragraphs) {
    if (para) {
      const lines = para.split("\n").filter(l => l.trim().length > 0);
      if (lines.length > 3) {
        return { isValid: false, reason: "One of the sections exceeds 3 lines, which resembles a cover letter." };
      }
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

You MUST return the output as a valid JSON object in the following format:
{
  "subject": "Catchy email subject line",
  "greeting": "Greeting line (e.g. Hi [Recruiter Name], or Hi Hiring Team,)",
  "opening": "Opening paragraph (Exactly 2-3 lines max) mentioning the company name and explaining interest in the company.",
  "projectHighlight": "Project highlight paragraph (Exactly 1 project, max 2 lines max) describing the impact of one project.",
  "skills": "Skills paragraph (Exactly one sentence max) listing 4-5 core technical skills that align with the job.",
  "cta": "CTA paragraph (Exactly one sentence max) asking for a short chat.",
  "signature": {
    "name": "Candidate Name",
    "phone": "Candidate Phone Number",
    "email": "Candidate Email Address",
    "github": "Candidate GitHub Link",
    "linkedin": "Candidate LinkedIn Link"
  },
  "linkedInDM": "LinkedIn DM Content",
  "followUpEmail": "Follow-up Email Content"
}

CRITICAL RULES:
1. The combined greeting + opening + projectHighlight + skills + cta + signature text must be under 170 words.
2. Never mention more than one project.
3. Never write opening or projectHighlight sections longer than 3 lines.
4. Never include candidate's CGPA.
5. NEVER use AI clichés like "I hope this email finds you well", "I hope you are doing well", "I am writing to express my interest", or "I recently came across your profile". Start directly and naturally.
6. Do not list more than 5 technology names in total.

IMPORTANT: Return ONLY the raw JSON object. No markdown, no code fences, no explanation, no text before or after the JSON.
`;

  const userContent = resumeInfo ? PromptBuilder.build(resumeInfo, prompt) : prompt;

  console.log("\n=================== SYSTEM PROMPT SENT TO GEMINI ===================");
  console.log(systemPrompt);
  console.log("=====================================================================");

  let lastAiResponse = "";

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

      // If we failed previous attempts, append feedback to the request (with correct alternating roles)
      if (attempt > 1 && lastAiResponse && feedbackText) {
        messages.push({
          role: "assistant",
          content: lastAiResponse,
        });
        messages.push({
          role: "user",
          content: `Your previous generation failed constraints with the following validation errors:\n${feedbackText}\n\nPlease regenerate the cold email correcting these errors, strictly adhering to the 170-word limit, single project limit, and JSON structure.`
        });
      }

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openrouter/free",
          messages: messages,
          max_tokens: 2048,
          temperature: 0.7,
          response_format: { type: "json_object" },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 60000, // 60 second timeout per attempt
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

      lastAiResponse = aiResponse;

      parsedData = extractJSON(aiResponse);
      if (!parsedData) {
        console.error("Attempt failed to parse JSON:", aiResponse);
        feedbackText = "AI response was not valid JSON. Ensure you return strictly valid JSON matching the schema and nothing else.";
        continue;
      }

      // Normalize field names (model may return snake_case or different keys)
      parsedData = normalizeEmailData(parsedData);

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
    const { subject, linkedInDM, followUpEmail } = parsedData;
    const emailBodyText = buildBodyText(parsedData);

    await EmailHistory.create({
      user: req.user._id,
      Prompt: prompt,
      subject,
      emailBody: emailBodyText, // Formatted text for database schema compatibility
      linkedInDM,
      followUpEmail,
    });

    return res.status(200).json({
      message: "Email generated successfully",
      data: parsedData // Return structured object to the frontend
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