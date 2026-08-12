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
  useState,
} from "react";

import {
  loginUser,
} from "@/lib/auth";


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

      router.push(
        "/dashboard"
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


  return (
    <form
      className="auth-form"
      onSubmit={
        handleSubmit
      }
    >
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
                "#66616e",

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
                "#66616e",

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
            placeholder="Password"
            style={{
              paddingLeft: 44,
              paddingRight: 48,
            }}
            value={password}
            onChange={(
              event
            ) =>
              setPassword(
                event.target.value
              )
            }
            autoComplete="current-password"
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
                "#77717f",

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
              "#ff7b8d",

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
          ? "Signing in..."
          : "Sign In"}


        {!loading && (
          <ArrowRight
            size={17}
          />
        )}
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