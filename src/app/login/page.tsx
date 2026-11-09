"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, Loader2, Lock } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "true";
  const redirectPath = searchParams.get("redirect") || "/";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  function validate() {
    const errors: Record<string, string> = {};

    if (!formData.email.trim()) {
      errors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      errors.password = "Please enter your password.";
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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.error || "Invalid credentials. Please try again.");
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setIsLoading(false);

      // Navigate to destination
      setTimeout(() => {
        router.push(redirectPath);
        router.refresh();
      }, 1000);
    } catch {
      setServerError("A network error occurred. Please check your connection and try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-soft border border-black/5">
      {isSuccess ? (
        <div className="text-center py-6">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#e8f3ef] text-brand mb-4">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-2xl font-black text-ink">Welcome back!</h2>
          <p className="mt-2 text-sm text-slate-600">You have signed in successfully.</p>
          <div className="mt-6 flex justify-center">
            <Loader2 size={24} className="animate-spin text-brand" />
          </div>
          <p className="mt-2 text-xs text-slate-400">Redirecting to your store...</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f3ef] px-3 py-1 text-[11px] font-bold text-brand">
              <Lock size={13} /> Customer Sign In
            </span>
            <h1 className="mt-3 text-2xl font-black text-ink">Sign in to ShopSphere</h1>
            <p className="mt-1 text-xs text-slate-500">
              Access your personalized recommendations, saved cart, and order history.
            </p>
          </div>

          {registered && (
            <div
              role="status"
              className="mb-5 flex items-start gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800"
            >
              <CheckCircle2 size={17} className="shrink-0 text-brand mt-0.5" />
              <p>Your account was created successfully! Please sign in with your credentials.</p>
            </div>
          )}

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
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-xs font-bold text-slate-700">
                  Password <span className="text-rose-500">*</span>
                </label>
              </div>
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
                  placeholder="Enter your password"
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
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-rose-600">{fieldErrors.password}</p>
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
                  <Loader2 size={16} className="animate-spin" /> Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-bold text-brand hover:underline">
              Create one here
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function LoginPage() {
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
        <Suspense
          fallback={
            <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-soft border border-black/5 text-center py-12">
              <Loader2 size={28} className="animate-spin text-brand mx-auto mb-2" />
              <p className="text-xs text-slate-400">Loading sign-in form...</p>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} ShopSphere. Safe and encrypted customer account management.
      </footer>
    </div>
  );
}
