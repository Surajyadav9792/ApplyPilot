import { SparklesIcon } from "@heroicons/react/24/outline";
import ApplyPilotLogo from "./ApplyPilotLogo";

export default function Footer() {
  return (
    <footer
      className="border-t py-8 mt-auto"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
            <ApplyPilotLogo
              iconSize="w-6 h-6"
              textSize="text-base"
              textColor="text-white"
            />
            <span className="ml-1 border-l border-white/15 pl-3">
              &copy; {new Date().getFullYear()}
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Apply Smarter. Get More Interviews.
          </p>
        </div>
      </div>
    </footer>
  );
}
