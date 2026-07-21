const axios = require("axios");

/**
 * Service to parse raw resume text into structured JSON format using Gemini via OpenRouter.
 */
class ResumeIntelligence {
  /**
   * Converts raw resume text into structured information.
   * @param {string} resumeText - The plain text extracted from the PDF resume.
   * @returns {Promise<object>} - Structured resume data matching the requested schema.
   */
  static async parse(resumeText) {
    if (!resumeText) {
      throw new Error("Resume text is required");
    }

    const systemPrompt = `
You are a precise resume parser.
Extract the following structured information from the provided resume text:
- name (string)
- role (string, e.g. Frontend Engineer, Full Stack Developer, etc.)
- skills (list of strings)
- projects (list of strings)
- education (list of strings)
- experience (list of strings)
- achievements (list of strings)

Return ONLY valid JSON in the following format:
{
  "name": "...",
  "role": "...",
  "skills": ["...", "..."],
  "projects": ["...", "..."],
  "education": ["...", "..."],
  "experience": ["...", "..."],
  "achievements": ["...", "..."]
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
          temperature: 0.2, // Low temperature for extraction factuality
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const aiResponse = response.data.choices[0].message.content;

      // Clean up markdown block wrappers and extract JSON
      let cleanResponse = aiResponse.trim();
      if (cleanResponse.startsWith("```")) {
        cleanResponse = cleanResponse.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
      }

      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanResponse = jsonMatch[0];
      }

      const parsedData = JSON.parse(cleanResponse);

      return {
        name: parsedData.name || "",
        role: parsedData.role || "",
        skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
        projects: Array.isArray(parsedData.projects) ? parsedData.projects : [],
        education: Array.isArray(parsedData.education) ? parsedData.education : [],
        experience: Array.isArray(parsedData.experience) ? parsedData.experience : [],
        achievements: Array.isArray(parsedData.achievements) ? parsedData.achievements : [],
      };
    } catch (error) {
      console.error("Error in ResumeIntelligence service:", error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || error.message);
    }
  }
}

module.exports = ResumeIntelligence;
