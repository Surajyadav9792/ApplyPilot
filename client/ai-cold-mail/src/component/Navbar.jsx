import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import ApplyPilotLogo from "./ApplyPilotLogo";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
      isActive(path)
        ? "text-[var(--text-primary)] bg-slate-100"
        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-50"
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[var(--border-subtle)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2"
          >
            <ApplyPilotLogo
              iconSize="w-8.5 h-8.5"
              textSize="text-lg"
              textColor="text-[var(--text-primary)]"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className={navLinkClass("/dashboard")}>
                  Dashboard
                </Link>
                <Link to="/history" className={navLinkClass("/history")}>
                  History
                </Link>
                <div className="w-px h-5 bg-[var(--border-subtle)] mx-2" />
                <span className="text-sm text-[var(--text-muted)] px-2 font-medium">
                  {user?.username || user?.email}
                </span>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={navLinkClass("/login")}>
                  Login
                </Link>
                <Link to="/register" className="btn-gradient text-sm !py-2 !px-4 flex items-center justify-center">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-[var(--border-subtle)] bg-white space-y-1">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-4 py-2.5 rounded-md text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-50"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/history"
                  className="block px-4 py-2.5 rounded-md text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-50"
                  onClick={() => setMobileOpen(false)}
                >
                  History
                </Link>
                <div className="border-t border-[var(--border-subtle)] my-2" />
                <div className="px-4 py-1.5 text-xs text-[var(--text-muted)] font-medium">
                  Signed in as: {user?.username || user?.email}
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2.5 rounded-md text-sm text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-2.5 rounded-md text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-50"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block mx-4 my-2 py-2 rounded-md text-sm font-medium text-center text-white bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
