import { useState } from "react";
import {
  ClipboardDocumentIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function StructuredEmailOutput({
  greeting, setGreeting,
  opening, setOpening,
  projectHighlight, setProjectHighlight,
  skills, setSkills,
  cta, setCta,
  name, setName,
  phone, setPhone,
  email, setEmail,
  github, setGithub,
  linkedin, setLinkedin
}) {
  const [copied, setCopied] = useState(false);

  const getFullEmailText = () => {
    const sigText = `${name}\nPhone: ${phone}\nEmail: ${email}\nGitHub: ${github}\nLinkedIn: ${linkedin}`;
    return `${greeting}\n\n${opening}\n\n${projectHighlight}\n\n${skills}\n\n${cta}\n\n${sigText}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getFullEmailText());
      setCopied(true);
      toast.success("Copied full email to clipboard!", {
        style: {
          background: "var(--bg-card)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-subtle)",
        },
        iconTheme: { primary: "var(--accent-color)", secondary: "#fff" },
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="glass-card p-6 space-y-6 text-left">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">✉️</span>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Structured Email Sections
          </h3>
        </div>
        <button
          onClick={handleCopy}
          className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-[var(--text-secondary)] hover:text-[var(--accent-color)] flex items-center gap-1.5 text-xs font-medium"
          title="Copy full email"
        >
          {copied ? (
            <>
              <CheckIcon className="w-4 h-4 text-green-600" />
              <span className="text-green-600">Copied</span>
            </>
          ) : (
            <>
              <ClipboardDocumentIcon className="w-4 h-4" />
              <span>Copy Full Email</span>
            </>
          )}
        </button>
      </div>

      {/* Greeting */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[var(--accent-color)] tracking-wider uppercase block">
          Greeting
        </label>
        <input
          type="text"
          value={greeting}
          onChange={(e) => setGreeting(e.target.value)}
          className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] focus:outline-none focus:border-[var(--border-focus)] transition-colors"
        />
      </div>

      {/* Opening */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[var(--accent-color)] tracking-wider uppercase block">
          Opening Paragraph (Goal & Context)
        </label>
        <textarea
          rows={3}
          value={opening}
          onChange={(e) => setOpening(e.target.value)}
          className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] focus:outline-none focus:border-[var(--border-focus)] transition-colors resize-y leading-relaxed"
        />
      </div>

      {/* Project Highlight */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[var(--accent-color)] tracking-wider uppercase block">
          Project Highlight (Impact Pitch)
        </label>
        <textarea
          rows={3}
          value={projectHighlight}
          onChange={(e) => setProjectHighlight(e.target.value)}
          className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] focus:outline-none focus:border-[var(--border-focus)] transition-colors resize-y leading-relaxed"
        />
      </div>

      {/* Skills */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[var(--accent-color)] tracking-wider uppercase block">
          Core Technical Skills
        </label>
        <input
          type="text"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] focus:outline-none focus:border-[var(--border-focus)] transition-colors"
        />
      </div>

      {/* CTA */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[var(--accent-color)] tracking-wider uppercase block">
          Call to Action
        </label>
        <input
          type="text"
          value={cta}
          onChange={(e) => setCta(e.target.value)}
          className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] focus:outline-none focus:border-[var(--border-focus)] transition-colors"
        />
      </div>

      {/* Signature Grid */}
      <div className="space-y-3 pt-2 border-t border-[var(--border-subtle)]">
        <label className="text-xs font-bold text-[var(--accent-color)] tracking-wider uppercase block">
          Candidate Signature
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-[var(--text-muted)] font-medium block">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-secondary)] focus:outline-none focus:border-[var(--border-focus)] transition-colors"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-[var(--text-muted)] font-medium block">Phone</span>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-secondary)] focus:outline-none focus:border-[var(--border-focus)] transition-colors"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-[var(--text-muted)] font-medium block">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-secondary)] focus:outline-none focus:border-[var(--border-focus)] transition-colors"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-[var(--text-muted)] font-medium block">GitHub</span>
            <input
              type="text"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-secondary)] focus:outline-none focus:border-[var(--border-focus)] transition-colors"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <span className="text-[10px] text-[var(--text-muted)] font-medium block">LinkedIn</span>
            <input
              type="text"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-secondary)] focus:outline-none focus:border-[var(--border-focus)] transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
