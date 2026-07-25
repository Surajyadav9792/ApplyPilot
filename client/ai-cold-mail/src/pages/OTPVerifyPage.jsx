import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import ApplyPilotLogo from "../component/ApplyPilotLogo";

const OTP_LENGTH = 6;

export default function OTPVerifyPage() {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds
  const inputRefs = useRef([]);
  const { verifyOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  // Redirect if no email was passed
  useEffect(() => {
    if (!email) {
      navigate("/register", { replace: true });
    }
  }, [email, navigate]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace — go to previous input
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    // Focus the input after last pasted char
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== OTP_LENGTH) {
      toast.error("Please enter the complete OTP");
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(email, otpString);
      toast.success("Email verified successfully!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "OTP verification failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter min-h-screen flex items-center justify-center px-4 pt-20 pb-12 relative">

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4 relative">
            <ApplyPilotLogo iconOnly={true} iconSize="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">Verify Your Email</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            We sent a 6-digit code to{" "}
            <span className="text-blue-600 font-medium">{email}</span>
          </p>
        </div>

        {/* OTP Card */}
        <form
          onSubmit={handleSubmit}
          className="card space-y-6 animate-fade-in-up-delay-1"
        >
          {/* OTP Inputs */}
          <div className="flex items-center justify-center gap-3" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-bold input-field"
                style={{ padding: "0" }}
              />
            ))}
          </div>

          {/* Countdown */}
          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-sm text-[var(--text-muted)]">
                Code expires in{" "}
                <span className="text-violet-400 font-medium">
                  {formatTime(countdown)}
                </span>
              </p>
            ) : (
              <p className="text-sm text-red-400">OTP has expired. Please register again.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || countdown <= 0}
            className="btn-gradient w-full py-3 text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Email"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
