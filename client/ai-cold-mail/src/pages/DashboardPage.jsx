import { useState, useEffect } from "react";
import api from "../utils/api";
import {
  PaperAirplaneIcon,
  SparklesIcon,
  ClipboardDocumentIcon,
  ArrowDownTrayIcon,
  CheckIcon,
  ArrowPathIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathRoundedSquareIcon,
  EyeIcon,
  DocumentTextIcon,
  DocumentArrowDownIcon,
  ArrowUpTrayIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import InputField from "../component/InputField";

// Helper function to render text with highlighted variable badges (e.g. {{Name}} or [Name])
function highlightVariables(text) {
  if (!text) return "";
  
  // Matches [Placeholder Name] or {{PlaceholderName}}
  const regex = /(\[[^\]]+\]|\{\{[^\}]+\}\})/g;
  const parts = text.split(regex);
  
  return parts.map((part, index) => {
    if (part.match(regex)) {
      const cleanLabel = part.replace(/[\[\]\{\}]/g, "");
      
      let bg = "bg-violet-50 text-violet-700 border-violet-200";
      if (cleanLabel.toLowerCase().includes("company")) {
        bg = "bg-blue-50 text-blue-700 border-blue-200";
      } else if (
        cleanLabel.toLowerCase().includes("role") || 
        cleanLabel.toLowerCase().includes("position") || 
        cleanLabel.toLowerCase().includes("job")
      ) {
        bg = "bg-emerald-50 text-emerald-700 border-emerald-200";
      } else if (
        cleanLabel.toLowerCase().includes("project") || 
        cleanLabel.toLowerCase().includes("product")
      ) {
        bg = "bg-amber-50 text-amber-700 border-amber-200";
      } else if (cleanLabel.toLowerCase().includes("name")) {
        bg = "bg-purple-50 text-purple-700 border-purple-200";
      }
      
      return (
        <span 
          key={index} 
          className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold border ${bg} mx-0.5`}
        >
          {cleanLabel}
        </span>
      );
    }
    return part;
  });
}

// Function to calculate read time in seconds
function getReadTime(text) {
  if (!text) return "0 seconds";
  const words = text.trim().split(/\s+/).length;
  const seconds = Math.ceil((words / 200) * 60); // 200 words per minute average
  return `${seconds} second read`;
}

// Function to get word count
function getWordCount(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).length;
}

export default function DashboardPage() {
  // Inputs State
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [hiringManagerName, setHiringManagerName] = useState("");
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [prompt, setPrompt] = useState("");
  
  // File Upload State
  const [resume, setResume] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFilePath, setUploadedFilePath] = useState("");
  const [uploadedFilename, setUploadedFilename] = useState("");
  const [resumeText, setResumeText] = useState("");
  
  // Generation & Cache State
  const [loading, setLoading] = useState(false);
  const [toneLoading, setToneLoading] = useState(false);
  const [result, setResult] = useState(null); // Active result data
  const [activeTone, setActiveTone] = useState("Professional");
  
  // Stores generated packages per tone to prevent redundant network calls: { Professional: data, Friendly: data, ... }
  const [toneCache, setToneCache] = useState({});

  // UI state
  const [expandedCard, setExpandedCard] = useState("email"); // default expanded card: 'email', 'linkedin', 'followup'
  const [copiedState, setCopiedState] = useState({ email: false, linkedin: false, followup: false, all: false });
  const [recruiterEmailError, setRecruiterEmailError] = useState("");

  const getCombinedEmailBody = (res) => {
    if (!res) return "";
    if (res.greeting) {
      const name = res.signature?.name || "";
      const phone = res.signature?.phone ? `\nPhone: ${res.signature.phone}` : "";
      const email = res.signature?.email ? `\nEmail: ${res.signature.email}` : "";
      const github = res.signature?.github ? `\nGitHub: ${res.signature.github}` : "";
      const linkedin = res.signature?.linkedin ? `\nLinkedIn: ${res.signature.linkedin}` : "";
      const sigText = `Best regards,\n${name}${phone}${email}${github}${linkedin}`;
      return `${res.greeting}\n\n${res.opening}\n\n${res.projectHighlight}\n\n${res.skills}\n\n${res.cta}\n\n${sigText}`;
    }
    return res.emailBody || "";
  };

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

  // Generate outreach for a specific tone
  const generateForTone = async (targetTone, isRegeneratingAll = false) => {
    if (!jobDescription.trim()) {
      toast.error("Please enter a Job Description");
      return;
    }

    if (isRegeneratingAll) {
      setLoading(true);
      setToneCache({});
    } else {
      setToneLoading(true);
    }

    // Build compound prompt for backend
    const fullPromptText = `
Company Name: ${companyName || "Target Company"}
Hiring Manager: ${hiringManagerName || "Hiring Team"}
Job Description: ${jobDescription}
Additional requirements: ${prompt}
`.trim();

    try {
      const res = await api.post("/ai/generate-email", {
        prompt: fullPromptText,
        resumeInfo: resumeText || null,
        tone: targetTone
      });

      const data = res.data.data;
      
      // Update active state and cache
      setResult(data);
      setToneCache(prev => ({
        ...prev,
        [targetTone]: data
      }));
      setActiveTone(targetTone);
      
      if (isRegeneratingAll) {
        toast.success(`Outreach package generated!`);
      } else {
        toast.success(`Switched to ${targetTone} style`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to generate outreach";
      toast.error(msg);
    } finally {
      setLoading(false);
      setToneLoading(false);
    }
  };

  // Switch between tabs (Professional, Friendly, Recruiter, Startup Founder, Hiring Manager)
  const handleToneChange = async (targetTone) => {
    if (toneCache[targetTone]) {
      // Load from cache instantly
      setResult(toneCache[targetTone]);
      setActiveTone(targetTone);
      toast.success(`Switched to ${targetTone} (Loaded from cache)`);
    } else {
      // Fetch from API
      await generateForTone(targetTone);
    }
  };

  const handleCopy = async (cardType, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedState(prev => ({ ...prev, [cardType]: true }));
      toast.success("Copied to clipboard!");
      setTimeout(() => {
        setCopiedState(prev => ({ ...prev, [cardType]: false }));
      }, 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleCopyAll = async () => {
    if (!result) return;
    const emailBody = result.greeting ? `${result.greeting}\n\n${result.opening}\n\n${result.projectHighlight}\n\n${result.skills}\n\n${result.cta}\n\nBest regards,\n${result.signature?.name || ""}` : result.emailBody;
    
    const combinedText = `
--- COLD EMAIL ---
Subject: ${result.subject}

${emailBody}

--- LINKEDIN DM ---
${result.linkedInDM}

--- FOLLOW-UP EMAIL ---
${result.followUpEmail}
    `.trim();

    try {
      await navigator.clipboard.writeText(combinedText);
      setCopiedState(prev => ({ ...prev, all: true }));
      toast.success("Entire outreach package copied!");
      setTimeout(() => {
        setCopiedState(prev => ({ ...prev, all: false }));
      }, 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleDownloadTxt = () => {
    if (!result) return;
    const emailBody = result.greeting ? `${result.greeting}\n\n${result.opening}\n\n${result.projectHighlight}\n\n${result.skills}\n\n${result.cta}\n\nBest regards,\n${result.signature?.name || ""}` : result.emailBody;

    const txtContent = `
GENERATED OUTREACH PACKAGE (${activeTone.toUpperCase()})
==================================================

1. COLD EMAIL
--------------------------------------------------
Subject: ${result.subject}

${emailBody}

2. LINKEDIN DM
--------------------------------------------------
${result.linkedInDM}

3. FOLLOW-UP EMAIL
--------------------------------------------------
${result.followUpEmail}
    `.trim();

    const blob = new Blob([txtContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `outreach-package-${activeTone.toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Text file downloaded!");
  };

  const handleExportMarkdown = () => {
    if (!result) return;
    const emailBody = result.greeting ? `${result.greeting}\n\n${result.opening}\n\n${result.projectHighlight}\n\n${result.skills}\n\n${result.cta}\n\nBest regards,\n${result.signature?.name || ""}` : result.emailBody;

    const mdContent = `
# Generated Outreach Package (${activeTone})

## 📧 Cold Email
**Subject:** ${result.subject}

${emailBody}

## 💬 LinkedIn DM
${result.linkedInDM}

## 🔄 Follow-up Email
${result.followUpEmail}
    `.trim();

    const blob = new Blob([mdContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `outreach-package-${activeTone.toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Markdown file downloaded!");
  };

  const handleExportPDF = () => {
    if (!result) return;
    const emailBody = result.greeting ? `${result.greeting}\n\n${result.opening}\n\n${result.projectHighlight}\n\n${result.skills}\n\n${result.cta}\n\nBest regards,\n${result.signature?.name || ""}` : result.emailBody;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Outreach Package - ${activeTone}</title>
          <style>
            body { font-family: -apple-system, sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; max-width: 800px; margin: 0 auto; }
            h1 { font-size: 26px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 30px; }
            h2 { font-size: 18px; color: #4f46e5; margin-top: 40px; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; }
            pre { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; white-space: pre-wrap; font-family: inherit; font-size: 14px; margin-top: 10px; }
            .meta { color: #64748b; font-size: 12px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>ApplyPilot Outreach Package</h1>
          <div class="meta"><strong>Tone Variant:</strong> ${activeTone} | <strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
          
          <h2>📧 Cold Email</h2>
          <p><strong>Subject:</strong> ${result.subject}</p>
          <pre>${emailBody}</pre>
          
          <h2>💬 LinkedIn DM</h2>
          <pre>${result.linkedInDM}</pre>
          
          <h2>🔄 Follow-up Email</h2>
          <pre>${result.followUpEmail}</pre>
          
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSendEmail = async () => {
    if (!result) return;
    if (!recruiterEmail.trim()) {
      setRecruiterEmailError("Recruiter's email is required to send");
      toast.error("Please enter a recruiter's email address");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(recruiterEmail.trim())) {
      setRecruiterEmailError("Please enter a valid email address");
      toast.error("Invalid recruiter email");
      return;
    }

    const emailBody = result.greeting ? `${result.greeting}\n\n${result.opening}\n\n${result.projectHighlight}\n\n${result.skills}\n\n${result.cta}\n\nBest regards,\n${result.signature?.name || ""}` : result.emailBody;

    setUploading(true); // show general loading state
    try {
      const response = await api.post("/send-email", {
        to: recruiterEmail.trim(),
        subject: result.subject,
        body: emailBody,
        filePath: uploadedFilePath || null
      });

      if (response.data.success) {
        toast.success("Email sent successfully to recruiter!");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send email";
      const detailedErr = err.response?.data?.error ? ` (${err.response.data.error})` : "";
      toast.error(`${msg}${detailedErr}`);
    } finally {
      setUploading(false);
    }
  };

  // Tone options array
  const tones = ["Professional", "Friendly", "Recruiter", "Startup Founder", "Hiring Manager"];

  return (
    <div className="page-enter min-h-screen pt-24 pb-20 px-4 bg-slate-50/50">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Input and Configuration Panel (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <SparklesIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Configure Outreach</h2>
                  <p className="text-[11px] text-slate-500">Provide details for high-performing outreach</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Resume Upload Box */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Resume (PDF)
                  </label>
                  {!resume ? (
                    <div className="relative border border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 rounded-xl p-4 transition-all flex flex-col items-center justify-center cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={loading || uploading}
                      />
                      <ArrowUpTrayIcon className="w-5 h-5 text-slate-400 mb-1.5" />
                      <span className="text-[11px] text-slate-500 font-medium">
                        Upload resume to inject profile details
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/30 border border-indigo-100">
                      <div className="flex items-center gap-2 min-w-0">
                        <DocumentTextIcon className="w-5 h-5 text-indigo-500 shrink-0" />
                        <span className="text-xs text-slate-700 font-medium truncate">
                          {resume.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {!uploadedFilePath ? (
                          <button
                            type="button"
                            onClick={handleUpload}
                            disabled={uploading}
                            className="text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                          >
                            {uploading ? (
                              <div className="w-2.5 h-2.5 border border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              "Upload"
                            )}
                          </button>
                        ) : (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            ✓ Uploaded
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          disabled={uploading}
                          className="text-[10px] font-bold text-red-600 hover:bg-red-50 px-2 py-1.5 rounded-lg transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Company Name */}
                <InputField
                  id="company-name"
                  label="Company Name"
                  placeholder="e.g. Vercel, Linear"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={loading || uploading}
                />

                {/* Hiring Manager Name */}
                <InputField
                  id="hiring-manager"
                  label="Hiring Manager Name (Optional)"
                  placeholder="e.g. John Doe"
                  value={hiringManagerName}
                  onChange={(e) => setHiringManagerName(e.target.value)}
                  disabled={loading || uploading}
                />

                {/* Recruiter Email */}
                <InputField
                  id="recruiter-email"
                  label="Recruiter's Email (Optional)"
                  type="email"
                  placeholder="recruiter@company.com"
                  value={recruiterEmail}
                  onChange={(e) => {
                    setRecruiterEmail(e.target.value);
                    if (recruiterEmailError) setRecruiterEmailError("");
                  }}
                  error={recruiterEmailError}
                  disabled={loading || uploading}
                />

                {/* Job Description */}
                <div className="space-y-1">
                  <label htmlFor="job-description" className="block text-xs font-semibold text-slate-700">
                    Job Description / Outreach Goal
                  </label>
                  <textarea
                    id="job-description"
                    rows={6}
                    placeholder="Paste the job description details or summarize your target outreach goal..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="input-field resize-none text-xs leading-relaxed rounded-xl !py-2.5"
                    disabled={loading || uploading}
                  />
                </div>

                {/* Additional requirements prompt */}
                <div className="space-y-1">
                  <label htmlFor="additional-requirements" className="block text-xs font-semibold text-slate-700">
                    Additional Requirements (Optional)
                  </label>
                  <input
                    id="additional-requirements"
                    type="text"
                    placeholder="e.g. emphasize my React experience..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="input-field text-xs rounded-xl"
                    disabled={loading || uploading}
                  />
                </div>

                {/* Primary Generate Button */}
                <button
                  type="button"
                  onClick={() => generateForTone(activeTone, true)}
                  disabled={loading || uploading || !jobDescription.trim()}
                  className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating outreach...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-4 h-4" />
                      Generate Outreach
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Redesigned Outreach Panel (8 cols) */}
          <div className="lg:col-span-8">
            
            {/* EMPTY STATE */}
            {!result && !loading && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm max-w-2xl mx-auto animate-fade-in-up">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 flex items-center justify-center mx-auto mb-5">
                  <EnvelopeIcon className="w-8 h-8 text-indigo-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Generate Personalized Outreach
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed mb-6">
                  Upload your resume and let AI create personalized outreach messages for recruiters, founders, and hiring managers.
                </p>
                <button
                  type="button"
                  disabled={!jobDescription.trim()}
                  onClick={() => generateForTone(activeTone, true)}
                  className="inline-flex items-center gap-2 px-5 h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <SparklesIcon className="w-3.5 h-3.5" />
                  Generate Outreach
                </button>
              </div>
            )}

            {/* LOADING SKELETON */}
            {loading && (
              <div className="space-y-6 animate-fade-in-up">
                {/* Header Skeleton */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-3">
                  <div className="skeleton w-1/3 h-5 rounded-md" />
                  <div className="skeleton w-1/2 h-3.5 rounded-md" />
                </div>
                {/* Cards Skeleton */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="skeleton w-1/4 h-4 rounded-md" />
                    <div className="skeleton w-20 h-4 rounded-md" />
                  </div>
                  <div className="space-y-2">
                    <div className="skeleton w-full h-3 rounded-md" />
                    <div className="skeleton w-full h-3 rounded-md" />
                    <div className="skeleton w-2/3 h-3 rounded-md" />
                  </div>
                </div>
              </div>
            )}

            {/* GENERATED OUTREACH RESULTS */}
            {result && !loading && (
              <div className="space-y-6 animate-fade-in-up">
                
                {/* Section Header */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      Generated Outreach
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                      AI-generated personalized messages optimized for higher response rates.
                    </p>
                  </div>

                  {/* AI Quality Score Badge */}
                  <div className="flex items-center gap-4 shrink-0 bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                    <div className="text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">AI Quality Score</span>
                      <div className="text-xl font-extrabold text-indigo-600 mt-0.5">94<span className="text-xs text-slate-400 font-normal">/100</span></div>
                    </div>
                    <div className="h-8 w-px bg-slate-200" />
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] font-semibold text-slate-600">
                      <div className="flex items-center gap-1 text-emerald-600">✓ <span className="text-slate-500">Personalization</span></div>
                      <div className="flex items-center gap-1 text-emerald-600">✓ <span className="text-slate-500">Professional Tone</span></div>
                      <div className="flex items-center gap-1 text-emerald-600">✓ <span className="text-slate-500">CTA Alignment</span></div>
                      <div className="flex items-center gap-1 text-emerald-600">✓ <span className="text-slate-500">Low Spam Risk</span></div>
                    </div>
                  </div>
                </div>

                {/* OUTREACH CONTENT CARDS */}
                <div className="space-y-4 relative">
                  {toneLoading && (
                    <div className="absolute inset-0 bg-white/60 z-20 flex items-center justify-center rounded-2xl backdrop-blur-[1px]">
                      <div className="flex flex-col items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-md">
                        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-[11px] font-semibold text-slate-600">Switching tone...</span>
                      </div>
                    </div>
                  )}

                  {/* 1. COLD EMAIL CARD */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm transition-all hover:border-slate-300">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">📧</span>
                        <div>
                          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                            Cold Email
                            <span className="text-[9px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100/50 px-1.5 py-0.5 rounded-full">
                              Generated
                            </span>
                          </h3>
                          <p className="text-[10px] text-slate-400">Professional outreach email template</p>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopy("email", `Subject: ${result.subject}\n\n${result.greeting ? `${result.greeting}\n\n${result.opening}\n\n${result.projectHighlight}\n\n${result.skills}\n\n${result.cta}\n\nBest regards,\n${result.signature?.name || ""}` : result.emailBody}`)}
                          className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition-all"
                          title="Copy email to clipboard"
                        >
                          {copiedState.email ? (
                            <CheckIcon className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <ClipboardDocumentIcon className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => generateForTone(activeTone)}
                          className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition-all"
                          title="Regenerate email template"
                        >
                          <ArrowPathIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setExpandedCard(expandedCard === "email" ? null : "email")}
                          className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition-all text-xs font-semibold flex items-center gap-1"
                        >
                          {expandedCard === "email" ? "Collapse" : "Expand"}
                        </button>
                      </div>
                    </div>

                    {expandedCard === "email" && (
                      <div className="space-y-4">
                        {/* Variant Switcher Tabs */}
                        <div className="flex flex-wrap gap-1 p-1 bg-slate-50 border border-slate-100 rounded-xl max-w-max">
                          {tones.map((tone) => (
                            <button
                              key={tone}
                              onClick={() => handleToneChange(tone)}
                              className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                                activeTone === tone
                                  ? "bg-white text-indigo-600 shadow-sm border border-slate-200/30"
                                  : "text-slate-500 hover:text-slate-800"
                              }`}
                            >
                              {tone}
                            </button>
                          ))}
                        </div>

                        {/* Subject Card Display */}
                        <div className="bg-slate-50/50 border border-slate-100/50 rounded-xl p-3.5 flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide shrink-0">Subject</span>
                          <div 
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => {
                              const val = e.target.innerText;
                              setResult(prev => ({ ...prev, subject: val }));
                            }}
                            className="flex-1 border-l border-slate-200 pl-3 text-xs font-bold text-slate-800 outline-none focus:bg-slate-100/50 rounded p-1 transition-all cursor-text"
                            title="Click directly to edit subject"
                          >
                            {result.subject}
                          </div>
                        </div>

                        {/* Message Content Container */}
                        <div 
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const val = e.target.innerText;
                            setResult(prev => ({
                              ...prev,
                              greeting: null,
                              emailBody: val
                            }));
                          }}
                          className="bg-white border border-slate-200/50 rounded-xl p-5 text-slate-700 text-xs leading-relaxed whitespace-pre-wrap outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 cursor-text transition-all"
                          title="Click directly to edit email body"
                        >
                          {getCombinedEmailBody(result)}
                        </div>

                        {/* Recruiter Email input for live send */}
                        <div className="bg-slate-50/50 border border-slate-100/30 rounded-xl p-3 flex items-center gap-3">
                          <span className="text-[10px] font-semibold text-slate-500">Recruiter Email:</span>
                          <input
                            type="email"
                            placeholder="Add recruiter's email to send live"
                            value={recruiterEmail}
                            onChange={(e) => {
                              setRecruiterEmail(e.target.value);
                              if (recruiterEmailError) setRecruiterEmailError("");
                            }}
                            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-indigo-500 w-full max-w-xs"
                          />
                          <button
                            onClick={handleSendEmail}
                            disabled={uploading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold h-8 px-3 rounded-lg flex items-center gap-1.5"
                          >
                            <PaperAirplaneIcon className="w-3.5 h-3.5" />
                            Send Email
                          </button>
                        </div>

                        {/* Card Footer Meta */}
                        <div className="flex items-center gap-4 text-[10px] font-semibold text-slate-400 border-t border-slate-100 pt-3">
                          <span>{activeTone}</span>
                          <span>•</span>
                          <span>{getWordCount(result.greeting ? buildBodyText(result) : result.emailBody)} words</span>
                          <span>•</span>
                          <span>{getReadTime(result.greeting ? buildBodyText(result) : result.emailBody)}</span>
                        </div>

                        {/* AI Suggestions Panel */}
                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl mt-4">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-2">AI Suggestions</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600">
                            <div className="flex items-center gap-1.5">✓ <span>Add more personalization</span></div>
                            <div className="flex items-center gap-1.5">✓ <span>Mention a recent company achievement</span></div>
                            <div className="flex items-center gap-1.5">✓ <span>Improve Call-To-Action</span></div>
                            <div className="flex items-center gap-1.5">✓ <span>Keep greeting under 170 words</span></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. LINKEDIN DM CARD */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm transition-all hover:border-slate-300">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">💬</span>
                        <div>
                          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                            LinkedIn DM
                            <span className="text-[9px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100/50 px-1.5 py-0.5 rounded-full">
                              Generated
                            </span>
                          </h3>
                          <p className="text-[10px] text-slate-400">Short connection request pitch</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopy("linkedin", result.linkedInDM)}
                          className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition-all"
                          title="Copy connection pitch"
                        >
                          {copiedState.linkedin ? (
                            <CheckIcon className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <ClipboardDocumentIcon className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => generateForTone(activeTone)}
                          className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition-all"
                          title="Regenerate LinkedIn DM"
                        >
                          <ArrowPathIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setExpandedCard(expandedCard === "linkedin" ? null : "linkedin")}
                          className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition-all text-xs font-semibold flex items-center gap-1"
                        >
                          {expandedCard === "linkedin" ? "Collapse" : "Expand"}
                        </button>
                      </div>
                    </div>

                    {expandedCard === "linkedin" && (
                      <div className="space-y-4">
                        {/* Variant Switcher Tabs */}
                        <div className="flex flex-wrap gap-1 p-1 bg-slate-50 border border-slate-100 rounded-xl max-w-max">
                          {tones.map((tone) => (
                            <button
                              key={tone}
                              onClick={() => handleToneChange(tone)}
                              className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                                activeTone === tone
                                  ? "bg-white text-indigo-600 shadow-sm border border-slate-200/30"
                                  : "text-slate-500 hover:text-slate-800"
                              }`}
                            >
                              {tone}
                            </button>
                          ))}
                        </div>

                        {/* Content Container */}
                        <div 
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const val = e.target.innerText;
                            setResult(prev => ({ ...prev, linkedInDM: val }));
                          }}
                          className="bg-white border border-slate-200/50 rounded-xl p-5 text-slate-700 text-xs leading-relaxed whitespace-pre-wrap outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 cursor-text transition-all"
                          title="Click directly to edit connection pitch"
                        >
                          {result.linkedInDM}
                        </div>

                        {/* Card Footer Meta */}
                        <div className="flex items-center gap-4 text-[10px] font-semibold text-slate-400 border-t border-slate-100 pt-3">
                          <span>{activeTone}</span>
                          <span>•</span>
                          <span>{result.linkedInDM?.length || 0} characters</span>
                          <span>•</span>
                          <span>{getWordCount(result.linkedInDM)} words</span>
                        </div>

                        {/* AI Suggestions Panel */}
                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl mt-4">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-2">AI Suggestions</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600">
                            <div className="flex items-center gap-1.5">✓ <span>Keep connection requests under 300 characters</span></div>
                            <div className="flex items-center gap-1.5">✓ <span>Highlight one major project</span></div>
                            <div className="flex items-center gap-1.5">✓ <span>Use low-friction CTA (no hard sells)</span></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. FOLLOW-UP EMAIL CARD */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm transition-all hover:border-slate-300">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">🔄</span>
                        <div>
                          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                            Follow-up Email
                            <span className="text-[9px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100/50 px-1.5 py-0.5 rounded-full">
                              Generated
                            </span>
                          </h3>
                          <p className="text-[10px] text-slate-400">Polite follow-up message nudge</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopy("followup", result.followUpEmail)}
                          className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition-all"
                          title="Copy follow-up note"
                        >
                          {copiedState.followup ? (
                            <CheckIcon className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <ClipboardDocumentIcon className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => generateForTone(activeTone)}
                          className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition-all"
                          title="Regenerate Follow-up Email"
                        >
                          <ArrowPathIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setExpandedCard(expandedCard === "followup" ? null : "followup")}
                          className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition-all text-xs font-semibold flex items-center gap-1"
                        >
                          {expandedCard === "followup" ? "Collapse" : "Expand"}
                        </button>
                      </div>
                    </div>

                    {expandedCard === "followup" && (
                      <div className="space-y-4">
                        {/* Variant Switcher Tabs */}
                        <div className="flex flex-wrap gap-1 p-1 bg-slate-50 border border-slate-100 rounded-xl max-w-max">
                          {tones.map((tone) => (
                            <button
                              key={tone}
                              onClick={() => handleToneChange(tone)}
                              className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                                activeTone === tone
                                  ? "bg-white text-indigo-600 shadow-sm border border-slate-200/30"
                                  : "text-slate-500 hover:text-slate-800"
                              }`}
                            >
                              {tone}
                            </button>
                          ))}
                        </div>

                        {/* Content Container */}
                        <div 
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const val = e.target.innerText;
                            setResult(prev => ({ ...prev, followUpEmail: val }));
                          }}
                          className="bg-white border border-slate-200/50 rounded-xl p-5 text-slate-700 text-xs leading-relaxed whitespace-pre-wrap outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 cursor-text transition-all"
                          title="Click directly to edit follow-up email"
                        >
                          {result.followUpEmail}
                        </div>

                        {/* Card Footer Meta */}
                        <div className="flex items-center gap-4 text-[10px] font-semibold text-slate-400 border-t border-slate-100 pt-3">
                          <span>{activeTone}</span>
                          <span>•</span>
                          <span>{getWordCount(result.followUpEmail)} words</span>
                          <span>•</span>
                          <span>{getReadTime(result.followUpEmail)}</span>
                        </div>

                        {/* AI Suggestions Panel */}
                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl mt-4">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-2">AI Suggestions</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600">
                            <div className="flex items-center gap-1.5">✓ <span>Keep follow-up extremely brief</span></div>
                            <div className="flex items-center gap-1.5">✓ <span>Politely refer to previous communication</span></div>
                            <div className="flex items-center gap-1.5">✓ <span>Offer a new value update or demo link</span></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* BOTTOM EXPORT TOOLBAR */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 mt-6">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyAll}
                      className="px-3.5 h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedState.all ? (
                        <>
                          <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied All</span>
                        </>
                      ) : (
                        <>
                          <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                          <span>Copy All</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => generateForTone(activeTone, true)}
                      className="px-3.5 h-9 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowPathIcon className="w-3.5 h-3.5 animate-spin-slow" />
                      <span>Regenerate All</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportPDF}
                      className="p-2 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      title="Export package as PDF"
                    >
                      <DocumentArrowDownIcon className="w-4 h-4" />
                      <span>PDF</span>
                    </button>
                    <button
                      onClick={handleExportMarkdown}
                      className="p-2 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      title="Export package as Markdown"
                    >
                      <DocumentTextIcon className="w-4 h-4" />
                      <span>Markdown</span>
                    </button>
                    <button
                      onClick={handleDownloadTxt}
                      className="p-2 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      title="Download as TXT file"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      <span>TXT</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

// Function to construct email body from object properties
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
