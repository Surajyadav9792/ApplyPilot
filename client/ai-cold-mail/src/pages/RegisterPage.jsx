import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import InputField from "../component/InputField";
import toast from "react-hot-toast";
import { SparklesIcon } from "@heroicons/react/24/outline";
import ApplyPilotLogo from "../component/ApplyPilotLogo";

export default function RegisterPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.username || form.username.length < 3 || form.username.length > 100)
      e.username = "Username must be 3–100 characters";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Enter a valid email address";
    if (!form.password || form.password.length < 6)
      e.password = "Password must be at least 6 characters";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedForm = {
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
    };
    
    // Run validation on trimmed values
    const validationErrors = {};
    if (!trimmedForm.username || trimmedForm.username.length < 3 || trimmedForm.username.length > 100)
      validationErrors.username = "Username must be 3–100 characters";
    if (!trimmedForm.email || !/\S+@\S+\.\S+/.test(trimmedForm.email))
      validationErrors.email = "Enter a valid email address";
    if (!trimmedForm.password || trimmedForm.password.length < 6)
      validationErrors.password = "Password must be at least 6 characters";

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      await register(trimmedForm.username, trimmedForm.email, trimmedForm.password);
      toast.success("Registration successful! Check your email for OTP.");
      navigate("/verify-otp", { state: { email: form.email } });
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      toast.error(msg);
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
          <h1 className="text-2xl font-bold">Create Your Account</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Start generating cold emails in seconds
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="card space-y-5 animate-fade-in-up-delay-1"
        >
          <InputField
            id="register-username"
            label="Username"
            placeholder="John Doe"
            value={form.username}
            onChange={onChange("username")}
            error={errors.username}
          />
          <InputField
            id="register-email"
            label="Email"
            type="email"
            placeholder="john@example.com"
            value={form.email}
            onChange={onChange("email")}
            error={errors.email}
          />
          <InputField
            id="register-password"
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
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-sm text-[var(--text-secondary)] mt-6 animate-fade-in-up-delay-2">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
