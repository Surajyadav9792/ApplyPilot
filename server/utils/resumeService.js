const axios = require("axios");

/**
 * Extracts structured information (Name, Skills, Education, Experience, Projects) from resume text using Gemini via OpenRouter.
 * @param {string} resumeText - The plain text extracted from the PDF resume.
 * @returns {Promise<object>} - Structured resume data matching the requested schema.
 */
const parseResumeText = async (resumeText) => {
  if (!resumeText) {
    throw new Error("resumeText is required");
  }

  const systemPrompt = `
You are a precise resume parser.
Extract the following structured information from the provided resume text:
- Name (string)
- Skills (list of strings)
- Education (list of strings)
- Experience (list of strings)
- Projects (list of strings)

Return ONLY valid JSON in the following format:
{
  "name": "...",
  "skills": ["...", "..."],
  "education": ["...", "..."],
  "experience": ["...", "..."],
  "projects": ["...", "..."]
}
`;

  try {
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
            content: resumeText,
          },
        ],
        max_tokens: 1500,
        temperature: 0.2, // Low temperature for extraction accuracy
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiResponse = response.data.choices[0].message.content;

    // Clean up any markdown code block wrappers
    let cleanResponse = aiResponse.trim();
    if (cleanResponse.startsWith("```")) {
      cleanResponse = cleanResponse.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
    }
    
    // Extract JSON block using regex to avoid preamble text
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanResponse = jsonMatch[0];
    }

    const parsedData = JSON.parse(cleanResponse);
    
    // Fallbacks to ensure output matches requested keys
    return {
      name: parsedData.name || "",
      skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
      education: Array.isArray(parsedData.education) ? parsedData.education : [],
      experience: Array.isArray(parsedData.experience) ? parsedData.experience : [],
      projects: Array.isArray(parsedData.projects) ? parsedData.projects : [],
    };
  } catch (error) {
    console.error("Error in Resume Service AI call:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || error.message);
  }
};

module.exports = { parseResumeText };
