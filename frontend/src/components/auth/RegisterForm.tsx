"use client";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useState,
} from "react";

import {
  registerUser,
} from "@/lib/auth";


export default function RegisterForm() {
  const router =
    useRouter();

  const [
    fullName,
    setFullName,
  ] = useState("");

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
      await registerUser({
        full_name:
          fullName,

        email,
        password,
      });

      router.push(
        "/dashboard"
      );

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create account"
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <form
      className="auth-form"
      onSubmit={
        handleSubmit
      }
    >
      <div className="form-group">
        <label>
          Full name
        </label>


        <div
          style={{
            position:
              "relative",
          }}
        >
          <UserRound
            size={17}
            style={{
              position:
                "absolute",

              left: 15,
              top: 17,

              color:
                "var(--color-text-muted)",

              pointerEvents:
                "none",
            }}
          />


          <input
            className="form-input"
            placeholder="Your name"
            style={{
              paddingLeft: 44,
            }}
            value={
              fullName
            }
            onChange={(
              event
            ) =>
              setFullName(
                event.target.value
              )
            }
            autoComplete="name"
            required
          />
        </div>
      </div>


      <div className="form-group">
        <label>
          Email
        </label>


        <div
          style={{
            position:
              "relative",
          }}
        >
          <Mail
            size={17}
            style={{
              position:
                "absolute",

              left: 15,
              top: 17,

              color:
                "var(--color-text-muted)",

              pointerEvents:
                "none",
            }}
          />


          <input
            type="email"
            className="form-input"
            placeholder="you@example.com"
            style={{
              paddingLeft: 44,
            }}
            value={email}
            onChange={(
              event
            ) =>
              setEmail(
                event.target.value
              )
            }
            autoComplete="email"
            required
          />
        </div>
      </div>


      <div className="form-group">
        <label>
          Password
        </label>


        <div
          style={{
            position:
              "relative",
          }}
        >
          <LockKeyhole
            size={17}
            style={{
              position:
                "absolute",

              left: 15,
              top: 17,

              color:
                "var(--color-text-muted)",

              pointerEvents:
                "none",
            }}
          />


          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
            className="form-input"
            placeholder="Minimum 8 characters"
            style={{
              paddingLeft: 44,
              paddingRight: 48,
            }}
            value={
              password
            }
            onChange={(
              event
            ) =>
              setPassword(
                event.target.value
              )
            }
            autoComplete="new-password"
            minLength={8}
            required
          />


          <button
            type="button"
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            title={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            onClick={() =>
              setShowPassword(
                (current) =>
                  !current
              )
            }
            style={{
              position:
                "absolute",

              right: 12,
              top: "50%",

              transform:
                "translateY(-50%)",

              width: 32,
              height: 32,

              display:
                "grid",

              placeItems:
                "center",

              padding: 0,

              border: "none",

              borderRadius: 9,

              background:
                "transparent",

              color:
                "var(--color-text-muted)",

              cursor:
                "pointer",
            }}
          >
            {showPassword ? (
              <EyeOff
                size={17}
              />
            ) : (
              <Eye
                size={17}
              />
            )}
          </button>
        </div>
      </div>


      {error && (
        <p
          style={{
            marginBottom: 16,

            color:
              "var(--color-danger)",

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

          opacity:
            loading
              ? 0.7
              : 1,
        }}
        disabled={
          loading
        }
      >
        {loading
          ? "Creating account..."
          : "Create Account"}


        {!loading && (
          <ArrowRight
            size={17}
          />
        )}
      </button>


      <div className="auth-footer">
        Already have an account?{" "}

        <Link href="/login">
          Sign in
        </Link>
      </div>
    </form>
  );
}