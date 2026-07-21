/**
 * Service to construct highly personalized prompts for Gemini based on candidate profile JSON and job description.
 */
class PromptBuilder {
  /**
   * Generates a single prompt string for Gemini.
   * @param {object} candidateJson - Structured candidate data (name, role, skills, projects, education, experience, achievements).
   * @param {string} jobDescription - Target outreach job description or goal.
   * @returns {string} - The constructed prompt.
   */
  static build(candidateJson, jobDescription) {
    const formattedCandidate = typeof candidateJson === "string"
      ? candidateJson
      : JSON.stringify(candidateJson, null, 2);

    return `
Candidate Profile Data:
${formattedCandidate}

Target Job Description / Outreach Goal:
${jobDescription}

You are an expert cold email copywriter. Generate a professional cold email package for the target job description based strictly on the candidate's profile data.

CRITICAL RULES:
1. Read the candidate's profile data carefully.
2. Always use and incorporate the candidate's real Skills listed in their profile.
3. Always use and mention the candidate's real Projects and technologies listed in their profile.
4. Always use and mention the candidate's real Education details.
5. NEVER invent, exaggerate, or hallucinate skills or qualifications not present in the profile.
6. NEVER invent projects or accomplishments not present in the profile.
7. NEVER invent experience, past jobs, roles, or companies not present in the profile.
8. Use proper, professional formatting with clean paragraph breaks and spacing.
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
  }
}

/**
 * Backward compatibility helper function.
 */
const buildPrompt = (resumeInfo, jobDescription) => {
  return PromptBuilder.build(resumeInfo, jobDescription);
};

module.exports = { PromptBuilder, buildPrompt };

