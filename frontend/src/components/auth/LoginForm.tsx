"use client";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useFormGaze } from "@/components/stage/gaze";
import {
  loginUser,
} from "@/lib/auth";


function getSafeNextPath(): string {
  const fallback = "/dashboard";

  if (typeof window === "undefined") {
    return fallback;
  }

  const next = new URLSearchParams(
    window.location.search
  ).get("next");

  if (
    !next ||
    !next.startsWith("/") ||
    next.startsWith("//")
  ) {
    return fallback;
  }

  try {
    const url = new URL(
      next,
      window.location.origin
    );

    if (
      url.origin !==
      window.location.origin
    ) {
      return fallback;
    }

    return (
      url.pathname +
      url.search +
      url.hash
    );
  } catch {
    return fallback;
  }
}


export default function LoginForm() {
  const router =
    useRouter();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await loginUser({
        email,
        password,
      });

      try {
        window.sessionStorage.setItem(
          "aurexis-robot-login-greeting-pending",
          "1"
        );

        window.sessionStorage.removeItem(
          "aurexis-robot-login-greeting-shown"
        );
      } catch {
        // The guide greeting is optional if sessionStorage is unavailable.
      }

      router.push(
        getSafeNextPath()
      );

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to sign in"
      );
    } finally {
      setLoading(false);
    }
  }


  const gaze = useFormGaze();

  useEffect(() => {
    gaze.setRevealed(showPassword);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPassword]);

  return (
    <form className="ax-form-grid" onSubmit={handleSubmit}>
      <label className="ax-field">
        <span className="ax-label">Email</span>
        <span className="ax-input-wrap">
          <Mail size={17} className="ax-input-icon" aria-hidden="true" />
          <input
            type="email"
            className="ax-input ax-input--icon"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            {...gaze.textField}
            required
          />
        </span>
      </label>
      <label className="ax-field">
        <span className="ax-label">Password</span>
        <span className="ax-input-wrap">
          <LockKeyhole size={17} className="ax-input-icon" aria-hidden="true" />
          <input
            type={showPassword ? "text" : "password"}
            className="ax-input ax-input--icon ax-input--action"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            {...gaze.passwordField}
            required
          />
          <button
            type="button"
            className="ax-input-action"
            aria-label={showPassword ? "Hide password" : "Show password"}
            title={showPassword ? "Hide password" : "Show password"}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </span>
      </label>

      <div className="ax-auth__actions">
        {error && (
          <p className="ax-form-status ax-form-status--error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="ax-btn ax-btn--primary ax-btn--lg ax-btn--block" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
          {!loading && <ArrowRight size={18} className="ax-arrow" />}
        </button>

        <p className="ax-auth__switch">
          Don&apos;t have an account?{" "}
          <Link href="/register">Create one</Link>
        </p>
      </div>
    </form>
  );
}
