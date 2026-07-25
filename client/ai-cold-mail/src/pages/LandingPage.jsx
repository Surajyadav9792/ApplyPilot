import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  SparklesIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  CpuChipIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  const techFeatures = [
    {
      icon: <DocumentTextIcon className="w-6 h-6" />,
      title: "PDF Resume Parser",
      desc: "Uploads and extracts raw text from PDF resume files, sending clean candidate metadata to the backend.",
    },
    {
      icon: <CpuChipIcon className="w-6 h-6" />,
      title: "AI Generation Engine",
      desc: "Integrates with OpenRouter API using llama models to construct cold email copy based on prompt inputs.",
    },
    {
      icon: <AdjustmentsHorizontalIcon className="w-6 h-6" />,
      title: "Structured JSON Response",
      desc: "Enforces structured JSON completions to ensure clean section rendering and formatting on the frontend.",
    },
  ];

  const devSteps = [
    {
      num: "01",
      icon: <DocumentTextIcon className="w-5 h-5" />,
      title: "Upload & Parse",
      desc: "Select your PDF resume. The system parses your skills, projects, and contact info.",
    },
    {
      num: "02",
      icon: <CpuChipIcon className="w-5 h-5" />,
      title: "Input Target JD",
      desc: "Paste the recruiter's job description. The AI aligns your profile against the role.",
    },
    {
      num: "03",
      icon: <SparklesIcon className="w-5 h-5" />,
      title: "Edit & Send",
      desc: "Review the structured email sections, make adjustments, and send via SMTP integration.",
    },
  ];

  return (
    <div className="page-enter w-full max-w-4xl mx-auto px-4 py-16">
      {/* ══════ HERO ══════ */}
      <section className="text-center py-12">
        {/* Project Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6">
          <SparklesIcon className="w-3.5 h-3.5" />
          MERN Developer Portfolio Project
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight">
          ApplyPilot: AI Cold Email Generator
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
          A personal utility application built with React, Node.js, Express, and MongoDB. It parses your PDF resume, dynamically matches your background against a job description, and outputs tailored email copy.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={isAuthenticated ? "/dashboard" : "/register"}
            className="btn-gradient text-sm px-6 py-2.5 w-full sm:w-auto text-center"
          >
            {isAuthenticated ? "Go to Dashboard" : "Create Account"}
          </Link>
          {!isAuthenticated && (
            <Link
              to="/login"
              className="btn-ghost text-sm px-6 py-2.5 w-full sm:w-auto text-center"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Technical Specs */}
        <div className="mt-12 grid grid-cols-3 gap-4 border-t border-[var(--border-subtle)] pt-8 max-w-lg mx-auto">
          {[
            { val: "React 19", label: "Frontend SPA" },
            { val: "Node/Express", label: "Backend REST API" },
            { val: "MongoDB", label: "Data Persistence" },
          ].map((spec) => (
            <div key={spec.label} className="text-center">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{spec.val}</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{spec.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ TECHNICAL FEATURES ══════ */}
      <section className="py-12 border-t border-[var(--border-subtle)]">
        <div className="text-center mb-10">
          <h2 className="text-xl font-bold">Key Application Features</h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Technical modules implemented to handle data flow and generation.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {techFeatures.map((f) => (
            <div key={f.title} className="glass-card p-5 text-left">
              <div className="w-10 h-10 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-4">
                {f.icon}
              </div>
              <h3 className="text-sm font-semibold mb-1.5">{f.title}</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ ARCHITECTURE / PROCESS FLOW ══════ */}
      <section className="py-12 border-t border-[var(--border-subtle)]">
        <div className="text-center mb-10">
          <h2 className="text-xl font-bold">How the Pipeline Works</h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            End-to-end data processing flow from document upload to final copy.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {devSteps.map((s, i) => (
            <div key={s.num} className="relative">
              {/* Connector line (desktop) */}
              {i < devSteps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[calc(100%-1rem)] w-[calc(100%-2rem)] h-px bg-[var(--border-subtle)] z-0" />
              )}
              <div className="glass-card p-5 text-center relative z-10">
                <span className="text-2xl font-extrabold text-blue-600/25 block">
                  {s.num}
                </span>
                <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto mt-2 mb-3">
                  {s.icon}
                </div>
                <h3 className="text-xs font-semibold mb-1">{s.title}</h3>
                <p className="text-[11px] text-[var(--text-secondary)] leading-normal">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ CTA BANNER ══════ */}
      <section className="py-8">
        <div className="glass-card p-8 text-center">
          <h2 className="text-lg font-bold mb-2">
            Try Out ApplyPilot
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
            Create an account, upload a mock resume PDF, and test the custom email outputs for your portfolio applications.
          </p>
          <Link
            to={isAuthenticated ? "/dashboard" : "/register"}
            className="btn-gradient text-xs px-6 py-2"
          >
            {isAuthenticated ? "Open Developer Dashboard" : "Register Account"}
          </Link>
        </div>
      </section>
    </div>
  );
}
