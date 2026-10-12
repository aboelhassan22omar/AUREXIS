"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  MessageCircle,
  RotateCcw,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { setUnitGaze } from "@/components/stage/gaze";
import { EASE_OUT } from "@/lib/motion";
import {
  getVerificationStatus,
  simulateWhatsAppMessage,
  type VerificationStart,
} from "@/lib/phoneVerification";

const REJECTION_TEXT: Record<string, string> = {
  phone_mismatch:
    "The WhatsApp message came from a different number. Send it from the number you entered.",
  expired: "This verification expired. Start again to get a new link.",
  send_failed: "We couldn't send the code over WhatsApp. Please start again.",
  too_many_attempts: "Too many wrong codes. Please start again.",
};

export const stepMotion = {
  initial: { opacity: 0, x: 24, filter: "blur(6px)" },
  animate: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: { opacity: 0, x: -24, filter: "blur(6px)" },
  transition: { duration: 0.45, ease: EASE_OUT },
};

type WhatsAppVerifyProps = {
  challenge: VerificationStart;
  phone: string;
  /** Called with the 6 digits; throw to show an error and clear the code. */
  onCode: (code: string) => Promise<void>;
  /** Back to the previous form (keeps what the user typed). */
  onBack: () => void;
  submitLabel: string;
  busyLabel: string;
};

/**
 * The shared WhatsApp half of sign-up and password reset:
 * send the pre-filled message, wait for our webhook, then enter the code.
 */
export default function WhatsAppVerify({
  challenge,
  phone,
  onCode,
  onBack,
  submitLabel,
  busyLabel,
}: WhatsAppVerifyProps) {
  const [stage, setStage] = useState<"whatsapp" | "code">("whatsapp");
  const [rejected, setRejected] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const codeRef = useRef<HTMLInputElement | null>(null);

  // While the user is busy on WhatsApp the unit watches the form.
  useEffect(() => {
    setUnitGaze("watch");
    return () => setUnitGaze("auto");
  }, []);

  // Poll until our webhook has received the WhatsApp message.
  useEffect(() => {
    if (stage !== "whatsapp") {
      return;
    }

    let cancelled = false;
    const tick = async () => {
      try {
        const found = await getVerificationStatus(challenge.poll_secret);

        if (cancelled) {
          return;
        }

        if (found.status === "code_sent") {
          setStage("code");
        } else if (found.status === "rejected") {
          setRejected(REJECTION_TEXT[found.reason ?? ""] ?? "Verification failed. Please start again.");
        }
      } catch {
        // transient network error: keep polling
      }
    };

    const timer = window.setInterval(tick, 2000);
    void tick();

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [stage, challenge]);

  useEffect(() => {
    if (stage === "code") {
      window.setTimeout(() => codeRef.current?.focus(), 350);
    }
  }, [stage]);

  async function submit(entered: string) {
    if (entered.length !== 6 || loading) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      await onCode(entered);
    } catch (codeError) {
      setError(codeError instanceof Error ? codeError.message : "Something went wrong");
      setCode("");
    } finally {
      setLoading(false);
    }
  }

  async function simulate() {
    try {
      const result = await simulateWhatsAppMessage(challenge.poll_secret);
      setDevCode(result.code);
      setStage("code");
    } catch (simError) {
      setError(simError instanceof Error ? simError.message : "Simulation failed");
    }
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(challenge.message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked: the text is visible to copy by hand
    }
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {stage === "whatsapp" ? (
        <motion.div key="whatsapp" className="ax-verify" {...stepMotion}>
          <div className="ax-verify__head">
            <span className="ax-verify__badge">
              <MessageCircle size={20} />
            </span>
            <div>
              <h2 className="ax-verify__title">Verify on WhatsApp</h2>
              <p className="ax-body">
                Send one message from <strong className="ax-ltr">{phone}</strong> and we&apos;ll reply with your code.
              </p>
            </div>
          </div>

          {rejected ? (
            <p className="ax-form-status ax-form-status--error" role="alert">
              {rejected}
            </p>
          ) : (
            <>
              <ol className="ax-verify__steps">
                <li>Tap <strong>Open WhatsApp</strong> — the message is already typed.</li>
                <li>Press <strong>Send</strong> in WhatsApp. It isn&apos;t sent automatically.</li>
                <li>Come back here — your code arrives in seconds.</li>
              </ol>

              {challenge.link && (
                <a className="ax-btn ax-btn--whatsapp ax-btn--lg ax-btn--block" href={challenge.link} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={18} />
                  Open WhatsApp
                </a>
              )}

              <div className="ax-verify__manual">
                <span>
                  Or send <code className="ax-ltr">{challenge.message}</code>
                  {challenge.business_number && (
                    <>
                      {" "}to <strong className="ax-ltr">{challenge.business_number}</strong>
                    </>
                  )}
                </span>
                <button type="button" className="ax-verify__copy" onClick={copyMessage} aria-label="Copy message">
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                </button>
              </div>

              <p className="ax-verify__waiting" role="status">
                <span className="ax-spinner" />
                Waiting for your WhatsApp message…
                {challenge.dev_simulate && (
                  <button type="button" className="ax-verify__dev" onClick={simulate}>
                    Simulate (dev)
                  </button>
                )}
              </p>
            </>
          )}

          <div className="ax-auth__actions">
            {error && (
              <p className="ax-form-status ax-form-status--error" role="alert">
                {error}
              </p>
            )}

            <button type="button" className="ax-btn ax-btn--ghost ax-btn--block ax-btn--compact" onClick={onBack}>
              {rejected ? <RotateCcw size={16} /> : <ArrowLeft size={16} />}
              {rejected ? "Start again" : "Change number"}
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.form
          key="code"
          className="ax-verify"
          onSubmit={(event) => {
            event.preventDefault();
            void submit(code);
          }}
          {...stepMotion}
        >
          <div className="ax-verify__head">
            <span className="ax-verify__badge is-done">
              <Check size={20} />
            </span>
            <div>
              <h2 className="ax-verify__title">Enter your code</h2>
              <p className="ax-body">We sent a 6-digit code to your WhatsApp.</p>
            </div>
          </div>

          <label className="ax-otp" htmlFor="ax-otp-input">
            <input
              id="ax-otp-input"
              ref={codeRef}
              className="ax-otp__input"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              aria-label="6-digit verification code"
              onChange={(event) => {
                const next = event.target.value.replace(/\D/g, "").slice(0, 6);
                setCode(next);

                if (next.length === 6) {
                  void submit(next);
                }
              }}
            />
            {Array.from({ length: 6 }, (_, index) => (
              <span
                key={index}
                className={`ax-otp__cell${index === code.length ? " is-active" : ""}${code[index] ? " is-filled" : ""}`}
                aria-hidden="true"
              >
                {code[index] ?? ""}
              </span>
            ))}
          </label>

          {devCode && (
            <p className="ax-hint ax-hint--dev">
              Development code: <strong className="ax-ltr">{devCode}</strong>
            </p>
          )}

          <div className="ax-auth__actions">
            {error && (
              <p className="ax-form-status ax-form-status--error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="ax-btn ax-btn--primary ax-btn--lg ax-btn--block" disabled={loading || code.length !== 6}>
              {loading ? busyLabel : submitLabel}
              {!loading && <ArrowRight size={18} className="ax-arrow" />}
            </button>

            <button type="button" className="ax-btn ax-btn--ghost ax-btn--block ax-btn--compact" onClick={onBack}>
              <RotateCcw size={16} />
              Start again
            </button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
