"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function validate() {
    const errors: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters long.";
    }

    if (!formData.email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      errors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long.";
    } else if (!/[A-Za-z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      errors.password = "Password must include both letters and numbers.";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details && Array.isArray(data.details)) {
          const mapped: Record<string, string> = {};
          data.details.forEach((item: { field: string; message: string }) => {
            mapped[item.field] = item.message;
          });
          setFieldErrors(mapped);
        }
        setServerError(data.error || "Failed to create account. Please try again.");
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setIsLoading(false);

      // Redirect after 2 seconds to login
      setTimeout(() => {
        router.push("/login?registered=true");
      }, 2000);
    } catch {
      setServerError("An unexpected network error occurred. Please check your connection.");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-sand flex flex-col justify-between">
      {/* Header bar */}
      <header className="border-b border-black/5 bg-white py-4 px-6">
        <div className="container flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-base font-black text-white">
              S
            </span>
            <span className="text-xl font-black tracking-tight">
              shop<span className="text-brand">sphere</span>
              <span className="ml-1 align-top text-[9px] font-semibold text-slate-400">™</span>
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand transition"
          >
            <ArrowLeft size={15} /> Back to store
          </Link>
        </div>
      </header>

      {/* Main card */}
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-soft border border-black/5">
          {isSuccess ? (
            <div className="text-center py-6">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#e8f3ef] text-brand mb-4">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-2xl font-black text-ink">Account Created!</h2>
              <p className="mt-2 text-sm text-slate-600">
                Welcome to ShopSphere, <strong className="text-ink">{formData.name}</strong>.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Redirecting you to the sign-in page...
              </p>
              <div className="mt-6 flex justify-center">
                <Loader2 size={24} className="animate-spin text-brand" />
              </div>
              <div className="mt-6">
                <Link
                  href="/login"
                  className="text-xs font-bold text-brand hover:underline"
                >
                  Click here if you are not redirected automatically
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f3ef] px-3 py-1 text-[11px] font-bold text-brand">
                  <ShieldCheck size={14} /> Safe & Secure Registration
                </span>
                <h1 className="mt-3 text-2xl font-black text-ink">Create an account</h1>
                <p className="mt-1 text-xs text-slate-500">
                  Join ShopSphere to save favorite items, track your orders and enjoy faster checkout.
                </p>
              </div>

              {serverError && (
                <div
                  role="alert"
                  className="mb-5 flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800"
                >
                  <AlertCircle size={17} className="shrink-0 text-rose-600 mt-0.5" />
                  <p>{serverError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: "" });
                    }}
                    placeholder="e.g. Priya Sharma"
                    className={`w-full rounded-xl border bg-sand/40 px-3.5 py-2.5 text-sm outline-none transition focus:bg-white ${
                      fieldErrors.name
                        ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                        : "border-slate-200 focus:border-brand focus:ring-1 focus:ring-brand"
                    }`}
                  />
                  {fieldErrors.name && (
                    <p className="mt-1 text-xs text-rose-600">{fieldErrors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1">
                    Email address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: "" });
                    }}
                    placeholder="you@example.com"
                    className={`w-full rounded-xl border bg-sand/40 px-3.5 py-2.5 text-sm outline-none transition focus:bg-white ${
                      fieldErrors.email
                        ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                        : "border-slate-200 focus:border-brand focus:ring-1 focus:ring-brand"
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs text-rose-600">{fieldErrors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-xs font-bold text-slate-700 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: "" });
                      }}
                      placeholder="At least 8 characters"
                      className={`w-full rounded-xl border bg-sand/40 px-3.5 py-2.5 pr-10 text-sm outline-none transition focus:bg-white ${
                        fieldErrors.password
                          ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                          : "border-slate-200 focus:border-brand focus:ring-1 focus:ring-brand"
                      }`}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {fieldErrors.password ? (
                    <p className="mt-1 text-xs text-rose-600">{fieldErrors.password}</p>
                  ) : (
                    <p className="mt-1 text-[11px] text-slate-400">
                      Must contain 8+ characters, including letters and numbers.
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, confirmPassword: e.target.value });
                        if (fieldErrors.confirmPassword) {
                          setFieldErrors({ ...fieldErrors, confirmPassword: "" });
                        }
                      }}
                      placeholder="Re-enter password"
                      className={`w-full rounded-xl border bg-sand/40 px-3.5 py-2.5 pr-10 text-sm outline-none transition focus:bg-white ${
                        fieldErrors.confirmPassword
                          ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                          : "border-slate-200 focus:border-brand focus:ring-1 focus:ring-brand"
                      }`}
                    />
                    <button
                      type="button"
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-rose-600">{fieldErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-bold text-white shadow-md transition hover:bg-ink disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              <div className="mt-6 text-center text-xs text-slate-500">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-brand hover:underline">
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} ShopSphere. Safe and encrypted customer account management.
      </footer>
    </div>
  );
}

