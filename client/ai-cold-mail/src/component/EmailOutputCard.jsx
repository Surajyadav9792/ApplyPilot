import React, { useState } from "react";
import {
  ClipboardDocumentIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function EmailOutputCard({ title, icon, content, onChange }) {
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success(`${title} copied to clipboard!`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  if (!content) return null;

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="p-2 rounded-md hover:bg-slate-100 transition-colors text-[var(--text-secondary)] hover:text-[var(--accent-color)]"
            title="Copy to clipboard"
          >
            {copied ? (
              <CheckIcon className="w-4 h-4 text-green-600" />
            ) : (
              <ClipboardDocumentIcon className="w-4 h-4" />
            )}
          </button>
          {expanded ? (
            <ChevronUpIcon className="w-4 h-4 text-[var(--text-muted)]" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 text-[var(--text-muted)]" />
          )}
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-[var(--border-subtle)]">
          {onChange ? (
            <textarea
              value={content}
              onChange={onChange}
              className="mt-4 input-field min-h-[120px] resize-y leading-relaxed"
              rows={Math.max(4, content.split("\n").length)}
            />
          ) : (
            <pre className="mt-4 text-sm text-[var(--text-secondary)] whitespace-pre-wrap font-[inherit] leading-relaxed">
              {content}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
