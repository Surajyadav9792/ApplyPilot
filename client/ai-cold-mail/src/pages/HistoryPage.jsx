import { useState, useEffect } from "react";
import api from "../utils/api";
import { SkeletonCard } from "../component/LoadingSkeleton";
import {
  ClockIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  InboxIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/ai/email-history");
      setHistory(res.data);
    } catch (err) {
      toast.error("Failed to load history", {
        style: { background: "#1a1a2e", color: "#f0f0f5", border: "1px solid rgba(255,255,255,0.1)" },
      });
    } finally {
      setLoading(false);
    }
  };

  const filtered = history.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.Prompt?.toLowerCase().includes(q) ||
      item.subject?.toLowerCase().includes(q)
    );
  });

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="page-enter min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ClockIcon className="w-8 h-8 text-blue-600" />
            <span>
              Email History
            </span>
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Browse and revisit your previously generated emails.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6 animate-fade-in-up-delay-1">
          <MagnifyingGlassIcon className="w-5 h-5 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by prompt or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-12"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="card py-12 px-6 text-center animate-fade-in-up">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
              <InboxIcon className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {search ? "No Results Found" : "No History Yet"}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
              {search
                ? "Try a different search term."
                : "Generate your first cold email from the dashboard to see it here."}
            </p>
          </div>
        )}

        {/* History List */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-4 animate-fade-in-up-delay-1">
            {filtered.map((item) => (
              <HistoryItem
                key={item._id}
                item={item}
                isExpanded={expandedId === item._id}
                onToggle={() => toggleExpand(item._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── History Item ───────────────────────────
function HistoryItem({ item, isExpanded, onToggle }) {
  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0 mr-4">
          <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
            {item.subject || "Untitled"}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1 truncate">
            {item.Prompt}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {new Date(item.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" />
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-white/5 space-y-4 pt-4">
          <OutputBlock label="📧 Email Subject" content={item.subject} />
          <OutputBlock label="✉️ Email Body" content={item.emailBody} />
          <OutputBlock label="💬 LinkedIn DM" content={item.linkedInDM} />
          <OutputBlock label="🔄 Follow-up Email" content={item.followUpEmail} />
        </div>
      )}
    </div>
  );
}

// ─── Output Block (for history) ─────────────
function OutputBlock({ label, content }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Copied!", {
        style: { background: "#1a1a2e", color: "#f0f0f5", border: "1px solid rgba(255,255,255,0.1)" },
        iconTheme: { primary: "#8b5cf6", secondary: "#fff" },
        duration: 1500,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  if (!content) return null;

  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-[var(--text-secondary)]">
          {label}
        </span>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-[var(--text-muted)] hover:text-violet-400"
        >
          {copied ? (
            <CheckIcon className="w-3.5 h-3.5 text-green-400" />
          ) : (
            <ClipboardDocumentIcon className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
      <pre className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap font-[inherit] leading-relaxed">
        {content}
      </pre>
    </div>
  );
}
