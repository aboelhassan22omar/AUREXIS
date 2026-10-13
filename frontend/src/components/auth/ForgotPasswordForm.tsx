"use client";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Phone,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import WhatsAppVerify, { stepMotion } from "@/components/auth/WhatsAppVerify";
import { setUnitGaze, useFormGaze } from "@/components/stage/gaze";
import {
  COUNTRIES,
  resetPasswordWithPhone,
  startPhoneVerification,
  toE164,
  verifyPhoneCode,
  type VerificationStart,
} from "@/lib/phoneVerification";

type Step = "phone" | "verify" | "password" | "done";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const gaze = useFormGaze();

  const [step, setStep] = useState<Step>("phone");
  const [dial, setDial] = useState("+20");
  const [national, setNational] = useState("");
  const [challenge, setChallenge] = useState<VerificationStart | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const phone = toE164(dial, national);

  useEffect(() => {
    gaze.setRevealed(showPassword);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPassword]);

  useEffect(() => {
    if (step !== "done") {
      return;
    }

    setUnitGaze("auto");
    const timer = window.setTimeout(() => router.push("/login"), 2200);
    return () => window.clearTimeout(timer);
  }, [step, router]);

  async function handlePhone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!phone) {
      setError("Enter the WhatsApp number on your account.");
      return;
    }

    setLoading(true);

    try {
      setChallenge(await startPhoneVerification(phone, "reset"));
      setStep("verify");
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : "Unable to start verification");
    } finally {
      setLoading(false);
    }
  }

  async function handleCode(code: string) {
    if (!challenge) {
      return;
    }

    await verifyPhoneCode(challenge.poll_secret, code);
    setStep("password");
  }

  async function handlePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("The passwords don't match.");
      return;
    }

    if (!challenge) {
      return;
    }

    setLoading(true);

    try {
      await resetPasswordWithPhone(phone, challenge.poll_secret, password);
      setStep("done");
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Unable to change the password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {step === "phone" && (
        <motion.form key="phone" className="ax-form-grid" onSubmit={handlePhone} {...stepMotion}>
          <div className="ax-field">
            <label className="ax-label" htmlFor="ax-reset-phone">
              WhatsApp number on your account
            </label>
            <div className="ax-phone">
              <select
                className="ax-input ax-phone__dial"
                value={dial}
                onChange={(event) => setDial(event.target.value)}
                aria-label="Country code"
                {...gaze.textField}
              >
                {COUNTRIES.map((country) => (
                  <option key={country.code} value={country.dial}>
                    {country.code} {country.dial}
                  </option>
                ))}
              </select>
              <span className="ax-input-wrap">
                <Phone size={17} className="ax-input-icon" aria-hidden="true" />
                <input
                  id="ax-reset-phone"
                  type="tel"
                  inputMode="tel"
                  className="ax-input ax-input--icon"
                  placeholder="128 833 9613"
                  value={national}
                  onChange={(event) => setNational(event.target.value)}
                  autoComplete="tel-national"
                  {...gaze.textField}
                  required
                />
              </span>
            </div>
          </div>

          <div className="ax-auth__actions">
            {error && (
              <p className="ax-form-status ax-form-status--error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="ax-btn ax-btn--primary ax-btn--lg ax-btn--block" disabled={loading}>
              {loading ? "Checking…" : "Send me a code"}
              {!loading && <ArrowRight size={18} className="ax-arrow" />}
            </button>

            <p className="ax-auth__switch">
              Remembered it? <Link href="/login">Sign in</Link>
            </p>
          </div>
        </motion.form>
      )}

      {step === "verify" && challenge && (
        <motion.div key="verify" className="ax-auth__flow" {...stepMotion}>
          <WhatsAppVerify
            challenge={challenge}
            phone={phone}
            onCode={handleCode}
            onBack={() => {
              setChallenge(null);
              setStep("phone");
            }}
            submitLabel="Verify code"
            busyLabel="Checking…"
          />
        </motion.div>
      )}

      {step === "password" && (
        <motion.form key="password" className="ax-form-grid" onSubmit={handlePassword} {...stepMotion}>
          <div className="ax-verify__head">
            <span className="ax-verify__badge is-done">
              <LockKeyhole size={19} />
            </span>
            <div>
              <h2 className="ax-verify__title">Choose a new password</h2>
              <p className="ax-body">Your number is verified. Other devices will be signed out.</p>
            </div>
          </div>

          <label className="ax-field">
            <span className="ax-label">New password</span>
            <span className="ax-input-wrap">
              <LockKeyhole size={17} className="ax-input-icon" aria-hidden="true" />
              <input
                type={showPassword ? "text" : "password"}
                className="ax-input ax-input--icon ax-input--action"
                placeholder="Minimum 8 characters"
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
            <span className="ax-label">Confirm new password</span>
            <span className="ax-input-wrap">
              <LockKeyhole size={17} className="ax-input-icon" aria-hidden="true" />
              <input
                type={showPassword ? "text" : "password"}
                className="ax-input ax-input--icon"
                placeholder="Repeat your password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                {...gaze.passwordField}
                required
              />
            </span>
          </label>

          <div className="ax-auth__actions">
            {error && (
              <p className="ax-form-status ax-form-status--error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="ax-btn ax-btn--primary ax-btn--lg ax-btn--block" disabled={loading}>
              {loading ? "Saving…" : "Change password"}
              {!loading && <ArrowRight size={18} className="ax-arrow" />}
            </button>
          </div>
        </motion.form>
      )}

      {step === "done" && (
        <motion.div key="done" className="ax-verify ax-reset-done" {...stepMotion} role="status">
          <CheckCircle2 size={44} className="ax-reset-done__icon" />
          <h2 className="ax-verify__title">Password changed</h2>
          <p className="ax-body">Taking you to sign in…</p>
          <div className="ax-auth__actions">
            <Link href="/login" className="ax-btn ax-btn--primary ax-btn--block">
              <ArrowLeft size={16} />
              Sign in now
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
