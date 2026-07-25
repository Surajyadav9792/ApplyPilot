import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import InputField from "../component/InputField";
import toast from "react-hot-toast";
import { ArrowRightEndOnRectangleIcon } from "@heroicons/react/24/outline";
import ApplyPilotLogo from "../component/ApplyPilotLogo";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Enter a valid email address";
    if (!form.password) e.password = "Password is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = form.email.trim();
    
    const validationErrors = {};
    if (!trimmedEmail || !/\S+@\S+\.\S+/.test(trimmedEmail))
      validationErrors.email = "Enter a valid email address";
    if (!form.password) 
      validationErrors.password = "Password is required";

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      await login(trimmedEmail, form.password);
      toast.success("Welcome back!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || "Login failed";

      if (status === 403) {
        toast.error("Account not verified. Please verify your email first.");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const onChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  return (
    <div className="page-enter min-h-screen flex items-center justify-center px-4 pt-20 pb-12 relative">

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4 relative">
            <ApplyPilotLogo iconOnly={true} iconSize="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Sign in to continue generating emails
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="card space-y-5 animate-fade-in-up-delay-1"
        >
          <InputField
            id="login-email"
            label="Email"
            type="email"
            placeholder="john@example.com"
            value={form.email}
            onChange={onChange("email")}
            error={errors.email}
          />
          <InputField
            id="login-password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={onChange("password")}
            error={errors.password}
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-gradient w-full py-3 text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-sm text-[var(--text-secondary)] mt-6 animate-fade-in-up-delay-2">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
