"use client";

import {
  ArrowLeft,
  ArrowRight,
  AtSign,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import { setUnitGaze, useFormGaze } from "@/components/stage/gaze";
import { checkAvailability, registerUser } from "@/lib/auth";
import { EASE_OUT } from "@/lib/motion";

type Step = "identity" | "account";

const stepMotion = {
  initial: { opacity: 0, x: 24, filter: "blur(6px)" },
  animate: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: { opacity: 0, x: -24, filter: "blur(6px)" },
  transition: { duration: 0.45, ease: EASE_OUT },
};

function StepDots({ current, onBack }: { current: 1 | 2; onBack?: () => void }) {
  return (
    <div className="ax-stepdots" data-step={current} aria-label={`Step ${current} of 2`}>
      <span className={current >= 1 ? "is-on" : undefined} />
      <span className={current >= 2 ? "is-on" : undefined} />
      <em>Step {current} of 2 · {current === 1 ? "About you" : "Your login"}</em>
      {onBack && (
        <button type="button" className="ax-stepdots__back" onClick={onBack}>
          <ArrowLeft size={14} />
          Back
        </button>
      )}
    </div>
  );
}

export default function RegisterForm() {
  const router = useRouter();
  const gaze = useFormGaze();

  const [step, setStep] = useState<Step>("identity");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    gaze.setRevealed(showPassword);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPassword]);

  async function handleIdentity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    setLoading(true);

    try {
      const found = await checkAvailability({ email });

      if (found.email_available === false) {
        setError("This email is already registered. Sign in instead?");
        return;
      }

      setStep("account");
    } catch (checkError) {
      setError(checkError instanceof Error ? checkError.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("The passwords don't match.");
      return;
    }

    setLoading(true);

    try {
      const found = await checkAvailability({ username });

      if (found.username_valid === false) {
        setError("Use 3–30 letters, numbers, dots or underscores.");
        return;
      }

      if (found.username_available === false) {
        setError("This username is taken. Try another one.");
        return;
      }

      await registerUser({
        full_name: fullName,
        email,
        username,
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
    <AnimatePresence mode="wait" initial={false}>
      {step === "identity" && (
        <motion.form key="identity" className="ax-form-grid" onSubmit={handleIdentity} {...stepMotion}>
          <StepDots current={1} />

          <div className="ax-form-pair">
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
          </div>

          <div className="ax-auth__actions">
            {error && (
              <p className="ax-form-status ax-form-status--error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="ax-btn ax-btn--primary ax-btn--lg ax-btn--block" disabled={loading}>
              {loading ? "Checking…" : "Next"}
              {!loading && <ArrowRight size={18} className="ax-arrow" />}
            </button>

            <p className="ax-auth__switch">
              Already have an account?{" "}
              <Link href="/login">Sign in</Link>
            </p>
          </div>
        </motion.form>
      )}

      {step === "account" && (
        <motion.form key="account" className="ax-form-grid" onSubmit={handleAccount} {...stepMotion}>
          <StepDots
            current={2}
            onBack={() => {
              setError("");
              setStep("identity");
            }}
          />

          <label className="ax-field">
            <span className="ax-label">Username</span>
            <span className="ax-input-wrap">
              <AtSign size={17} className="ax-input-icon" aria-hidden="true" />
              <input
                className="ax-input ax-input--icon"
                placeholder="e.g. omar.ahmed"
                value={username}
                onChange={(event) => setUsername(event.target.value.toLowerCase().replace(/\s/g, ""))}
                autoComplete="username"
                minLength={3}
                maxLength={30}
                pattern="[a-z0-9._]{3,30}"
                title="3–30 letters, numbers, dots or underscores"
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
            <span className="ax-label">Confirm password</span>
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
              {loading ? "Creating your account…" : "Create account"}
              {!loading && <ArrowRight size={18} className="ax-arrow" />}
            </button>

          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
