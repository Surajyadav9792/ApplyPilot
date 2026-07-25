import { useState } from "react";
import api from "../utils/api";
import EmailOutputCard from "../component/EmailOutputCard";
import StructuredEmailOutput from "../component/StructuredEmailOutput";
import { SkeletonEmailOutput } from "../component/LoadingSkeleton";
import InputField from "../component/InputField";
import toast from "react-hot-toast";
import {
  PaperAirplaneIcon,
  SparklesIcon,
  ClipboardDocumentIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

export default function DashboardPage() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resume, setResume] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFilePath, setUploadedFilePath] = useState("");
  const [uploadedFilename, setUploadedFilename] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [recruiterEmailError, setRecruiterEmailError] = useState("");

  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [linkedInDM, setLinkedInDM] = useState("");
  const [followUpEmail, setFollowUpEmail] = useState("");

  // Predefined structured sections
  const [greeting, setGreeting] = useState("");
  const [opening, setOpening] = useState("");
  const [projectHighlight, setProjectHighlight] = useState("");
  const [skills, setSkills] = useState("");
  const [cta, setCta] = useState("");
  const [signatureName, setSignatureName] = useState("");
  const [signaturePhone, setSignaturePhone] = useState("");
  const [signatureEmail, setSignatureEmail] = useState("");
  const [signatureGithub, setSignatureGithub] = useState("");
  const [signatureLinkedin, setSignatureLinkedin] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please upload a PDF file only");
        return;
      }
      setResume(file);
      setUploadedFilePath("");
      setUploadedFilename("");
    }
  };

  const handleUpload = async () => {
    if (!resume) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("resume", resume);

    try {
      const res = await api.post("/upload-resume", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      if (res.data.success) {
        setUploadedFilePath(res.data.filePath);
        setUploadedFilename(res.data.filename);
        setResumeText(res.data.resumeText || "");
        toast.success("Resume uploaded successfully!");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to upload resume";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setResume(null);
    setUploadedFilePath("");
    setUploadedFilename("");
    setResumeText("");
  };

  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!recruiterEmail.trim()) {
      setRecruiterEmailError("Recruiter's email is required to send");
      toast.error("Please enter a recruiter's email address first");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(recruiterEmail.trim())) {
      setRecruiterEmailError("Please enter a valid email address");
      toast.error("Please enter a valid recruiter's email");
      return;
    }

    setSending(true);
    try {
      const sigText = `${signatureName}\nPhone: ${signaturePhone}\nEmail: ${signatureEmail}\nGitHub: ${signatureGithub}\nLinkedIn: ${signatureLinkedin}`;
      const fullBodyText = `${greeting}\n\n${opening}\n\n${projectHighlight}\n\n${skills}\n\n${cta}\n\n${sigText}`;

      const response = await api.post("/send-email", {
        to: recruiterEmail.trim(),
        subject: subject,
        body: fullBodyText,
        filePath: uploadedFilePath || null
      });

      if (response.data.success) {
        toast.success("Email sent successfully to recruiter!");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send email";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  const buildFullEmailText = () => {
    const signatureParts = [
      signatureName,
      signaturePhone ? `Phone: ${signaturePhone}` : "",
      signatureEmail ? `Email: ${signatureEmail}` : "",
      signatureGithub ? `GitHub: ${signatureGithub}` : "",
      signatureLinkedin ? `LinkedIn: ${signatureLinkedin}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    return `${greeting}\n\n${opening}\n\n${projectHighlight}\n\n${skills}\n\n${cta}\n\nBest regards,\n${signatureParts}`;
  };

  const handleCopyAll = async () => {
    const fullText = buildFullEmailText();
    try {
      await navigator.clipboard.writeText(fullText);
      toast.success("Full email copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleDownload = () => {
    const fullText = buildFullEmailText();
    const element = document.createElement("a");
    const file = new Blob([fullText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${subject || "cold-email"}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Email downloaded as .txt!");
  };

  const handleRecruiterEmailChange = (e) => {
    setRecruiterEmail(e.target.value);
    if (recruiterEmailError) setRecruiterEmailError("");
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    // Validate recruiter's email if entered
    if (recruiterEmail.trim() && !/\S+@\S+\.\S+/.test(recruiterEmail.trim())) {
      setRecruiterEmailError("Please enter a valid email address");
      toast.error("Please enter a valid recruiter's email");
      return;
    }

    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await api.post("/ai/generate-email", {
        prompt: prompt.trim(),
        resumeInfo: resumeText || null
      });
      const data = res.data.data;
      setResult(data);
      setSubject(data.subject || "");
      setGreeting(data.greeting || "");
      setOpening(data.opening || "");
      setProjectHighlight(data.projectHighlight || "");
      setSkills(data.skills || "");
      setCta(data.cta || "");
      setSignatureName(data.signature?.name || "");
      setSignaturePhone(data.signature?.phone || "");
      setSignatureEmail(data.signature?.email || "");
      setSignatureGithub(data.signature?.github || "");
      setSignatureLinkedin(data.signature?.linkedin || "");

      setLinkedInDM(data.linkedInDM || "");
      setFollowUpEmail(data.followUpEmail || "");
      toast.success("Email generated successfully!");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to generate email";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <SparklesIcon className="w-8 h-8 text-blue-600" />
            <span>
              Generate Cold Emails
            </span>
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Describe your outreach goal and let AI craft the perfect message.
          </p>
        </div>

        <form
          onSubmit={handleGenerate}
          className="card mb-8 animate-fade-in-up-delay-1 space-y-4"
        >
          <InputField
            id="recruiter-email"
            label="Recruiter's Email (Optional)"
            type="email"
            placeholder="recruiter@company.com"
            value={recruiterEmail}
            onChange={handleRecruiterEmailChange}
            error={recruiterEmailError}
            disabled={loading || uploading || sending}
          />

          <div className="space-y-1.5">
            <label
              htmlFor="email-prompt"
              className="block text-sm font-medium text-[var(--text-primary)]"
            >
              Your Prompt
            </label>
            <textarea
              id="email-prompt"
              rows={5}
              placeholder="e.g., I'm a freelance web developer reaching out to SaaS startups that need landing pages. I want to offer my services at a competitive rate with fast turnaround..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="input-field resize-y text-sm leading-relaxed"
              disabled={loading || uploading || sending}
            />
          </div>

          {/* Resume Upload UI */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Upload Resume (Optional PDF)
            </label>
            {!resume ? (
              <div className={`relative border-2 border-dashed border-[var(--border-subtle)] hover:border-[var(--border-default)] rounded-md p-4 transition-colors flex flex-col items-center justify-center cursor-pointer ${(loading || uploading || sending) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={loading || uploading || sending}
                />
                <svg
                  className="w-8 h-8 text-[var(--text-muted)] mb-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                  />
                </svg>
                <span className="text-xs text-[var(--text-muted)]">
                  Click or drag to upload PDF resume
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <svg
                    className="w-5 h-5 text-red-400 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                  <span className="text-sm text-[var(--text-secondary)] truncate">
                    {resume.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {!uploadedFilePath ? (
                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={loading || uploading || sending}
                      className="text-xs font-semibold text-white bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] disabled:opacity-50 px-3 py-1.5 rounded-md flex items-center gap-1.5"
                    >
                      {uploading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        "Upload"
                      )}
                    </button>
                  ) : (
                    <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-md flex items-center gap-1">
                      ✓ Uploaded
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    disabled={loading || uploading || sending}
                    className="text-xs font-semibold text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-md disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-[var(--text-muted)]">
              {prompt.length} characters
            </span>
            <button
              type="submit"
              disabled={loading || uploading || sending || !prompt.trim()}
              className="btn-gradient text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="w-4 h-4" />
                  Generate
                </>
              )}
            </button>
          </div>
        </form>

        {/* Loading Skeleton */}
        {loading && (
          <div className="animate-fade-in-up">
            <SkeletonEmailOutput />
          </div>
        )}        {/* Results */}
        {result && !loading && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                Generated Outreach Package
              </h2>
            </div>

            {/* Gmail-Style Message Card */}
            <div className="card !p-0 overflow-hidden bg-white rounded-lg shadow-sm border border-[var(--border-subtle)]">
              {/* Card Window Header */}
              <div className="bg-slate-50 border-b border-[var(--border-subtle)] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-xs text-[var(--text-muted)] font-medium ml-2">New Message</span>
                </div>
                <div className="text-xs text-[var(--text-muted)] font-medium">Draft</div>
              </div>

              {/* Recipients & Subject Fields */}
              <div className="border-b border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)]">
                <div className="px-4 py-2.5 flex items-center text-sm">
                  <span className="text-[var(--text-muted)] w-16 shrink-0 font-medium">To:</span>
                  <input
                    type="email"
                    value={recruiterEmail}
                    onChange={handleRecruiterEmailChange}
                    placeholder="recruiter@company.com"
                    className="w-full bg-transparent border-0 outline-none text-[var(--text-primary)] text-sm"
                    disabled={loading || sending}
                  />
                  {recruiterEmailError && (
                    <span className="text-[10px] text-red-600 font-semibold shrink-0 ml-2">
                      {recruiterEmailError}
                    </span>
                  )}
                </div>
                <div className="px-4 py-2.5 flex items-center text-sm">
                  <span className="text-[var(--text-muted)] w-16 shrink-0 font-medium">Subject:</span>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email Subject Line"
                    className="w-full bg-transparent border-0 outline-none text-[var(--text-primary)] text-sm font-semibold"
                    disabled={loading || sending}
                  />
                </div>
              </div>

              {/* Email Editor / Preview Body */}
              <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto bg-white">
                <StructuredEmailOutput
                  greeting={greeting} setGreeting={setGreeting}
                  opening={opening} setOpening={setOpening}
                  projectHighlight={projectHighlight} setProjectHighlight={setProjectHighlight}
                  skills={skills} setSkills={setSkills}
                  cta={cta} setCta={setCta}
                  name={signatureName} setName={setSignatureName}
                  phone={signaturePhone} setPhone={setSignaturePhone}
                  email={signatureEmail} setEmail={setSignatureEmail}
                  github={signatureGithub} setGithub={setSignatureGithub}
                  linkedin={signatureLinkedin} setLinkedin={setSignatureLinkedin}
                />

                {/* Attachment File Panel */}
                {uploadedFilePath && (
                  <div className="mt-4 p-2.5 rounded bg-slate-50 border border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1.5 font-medium text-[var(--text-primary)]">
                      📎 Attached: {uploadedFilename || "Resume.pdf"}
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-red-600 hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Gmail-Style Footer Bar */}
              <div className="bg-slate-50 border-t border-[var(--border-subtle)] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {/* Send Button */}
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={sending}
                    className="btn-gradient !h-9 px-4 text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    {sending ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="w-3.5 h-3.5" />
                        Send
                      </>
                    )}
                  </button>

                  {/* Regenerate Button */}
                  <button
                    type="button"
                    onClick={(e) => handleGenerate(e)}
                    disabled={loading}
                    className="btn-ghost !h-9 px-3 text-xs font-medium flex items-center justify-center gap-1"
                  >
                    <SparklesIcon className="w-3.5 h-3.5" />
                    Regenerate
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={handleCopyAll}
                    className="p-2 hover:bg-slate-200 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    title="Copy full email text"
                  >
                    <ClipboardDocumentIcon className="w-4 h-4" />
                  </button>

                  {/* Download Button */}
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="p-2 hover:bg-slate-200 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    title="Download text file"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <EmailOutputCard
              title="LinkedIn DM"
              icon="💬"
              content={linkedInDM}
              onChange={(e) => setLinkedInDM(e.target.value)}
            />
            <EmailOutputCard
              title="Follow-up Email"
              icon="🔄"
              content={followUpEmail}
              onChange={(e) => setFollowUpEmail(e.target.value)}
            />
          </div>
        )}

        {!result && !loading && (
          <div className="card py-12 px-6 text-center animate-fade-in-up-delay-2">
            <div className="w-12 h-12 rounded-full bg-slate-50 border border-[var(--border-subtle)] flex items-center justify-center mx-auto mb-4">
              <PaperAirplaneIcon className="w-6 h-6 text-[var(--text-muted)] -rotate-45" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Ready to Generate</h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
              Describe your target audience and outreach goal above, then hit
              Generate to create your cold email package.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
