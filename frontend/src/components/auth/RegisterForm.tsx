"use client";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import { setUnitGaze, useFormGaze } from "@/components/stage/gaze";
import { registerUser } from "@/lib/auth";

export default function RegisterForm() {
  const router = useRouter();
  const gaze = useFormGaze();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    gaze.setRevealed(showPassword);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPassword]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("The passwords don't match.");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        full_name: fullName,
        email,
        phone,
        password,
      });
      setUnitGaze("auto");
      router.push("/dashboard");
      router.refresh();
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : "Unable to create your account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="ax-form-grid ax-register" onSubmit={handleSubmit}>
      <label className="ax-field">
        <span className="ax-label">Full name</span>
        <span className="ax-input-wrap">
          <UserRound size={17} className="ax-input-icon" aria-hidden="true" />
          <input
            className="ax-input ax-input--icon"
            placeholder="Your name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            autoComplete="name"
            minLength={2}
            {...gaze.textField}
            required
          />
        </span>
      </label>

      <div className="ax-form-pair">
        <label className="ax-field">
          <span className="ax-label">Email</span>
          <span className="ax-input-wrap">
            <Mail size={17} className="ax-input-icon" aria-hidden="true" />
            <input
              type="email"
              className="ax-input ax-input--icon"
              placeholder="name@mail.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              {...gaze.textField}
              required
            />
          </span>
        </label>

        <label className="ax-field">
          <span className="ax-label">Phone</span>
          <span className="ax-input-wrap">
            <Phone size={17} className="ax-input-icon" aria-hidden="true" />
            <input
              type="tel"
              className="ax-input ax-input--icon"
              placeholder="+201001234567"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              autoComplete="tel"
              inputMode="tel"
              pattern="\+?[\d\s\-\(\)\.]{8,20}"
              title="Digits only, with an optional leading +"
              {...gaze.textField}
              required
            />
          </span>
        </label>
      </div>

      <div className="ax-form-pair ax-form-pair--keep">
        <label className="ax-field">
          <span className="ax-label">Password</span>
          <span className="ax-input-wrap">
            <LockKeyhole size={17} className="ax-input-icon" aria-hidden="true" />
            <input
              type={showPassword ? "text" : "password"}
              className="ax-input ax-input--icon ax-input--action"
              placeholder="8+ chars"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
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

        <label className="ax-field">
          <span className="ax-label">Confirm password</span>
          <span className="ax-input-wrap">
            <LockKeyhole size={17} className="ax-input-icon" aria-hidden="true" />
            <input
              type={showPassword ? "text" : "password"}
              className="ax-input ax-input--icon"
              placeholder="Repeat it"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              {...gaze.passwordField}
              required
            />
          </span>
        </label>
      </div>

      <div className="ax-auth__actions">
        {error && (
          <p className="ax-form-status ax-form-status--error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="ax-btn ax-btn--primary ax-btn--lg ax-btn--block" disabled={loading}>
          {loading ? "Creating your account…" : "Create account"}
          {!loading && <ArrowRight size={18} className="ax-arrow" />}
        </button>

        <p className="ax-auth__switch">
          Already have an account?{" "}
          <Link href="/login">Sign in</Link>
        </p>
      </div>
    </form>
  );
}
