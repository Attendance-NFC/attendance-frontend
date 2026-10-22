import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { setAuthToken } from "../auth/authToken";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export default function userLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError("");

    const nextEmailError = email.trim() ? "" : "Enter your email";
    const nextPasswordError = password.trim() ? "" : "Enter your password";
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    if (nextEmailError || nextPasswordError) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Backend sends the same message for "no such user" and
        // "wrong password" on purpose — just show it as-is.
        setServerError(data.error ?? "Something went wrong. Try again.");
        return;
      }

      console.log("Received token:", data.token); // TEMP — remove once you've confirmed this works
      setAuthToken(data.token);
      navigate("/admin");
    } catch {
      setServerError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#12151C] px-4"
      style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
    >
      <div className="w-full max-w-sm">
        {/* Mark + heading */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <ScanMark />
          <div className="text-center">
            <h1
              className="text-xl font-medium tracking-tight text-[#E8EAEF]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Sign in to the console
            </h1>
            <p className="mt-1 text-sm text-[#8B93A7]">
              Manage cards, access groups, and reader activity.
            </p>
          </div>
        </div>

        {/* Reticle-framed form panel */}
        <div className="relative">
          <CornerBracket className="left-0 top-0 rotate-0" />
          <CornerBracket className="right-0 top-0 rotate-90" />
          <CornerBracket className="bottom-0 right-0 rotate-180" />
          <CornerBracket className="bottom-0 left-0 -rotate-90" />

          <form
            onSubmit={onSubmit}
            className="border border-[#2A2F3B] bg-[#1B1F29] px-6 py-8"
            noValidate
          >
            <div className="mb-5">
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm text-[#8B93A7]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[#2A2F3B] bg-[#12151C] px-3 py-2 text-[#E8EAEF] outline-none placeholder:text-[#4A5163] focus-visible:border-[#E8A33D] focus-visible:ring-1 focus-visible:ring-[#E8A33D]"
                placeholder="you@school.edu"
              />
              {emailError && (
                <p className="mt-1.5 text-sm text-[#E8756A]">{emailError}</p>
              )}
            </div>

            <div className="mb-6">
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm text-[#8B93A7]"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[#2A2F3B] bg-[#12151C] px-3 py-2 text-[#E8EAEF] outline-none placeholder:text-[#4A5163] focus-visible:border-[#E8A33D] focus-visible:ring-1 focus-visible:ring-[#E8A33D]"
                placeholder="••••••••"
              />
              {passwordError && (
                <p className="mt-1.5 text-sm text-[#E8756A]">
                  {passwordError}
                </p>
              )}
            </div>

            {serverError && (
              <p className="mb-4 text-sm text-[#E8756A]">{serverError}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#E8A33D] py-2.5 text-sm font-medium text-[#12151C] transition-colors hover:bg-[#F0B25A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8A33D] disabled:opacity-60"
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>

            <div className="mt-5 text-center">
              <a
                href="#"
                className="text-sm text-[#8B93A7] underline decoration-[#2A2F3B] underline-offset-4 hover:text-[#E8EAEF]"
              >
                Forgot your password?
              </a>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-[#4A5163]">
          Staff and TA access only. Contact IT if you need an account.
        </p>
      </div>
    </div>
  );
}

// Small NFC-wave mark used above the heading — a tap/scan motif, not decoration.
function ScanMark() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <rect x="10" y="6" width="20" height="28" rx="2" stroke="#2A2F3B" strokeWidth="1.5" />
      <circle cx="20" cy="20" r="3" fill="#E8A33D" />
      <path
        d="M14 20a6 6 0 0 1 12 0"
        stroke="#E8A33D"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="motion-safe:animate-pulse"
        opacity="0.6"
      />
      <path
        d="M11 20a9 9 0 0 1 18 0"
        stroke="#E8A33D"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  );
}

// Targeting-reticle corner bracket, four of which frame the form panel.
function CornerBracket({ className }: { className: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={`absolute ${className}`}
    >
      <path d="M0 6V0H6" stroke="#E8A33D" strokeWidth="1.5" />
    </svg>
  );
}