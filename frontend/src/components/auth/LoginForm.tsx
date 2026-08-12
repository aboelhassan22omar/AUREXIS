"use client";

import {
  ArrowRight,
  LockKeyhole,
  Mail,
} from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { loginUser } from "@/lib/auth";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

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

      router.push("/dashboard");
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

  return (
    <form
      className="auth-form"
      onSubmit={handleSubmit}
    >
      <div className="form-group">
        <label>Email</label>

        <div style={{ position: "relative" }}>
          <Mail
            size={17}
            style={{
              position: "absolute",
              left: 15,
              top: 17,
              color: "#66616e",
            }}
          />

          <input
            type="email"
            className="form-input"
            placeholder="you@example.com"
            style={{ paddingLeft: 44 }}
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Password</label>

        <div style={{ position: "relative" }}>
          <LockKeyhole
            size={17}
            style={{
              position: "absolute",
              left: 15,
              top: 17,
              color: "#66616e",
            }}
          />

          <input
            type="password"
            className="form-input"
            placeholder="Password"
            style={{ paddingLeft: 44 }}
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
          />
        </div>
      </div>

      {error && (
        <p
          style={{
            marginBottom: 16,
            color: "#ff7b8d",
            fontSize: 13,
          }}
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        className="primary-button"
        style={{
          width: "100%",
          marginTop: 8,
          opacity: loading ? 0.7 : 1,
        }}
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign In"}

        {!loading && <ArrowRight size={17} />}
      </button>

      <div className="auth-footer">
        Don&apos;t have an account?{" "}
        <Link href="/register">
          Create one
        </Link>
      </div>
    </form>
  );
}