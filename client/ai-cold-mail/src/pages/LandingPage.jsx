import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  SparklesIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  BoltIcon,
  ShieldCheckIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <EnvelopeIcon className="w-7 h-7" />,
      title: "AI-Powered Emails",
      desc: "Generate compelling cold emails with perfect subject lines that get opened and read.",
    },
    {
      icon: <ChatBubbleLeftRightIcon className="w-7 h-7" />,
      title: "LinkedIn DMs",
      desc: "Craft professional LinkedIn direct messages tailored to your outreach goals.",
    },
    {
      icon: <ArrowPathIcon className="w-7 h-7" />,
      title: "Smart Follow-ups",
      desc: "Auto-generate strategic follow-up emails to keep the conversation going.",
    },
  ];

  const steps = [
    {
      num: "01",
      icon: <BoltIcon className="w-6 h-6" />,
      title: "Describe Your Goal",
      desc: "Tell the AI about your target audience, product, and what you want to achieve.",
    },
    {
      num: "02",
      icon: <SparklesIcon className="w-6 h-6" />,
      title: "AI Generates Content",
      desc: "Our AI creates a complete outreach package — email, LinkedIn DM, and follow-up.",
    },
    {
      num: "03",
      icon: <ShieldCheckIcon className="w-6 h-6" />,
      title: "Copy & Send",
      desc: "Review, customize if needed, and send your perfectly crafted messages.",
    },
  ];

  return (
    <div className="page-enter w-full">
      {/* ══════ HERO ══════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background Orbs */}
        <div className="orb orb-violet w-[500px] h-[500px] -top-40 -left-40 animate-float" />
        <div
          className="orb orb-cyan w-[400px] h-[400px] -bottom-32 -right-32"
          style={{ animationDelay: "2s", animation: "float 8s ease-in-out infinite" }}
        />
        <div
          className="orb orb-indigo w-[300px] h-[300px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ opacity: 0.15 }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          {/* Badge */}
          <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-300 text-sm font-medium mb-8">
            <SparklesIcon className="w-4 h-4" />
            Powered by AI
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up-delay-1 text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight">
            Generate Cold Emails
            <br />
            <span className="gradient-text">That Get Replies</span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-in-up-delay-2 mt-6 text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Create professional cold emails, LinkedIn DMs, and strategic follow-ups
            in seconds with the power of AI. Stop guessing, start converting.
          </p>

          {/* CTAs */}
          <div className="animate-fade-in-up-delay-3 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? "/dashboard" : "/register"}
              className="btn-gradient text-base px-8 py-3.5 w-full sm:w-auto text-center"
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
            </Link>
            {!isAuthenticated && (
              <Link
                to="/login"
                className="btn-ghost text-base px-8 py-3.5 w-full sm:w-auto text-center"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="animate-fade-in-up-delay-3 mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto">
            {[
              { val: "10K+", label: "Emails Generated" },
              { val: "95%", label: "Open Rate" },
              { val: "3x", label: "More Replies" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold gradient-text">{stat.val}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ FEATURES ══════ */}
      <section className="py-24 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Everything You Need to{" "}
              <span className="gradient-text">Win Outreach</span>
            </h2>
            <p className="mt-4 text-[var(--text-secondary)] max-w-xl mx-auto">
              One prompt, four perfectly crafted outputs. We handle the copywriting
              so you can focus on closing deals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`glass-card p-8 text-center group cursor-default animate-fade-in-up-delay-${i + 1}`}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/10 flex items-center justify-center text-violet-400 group-hover:text-cyan-400 transition-colors mx-auto mb-5">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ HOW IT WORKS ══════ */}
      <section className="py-24 px-4 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="mt-4 text-[var(--text-secondary)]">
              Three simple steps to outreach perfection.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.num} className="relative group">
                {/* Connector Line (desktop) */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[calc(100%+0.5rem)] w-[calc(100%-3rem)] h-px bg-gradient-to-r from-violet-500/30 to-cyan-500/30" />
                )}
                <div className="glass-card p-8 text-center">
                  <span className="text-5xl font-black gradient-text opacity-30">
                    {s.num}
                  </span>
                  <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400 mx-auto mt-4 mb-4">
                    {s.icon}
                  </div>
                  <h3 className="text-base font-semibold mb-2">{s.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ CTA BANNER ══════ */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center glass-card p-12 relative overflow-hidden">
          <div className="orb orb-violet w-60 h-60 -top-20 -right-20" />
          <div className="orb orb-cyan w-40 h-40 -bottom-10 -left-10" />
          <div className="relative z-10">
            <ClockIcon className="w-10 h-10 text-violet-400 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Stop Writing Cold Emails From Scratch
            </h2>
            <p className="text-[var(--text-secondary)] mb-8 max-w-lg mx-auto">
              Join thousands of professionals who use ApplyPilot to generate
              high-converting outreach in seconds.
            </p>
            <Link
              to={isAuthenticated ? "/dashboard" : "/register"}
              className="btn-gradient text-base px-10 py-3.5"
            >
              {isAuthenticated ? "Open Dashboard" : "Start For Free"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
