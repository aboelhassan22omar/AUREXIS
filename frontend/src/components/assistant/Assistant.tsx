"use client";

import {
  ArrowUp,
  Maximize2,
  Minimize2,
  RotateCcw,
  Square,
  X,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import styles from "@/components/assistant/Assistant.module.css";
import ChatMarkdown from "@/components/chat/ChatMarkdown";
import { streamGuestChatMessage } from "@/lib/chat";
import { EASE_OUT } from "@/lib/motion";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  state?: "streaming" | "error";
};

const STORAGE_KEY = "aurexis-assistant";
const MAX_HISTORY = 20;

const SUGGESTIONS = [
  "What does Aurexis build?",
  "How can AI agents help my business?",
  "How do I start a project?",
];

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `ax-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Aurexis AI — the site assistant. Opened only from its own fixed launcher;
 * nothing else on the page (including the 3D unit) can open it.
 */
export default function Assistant() {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [viewport, setViewport] = useState({ w: 1440, h: 900 });

  const sessionRef = useRef<string>("");
  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const launcherRef = useRef<HTMLButtonElement | null>(null);

  // Restore the conversation for this browser tab.
  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved) as { session: string; messages: Message[] };
        sessionRef.current = parsed.session;
        setMessages(parsed.messages.filter((m) => m.state !== "streaming"));
      }
    } catch {
      // Storage may be unavailable; the assistant still works in-memory.
    }

    if (!sessionRef.current) {
      sessionRef.current = createId().replace(/[^A-Za-z0-9_-]/g, "");
    }
  }, []);

  useEffect(() => {
    if (streaming) {
      return;
    }

    try {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ session: sessionRef.current, messages: messages.slice(-40) })
      );
    } catch {
      // ignore
    }
  }, [messages, streaming]);

  useEffect(() => {
    const list = listRef.current;

    if (list) {
      list.scrollTo({ top: list.scrollHeight, behavior: reduced ? "auto" : "smooth" });
    }
  }, [messages, open, reduced]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = window.setTimeout(() => inputRef.current?.focus(), 260);
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        launcherRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKey);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Lock page scroll behind the full-screen sheet (phones, or expanded).
  useEffect(() => {
    const phone = window.matchMedia("(max-width: 599px)").matches;
    document.documentElement.classList.toggle("ax-assistant-lock", open && (phone || expanded));

    return () => document.documentElement.classList.remove("ax-assistant-lock");
  }, [open, expanded]);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight });

    update();
    window.addEventListener("resize", update);

    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!open) {
      setExpanded(false);
    }
  }, [open]);

  const send = useCallback(
    async (text: string, history: Message[]) => {
      const content = text.trim();

      if (!content || streaming) {
        return;
      }

      const userMessage: Message = { id: createId(), role: "user", content };
      const reply: Message = { id: createId(), role: "assistant", content: "", state: "streaming" };
      const nextHistory = history
        .filter((m) => m.state !== "error" && m.content.trim())
        .slice(-MAX_HISTORY)
        .map((m) => ({ role: m.role, content: m.content }));

      setMessages([...history, userMessage, reply]);
      setDraft("");

      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      const patch = (update: (message: Message) => Message) =>
        setMessages((current) =>
          current.map((message) => (message.id === reply.id ? update(message) : message))
        );

      try {
        await streamGuestChatMessage({
          content,
          history: nextHistory,
          anonymousSessionId: sessionRef.current,
          signal: controller.signal,
          onEvent: (event) => {
            if (event.type === "token") {
              patch((message) => ({ ...message, content: message.content + event.content }));
            } else if (event.type === "message_end") {
              patch((message) => ({
                ...message,
                content: event.assistant_message.content || message.content,
                state: undefined,
              }));
            } else if (event.type === "error") {
              patch((message) => ({
                ...message,
                content: message.content || event.message,
                state: "error",
              }));
            }
          },
        });
        patch((message) => (message.state === "streaming" ? { ...message, state: undefined } : message));
      } catch (error) {
        if (controller.signal.aborted) {
          patch((message) => ({ ...message, state: undefined, content: message.content || "Stopped." }));
        } else {
          patch((message) => ({
            ...message,
            state: "error",
            content: error instanceof Error ? error.message : "Aurexis AI is unavailable right now.",
          }));
        }
      } finally {
        abortRef.current = null;
        setStreaming(false);
      }
    },
    [streaming]
  );

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void send(draft, messages);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send(draft, messages);
    }
  }

  function retry() {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");

    if (!lastUser) {
      return;
    }

    const index = messages.lastIndexOf(lastUser);
    void send(lastUser.content, messages.slice(0, index));
  }

  function reset() {
    abortRef.current?.abort();
    setMessages([]);
    sessionRef.current = createId().replace(/[^A-Za-z0-9_-]/g, "");
  }

  if (pathname === "/chat" || pathname.startsWith("/admin")) {
    return null;
  }

  const last = messages[messages.length - 1];
  // Collapsed: a card above the launcher. Expanded: the whole screen.
  const panelSize = expanded
    ? { right: 0, bottom: 0, width: viewport.w, height: viewport.h, borderRadius: 0 }
    : {
        right: 18,
        bottom: 96,
        width: Math.min(410, viewport.w - 36),
        height: Math.min(640, Math.max(420, viewport.h - 120)),
        borderRadius: 28,
      };
  const geometry = { duration: reduced ? 0 : 0.7, ease: EASE_OUT };

  return (
    <div className={`${styles.root} ax-assistant`}>
      <AnimatePresence>
        {open && (
          <motion.section
            key="panel"
            id="aurexis-assistant"
            className={`${styles.panel}${expanded ? ` ${styles.panelExpanded}` : ""}`}
            role="dialog"
            aria-modal="false"
            aria-label="Aurexis AI assistant"
            initial={reduced ? { opacity: 0, ...panelSize } : { opacity: 0, y: 24, scale: 0.92, filter: "blur(10px)", ...panelSize }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)", ...panelSize }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.94, filter: "blur(8px)" }}
            transition={{
              duration: 0.55,
              ease: EASE_OUT,
              width: geometry,
              height: geometry,
              right: geometry,
              bottom: geometry,
              borderRadius: geometry,
            }}
          >
            <header className={styles.header}>
              <img className={styles.headerMark} src="/brand/aurexis-mark.svg" alt="" width={26} height={25} aria-hidden="true" />
              <div className={styles.identity}>
                <strong>Aurexis AI</strong>
                <span>
                  <i className={styles.statusDot} />
                  {streaming ? "Responding…" : "Online"}
                </span>
              </div>
              <div className={styles.headerActions}>
                {messages.length > 0 && (
                  <button type="button" className={styles.iconButton} onClick={reset} aria-label="New conversation" title="New conversation">
                    <RotateCcw size={16} />
                  </button>
                )}
                <button
                  type="button"
                  className={`${styles.iconButton} ${styles.expandButton}`}
                  onClick={() => setExpanded((value) => !value)}
                  aria-label={expanded ? "Collapse assistant" : "Expand assistant"}
                  aria-pressed={expanded}
                  title={expanded ? "Collapse" : "Expand"}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={expanded ? "min" : "max"}
                      initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      exit={{ scale: 0.5, opacity: 0, rotate: 45 }}
                      transition={{ duration: 0.25, ease: EASE_OUT }}
                      style={{ display: "grid" }}
                    >
                      {expanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                    </motion.span>
                  </AnimatePresence>
                </button>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => {
                    setOpen(false);
                    launcherRef.current?.focus();
                  }}
                  aria-label="Close assistant"
                >
                  <X size={17} />
                </button>
              </div>
            </header>

            <div className={styles.body} ref={listRef} data-lenis-prevent>
              {messages.length === 0 ? (
                <div className={styles.welcome}>
                  <h2>How can Aurexis help?</h2>
                  <p>
                    Ask about our services, projects, or how we&apos;d approach
                    what you want to build.
                  </p>
                  <div className={styles.suggestions}>
                    {SUGGESTIONS.map((suggestion, index) => (
                      <motion.button
                        key={suggestion}
                        type="button"
                        className={styles.suggestion}
                        onClick={() => void send(suggestion, messages)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.15 + index * 0.06 }}
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                <ol className={styles.messages}>
                  {messages.map((message) => (
                    <motion.li
                      key={message.id}
                      className={`${styles.message} ${message.role === "user" ? styles.fromUser : styles.fromAssistant}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: EASE_OUT }}
                    >
                      {message.role === "assistant" ? (
                        message.content ? (
                          <div className={message.state === "error" ? styles.errorText : undefined}>
                            <ChatMarkdown content={message.content} />
                          </div>
                        ) : (
                          <span className={styles.typing} aria-label="Aurexis AI is typing">
                            <i />
                            <i />
                            <i />
                          </span>
                        )
                      ) : (
                        <p>{message.content}</p>
                      )}
                    </motion.li>
                  ))}
                </ol>
              )}

              {last?.state === "error" && !streaming && (
                <button type="button" className={styles.retry} onClick={retry}>
                  <RotateCcw size={14} />
                  Try again
                </button>
              )}
            </div>

            <form className={styles.composer} onSubmit={handleSubmit}>
              <label htmlFor="ax-assistant-input" className="visually-hidden">
                Message Aurexis AI
              </label>
              <textarea
                id="ax-assistant-input"
                ref={inputRef}
                rows={1}
                value={draft}
                maxLength={4000}
                placeholder="Ask anything about Aurexis…"
                onChange={(event) => {
                  setDraft(event.target.value);
                  event.target.style.height = "auto";
                  event.target.style.height = `${Math.min(event.target.scrollHeight, 140)}px`;
                }}
                onKeyDown={handleKeyDown}
              />
              {streaming ? (
                <button type="button" className={styles.send} onClick={() => abortRef.current?.abort()} aria-label="Stop response">
                  <Square size={13} fill="currentColor" />
                </button>
              ) : (
                <button type="submit" className={styles.send} disabled={!draft.trim()} aria-label="Send message">
                  <ArrowUp size={17} />
                </button>
              )}
            </form>
            <p className={styles.disclaimer}>AI responses may be imperfect. Don&apos;t share sensitive data.</p>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        ref={launcherRef}
        type="button"
        className={`${styles.launcher}${open ? ` ${styles.launcherOpen}` : ""}${expanded ? ` ${styles.launcherHidden}` : ""}`}
        onClick={() => setOpen((value) => !value)}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        aria-expanded={open}
        aria-controls="aurexis-assistant"
        aria-label={open ? "Close Aurexis AI" : "Open Aurexis AI assistant"}
        initial={reduced ? false : { opacity: 0, scale: 0.6, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileTap={{ scale: 0.94 }}
        transition={{ duration: 0.9, ease: EASE_OUT, delay: 1.6 }}
      >
        <span
          className={`${styles.orb}${hovered || streaming ? ` ${styles.orbActive}` : ""}`}
          aria-hidden="true"
        >
          <span className={styles.aurora}>
            <i />
            <i />
            <i />
          </span>
          <span className={styles.gloss} />
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span
                key="close"
                className={styles.orbCenter}
                initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.3, ease: EASE_OUT }}
              >
                <X size={20} />
              </motion.span>
            ) : (
              <motion.img
                key="mark"
                className={styles.orbCenter}
                src="/brand/aurexis-mark-white.svg"
                alt=""
                width={24}
                height={23}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE_OUT }}
              />
            )}
          </AnimatePresence>
        </span>
        <span className={styles.launcherLabel}>Ask Aurexis</span>
      </motion.button>
    </div>
  );
}
