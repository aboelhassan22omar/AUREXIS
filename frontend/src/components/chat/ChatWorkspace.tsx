"use client";

import {
  ArrowDown,
  ArrowLeft,
  Bot,
  History,
  LoaderCircle,
  Menu,
  MessageSquarePlus,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Send,
  Square,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import ChatMarkdown from "@/components/chat/ChatMarkdown";
import styles from "@/components/chat/ChatWorkspace.module.css";
import ThemeToggle from "@/components/theme/ThemeToggle";
import Logo from "@/components/ui/Logo";
import { useAuth } from "@/hooks/useAuth";
import {
  ChatApiError,
  createChatConversation,
  deleteChatConversation,
  getChatConversation,
  listChatConversations,
  streamChatMessage,
  streamGuestChatMessage,
} from "@/lib/chat";
import type {
  ChatConversationSummary,
  ChatMessage,
  ChatStreamEvent,
  GuestChatHistoryMessage,
} from "@/types/chat";


const CHAT_DRAFT_KEY =
  "aurexis-chat-draft";
const MAX_MESSAGE_CHARS = 8000;
const CHAR_COUNT_THRESHOLD =
  Math.floor(
    MAX_MESSAGE_CHARS * 0.85
  );

const SUGGESTED_PROMPTS = [
  "Tell me about AUREXIS services",
  "Explain your AI solutions",
  "ساعدني أختار الخدمة المناسبة",
  "عايز أعرف أكتر عن خدمات AUREXIS",
];

type StreamTextStore = {
  append: (value: string) => void;
  getSnapshot: () => string;
  reset: () => void;
  subscribe: (
    listener: () => void
  ) => () => void;
};

function createStreamTextStore(): StreamTextStore {
  let value = "";
  const listeners =
    new Set<() => void>();

  const emit = () => {
    listeners.forEach(
      (listener) => listener()
    );
  };

  return {
    append(nextValue) {
      value += nextValue;
      emit();
    },
    getSnapshot() {
      return value;
    },
    reset() {
      value = "";
      emit();
    },
    subscribe(listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
}

function formatConversationDate(
  value: string
): string {
  const date = new Date(value);
  const now = new Date();

  if (
    date.toDateString() ===
    now.toDateString()
  ) {
    return date.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  return date.toLocaleDateString(
    [],
    {
      month: "short",
      day: "numeric",
    }
  );
}

function formatMessageTime(
  value: string
): string {
  return new Date(
    value
  ).toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function getFirstName(
  fullName: string
): string {
  return (
    fullName
      .trim()
      .split(/\s+/)[0] ||
    "there"
  );
}

function createLocalMessage(
  conversationId: number,
  role: "user" | "assistant",
  content: string,
  localState?: ChatMessage["localState"]
): ChatMessage {
  return {
    id: -Date.now() -
      Math.floor(
        Math.random() * 1000
      ),
    conversation_id:
      conversationId,
    role,
    content,
    created_at:
      new Date().toISOString(),
    localState,
  };
}

function getFriendlyError(
  error: unknown
): string {
  if (
    error instanceof ChatApiError
  ) {
    if (error.status === 429) {
      return "You’re sending messages too quickly. Please wait a moment.";
    }

    if (error.status === 503) {
      return "AUREXIS AI is currently unavailable. Please try again shortly.";
    }

    if (error.status === 409) {
      return error.message;
    }

    return error.message;
  }

  if (
    error instanceof DOMException &&
    error.name === "AbortError"
  ) {
    return "Generation stopped.";
  }

  return "Something went wrong. Please try again.";
}

type MessageBubbleProps = {
  message: ChatMessage;
};

const MessageBubble = memo(
  function MessageBubble({
    message,
  }: MessageBubbleProps) {
    const isUser =
      message.role === "user";

    return (
      <article
        className={`${styles.messageRow} ${
          isUser
            ? styles.userRow
            : styles.assistantRow
        }`}
      >
        <div
          className={styles.messageAvatar}
          aria-hidden="true"
        >
          {isUser ? (
            <UserRound size={17} />
          ) : (
            <Bot size={18} />
          )}
        </div>

        <div
          className={`${styles.messageBubble} ${
            isUser
              ? styles.userBubble
              : styles.assistantBubble
          }`}
        >
          <ChatMarkdown
            content={message.content}
          />

          <div
            className={styles.messageMeta}
          >
            <span>
              {formatMessageTime(
                message.created_at
              )}
            </span>

            {message.localState && (
              <span
                className={
                  styles.localState
                }
              >
                {message.localState ===
                "stopped"
                  ? "Stopped"
                  : "Failed"}
              </span>
            )}
          </div>
        </div>
      </article>
    );
  }
);

function ChatMessages({
  messages,
  streaming,
  streamStore,
  loading,
  emptyState,
}: {
  messages: ChatMessage[];
  streaming: boolean;
  streamStore: StreamTextStore;
  loading: boolean;
  emptyState: ReactNode;
}) {
  const containerRef =
    useRef<HTMLDivElement>(null);
  const atBottomRef =
    useRef(true);
  const [showScrollButton,
    setShowScrollButton] =
    useState(false);

  const streamingText =
    useSyncExternalStore(
      streamStore.subscribe,
      streamStore.getSnapshot,
      streamStore.getSnapshot
    );

  const scrollToBottom =
    useCallback(
      (behavior: ScrollBehavior =
        "smooth") => {
        const container =
          containerRef.current;

        if (!container) {
          return;
        }

        container.scrollTo({
          top: container.scrollHeight,
          behavior,
        });
        atBottomRef.current = true;
        setShowScrollButton(false);
      },
      []
    );

  useEffect(() => {
    if (atBottomRef.current) {
      scrollToBottom(
        streaming
          ? "auto"
          : "smooth"
      );
    }
  }, [
    messages,
    scrollToBottom,
    streaming,
    streamingText,
  ]);

  function handleScroll() {
    const container =
      containerRef.current;

    if (!container) {
      return;
    }

    const distance =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    const atBottom =
      distance < 96;

    atBottomRef.current =
      atBottom;
    setShowScrollButton(
      !atBottom
    );
  }

  return (
    <div className={styles.messagesShell}>
      <div
        ref={containerRef}
        className={styles.messagesScroller}
        onScroll={handleScroll}
      >
        <div
          className={styles.messagesInner}
        >
          {loading ? (
            <div
              className={styles.loadingState}
            >
              <LoaderCircle
                className={styles.spinner}
                size={24}
              />
              Loading conversation...
            </div>
          ) : messages.length === 0 &&
            !streaming ? (
            emptyState
          ) : (
            <>
              {messages.map(
                (message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                  />
                )
              )}

              {streaming && (
                <article
                  className={`${styles.messageRow} ${styles.assistantRow}`}
                >
                  <div
                    className={styles.messageAvatar}
                    aria-hidden="true"
                  >
                    <Bot size={18} />
                  </div>

                  <div
                    className={`${styles.messageBubble} ${styles.assistantBubble}`}
                    aria-live="polite"
                  >
                    {streamingText ? (
                      <div
                        className={
                          styles.streamingText
                        }
                        dir="auto"
                      >
                        {streamingText}
                      </div>
                    ) : (
                      <div
                        className={
                          styles.thinking
                        }
                        aria-label="AUREXIS AI is thinking"
                      >
                        <span />
                        <span />
                        <span />
                      </div>
                    )}
                  </div>
                </article>
              )}
            </>
          )}
        </div>
      </div>

      {showScrollButton && (
        <button
          type="button"
          className={styles.scrollButton}
          onClick={() =>
            scrollToBottom()
          }
          aria-label="Scroll to latest message"
        >
          <ArrowDown size={17} />
        </button>
      )}
    </div>
  );
}

function EmptyChatState({
  firstName,
  onPrompt,
}: {
  firstName: string | null;
  onPrompt: (value: string) => void;
}) {
  return (
    <div className={styles.emptyState}>
      <div
        className={styles.emptyIcon}
        aria-hidden="true"
      >
        <Bot size={30} />
      </div>

      <p className={styles.emptyEyebrow}>
        AUREXIS AI
      </p>

      <h1>
        {firstName
          ? `Hi ${firstName} 👋`
          : "Hi 👋"}
        <br />
        How can I help you today?
      </h1>

      <p className={styles.emptyDescription}>
        Ask in English, Arabic, Egyptian Arabic,
        or mix them naturally.
      </p>

      <div
        className={styles.promptGrid}
      >
        {SUGGESTED_PROMPTS.map(
          (prompt) => (
            <button
              key={prompt}
              type="button"
              dir="auto"
              onClick={() =>
                onPrompt(prompt)
              }
            >
              {prompt}
            </button>
          )
        )}
      </div>
    </div>
  );
}

export default function ChatWorkspace() {
  const router = useRouter();
  const {
    user,
    loading: authLoading,
    authenticated,
  } = useAuth();

  const isGuest =
    !authenticated || !user;

  const [conversations,
    setConversations] =
    useState<ChatConversationSummary[]>([]);
  const [activeConversationId,
    setActiveConversationId] =
    useState<number | null>(null);
  const [messages, setMessages] =
    useState<ChatMessage[]>([]);
  const [historyOpen,
    setHistoryOpen] =
    useState(true);
  const [initialLoading,
    setInitialLoading] =
    useState(true);
  const [conversationLoading,
    setConversationLoading] =
    useState(false);
  const [draft, setDraft] =
    useState("");
  const [streaming,
    setStreaming] =
    useState(false);
  const [submitting,
    setSubmitting] =
    useState(false);
  const [errorMessage,
    setErrorMessage] =
    useState<string | null>(null);
  const [retryMessageId,
    setRetryMessageId] =
    useState<number | null>(null);
  const [guestRetryContent,
    setGuestRetryContent] =
    useState<string | null>(null);
  const [online, setOnline] =
    useState(true);

  const abortControllerRef =
    useRef<AbortController | null>(null);
  const requestBusyRef =
    useRef(false);
  const mountedRef = useRef(true);
  const textareaRef =
    useRef<HTMLTextAreaElement>(null);
  const draftRef = useRef("");
  const streamStoreRef = useRef(
    createStreamTextStore()
  );
  const guestSessionIdRef =
    useRef<string>("");

  if (!guestSessionIdRef.current) {
    guestSessionIdRef.current =
      typeof crypto !== "undefined" &&
      "randomUUID" in crypto
        ? crypto.randomUUID()
        : `guest-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 12)}`;
  }

  const firstName = useMemo(
    () =>
      user
        ? getFirstName(user.full_name)
        : null,
    [user]
  );

  const redirectToLogin =
    useCallback(() => {
      // Only authenticated sessions that expire may persist the current
      // draft for the safe sign-in round-trip. Guest content is never
      // written to browser storage.
      if (!isGuest) {
        try {
          if (draftRef.current.trim()) {
            window.sessionStorage.setItem(
              CHAT_DRAFT_KEY,
              draftRef.current
            );
          }
        } catch {
          // Draft persistence is best-effort for signed-in sessions only.
        }
      }

      router.replace(
        "/login?next=%2Fchat"
      );
    }, [isGuest, router]);

  const signInToSave =
    useCallback(() => {
      // Guest messages and drafts deliberately remain memory-only.
      router.push(
        "/login?next=%2Fchat"
      );
    }, [router]);

  useEffect(() => {
    mountedRef.current = true;

    const handleOnline = () =>
      setOnline(true);
    const handleOffline = () =>
      setOnline(false);

    setOnline(navigator.onLine);

    if (window.innerWidth < 1024) {
      setHistoryOpen(false);
    }

    window.addEventListener(
      "online",
      handleOnline
    );
    window.addEventListener(
      "offline",
      handleOffline
    );

    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
      // Guest messages, draft and anonymous id exist only in this mounted
      // React tree. Unmounting / refreshing naturally destroys them.
      window.removeEventListener(
        "online",
        handleOnline
      );
      window.removeEventListener(
        "offline",
        handleOffline
      );
    };
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (isGuest) {
      setConversations([]);
      setActiveConversationId(null);
      setMessages([]);
      setInitialLoading(false);
      setConversationLoading(false);
      setHistoryOpen(false);
      return;
    }

    try {
      const savedDraft =
        window.sessionStorage.getItem(
          CHAT_DRAFT_KEY
        );

      if (savedDraft) {
        draftRef.current = savedDraft;
        setDraft(savedDraft);
        window.sessionStorage.removeItem(
          CHAT_DRAFT_KEY
        );
      }
    } catch {
      // Storage can be unavailable in restricted contexts.
    }
  }, [authLoading, isGuest]);

  const handleApiFailure =
    useCallback(
      (error: unknown) => {
        if (
          !isGuest &&
          error instanceof ChatApiError &&
          error.status === 401
        ) {
          redirectToLogin();
          return;
        }

        setErrorMessage(
          getFriendlyError(error)
        );
      },
      [isGuest, redirectToLogin]
    );

  const refreshConversations =
    useCallback(async () => {
      if (isGuest) {
        return [] as ChatConversationSummary[];
      }

      const nextConversations =
        await listChatConversations();

      if (mountedRef.current) {
        setConversations(nextConversations);
      }

      return nextConversations;
    }, [isGuest]);

  const openConversation =
    useCallback(
      async (conversationId: number) => {
        if (
          isGuest ||
          requestBusyRef.current ||
          streaming ||
          submitting
        ) {
          return;
        }

        setConversationLoading(true);
        setErrorMessage(null);
        setRetryMessageId(null);
        setGuestRetryContent(null);

        try {
          const conversation =
            await getChatConversation(
              conversationId
            );

          if (!mountedRef.current) {
            return;
          }

          setActiveConversationId(
            conversation.id
          );
          setMessages(
            conversation.messages
          );
          if (window.innerWidth < 1024) {
            setHistoryOpen(false);
          }
        } catch (error) {
          handleApiFailure(error);
        } finally {
          if (mountedRef.current) {
            setConversationLoading(false);
          }
        }
      },
      [
        handleApiFailure,
        isGuest,
        streaming,
        submitting,
      ]
    );

  useEffect(() => {
    if (
      authLoading ||
      isGuest
    ) {
      return;
    }

    let cancelled = false;

    async function loadInitialData() {
      setInitialLoading(true);
      setErrorMessage(null);

      try {
        const nextConversations =
          await listChatConversations();

        if (cancelled) {
          return;
        }

        setConversations(nextConversations);

        if (nextConversations.length > 0) {
          const latest =
            await getChatConversation(
              nextConversations[0].id
            );

          if (cancelled) {
            return;
          }

          setActiveConversationId(
            latest.id
          );
          setMessages(latest.messages);
        }
      } catch (error) {
        if (!cancelled) {
          handleApiFailure(error);
        }
      } finally {
        if (!cancelled) {
          setInitialLoading(false);
        }
      }
    }

    void loadInitialData();

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    handleApiFailure,
    isGuest,
  ]);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    const textarea =
      textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(
      textarea.scrollHeight,
      160
    )}px`;
  }, [draft]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    const finePointer =
      window.matchMedia(
        "(pointer: fine)"
      ).matches;

    if (finePointer) {
      textareaRef.current?.focus({
        preventScroll: true,
      });
    }
  }, [
    activeConversationId,
    authLoading,
    isGuest,
  ]);

  function startNewChat() {
    if (
      requestBusyRef.current ||
      streaming ||
      submitting ||
      initialLoading ||
      conversationLoading
    ) {
      return;
    }

    if (
      isGuest &&
      messages.length > 0 &&
      !window.confirm(
        "Start a new guest chat? The current conversation will be deleted permanently."
      )
    ) {
      return;
    }

    setActiveConversationId(null);
    setMessages([]);
    setErrorMessage(null);
    setRetryMessageId(null);
    setGuestRetryContent(null);
    draftRef.current = "";
    setDraft("");

    if (window.innerWidth < 1024) {
      setHistoryOpen(false);
    }

    streamStoreRef.current.reset();

    window.requestAnimationFrame(() => {
      textareaRef.current?.focus({
        preventScroll: true,
      });
    });
  }

  async function handleDeleteConversation(
    conversation: ChatConversationSummary
  ) {
    if (
      isGuest ||
      requestBusyRef.current ||
      streaming ||
      submitting ||
      conversationLoading
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete “${conversation.title}”? This cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteChatConversation(
        conversation.id
      );

      const next =
        await refreshConversations();

      if (
        activeConversationId ===
        conversation.id
      ) {
        if (next.length > 0) {
          await openConversation(
            next[0].id
          );
        } else {
          startNewChat();
        }
      }
    } catch (error) {
      handleApiFailure(error);
    }
  }

  const runAuthenticatedStream =
    useCallback(
      async ({
        conversationId,
        content,
        retryId,
        optimisticMessage,
      }: {
        conversationId: number;
        content?: string;
        retryId?: number;
        optimisticMessage?: ChatMessage;
      }) => {
        const controller =
          new AbortController();
        abortControllerRef.current =
          controller;

        setStreaming(true);
        setErrorMessage(null);
        setRetryMessageId(null);
        setGuestRetryContent(null);
        streamStoreRef.current.reset();

        let actualUserMessageId =
          retryId ?? null;
        let messageStarted =
          Boolean(retryId);
        let streamEnded = false;
        let streamErrorReceived = false;
        const originalContent =
          content?.trim() ?? "";

        try {
          await streamChatMessage({
            conversationId,
            content,
            retryMessageId: retryId,
            signal: controller.signal,
            onEvent: (
              event: ChatStreamEvent
            ) => {
              if (
                event.type ===
                "message_start"
              ) {
                messageStarted = true;
                if (event.user_message) {
                  actualUserMessageId =
                    event.user_message.id;

                  if (optimisticMessage) {
                    setMessages(
                      (current) =>
                        current.map(
                          (message) =>
                            message.id ===
                            optimisticMessage.id
                              ? event.user_message as ChatMessage
                              : message
                        )
                    );
                  }
                }
                return;
              }

              if (event.type === "token") {
                streamStoreRef.current.append(
                  event.content
                );
                return;
              }

              if (
                event.type ===
                "message_end"
              ) {
                streamEnded = true;
                setMessages(
                  (current) => [
                    ...current,
                    event.assistant_message,
                  ]
                );
                return;
              }

              if (event.type === "error") {
                streamErrorReceived = true;
                setErrorMessage(event.message);
                setRetryMessageId(
                  actualUserMessageId
                );
              }
            },
          });

          if (
            !streamEnded &&
            !controller.signal.aborted &&
            !streamErrorReceived
          ) {
            setErrorMessage(
              "The response ended unexpectedly. You can retry the last message."
            );
            setRetryMessageId(
              actualUserMessageId
            );
          }
        } catch (error) {
          if (
            error instanceof DOMException &&
            error.name === "AbortError"
          ) {
            if (
              !messageStarted &&
              optimisticMessage
            ) {
              setMessages(
                (current) =>
                  current.filter(
                    (message) =>
                      message.id !==
                      optimisticMessage.id
                  )
              );
              draftRef.current =
                originalContent;
              setDraft(originalContent);
            }

            const partial =
              streamStoreRef.current
                .getSnapshot()
                .trim();

            if (
              messageStarted &&
              partial
            ) {
              setMessages(
                (current) => [
                  ...current,
                  createLocalMessage(
                    conversationId,
                    "assistant",
                    partial,
                    "stopped"
                  ),
                ]
              );
            }

            setErrorMessage(
              messageStarted
                ? "Generation stopped. You can retry the last message."
                : "Generation stopped. Your draft was restored."
            );
            setRetryMessageId(
              messageStarted
                ? actualUserMessageId
                : null
            );
          } else {
            if (
              !messageStarted &&
              originalContent
            ) {
              if (optimisticMessage) {
                setMessages(
                  (current) =>
                    current.filter(
                      (message) =>
                        message.id !==
                        optimisticMessage.id
                    )
                );
              }

              draftRef.current =
                originalContent;
              setDraft(originalContent);
            }

            handleApiFailure(error);
            setRetryMessageId(
              messageStarted
                ? actualUserMessageId
                : null
            );
          }
        } finally {
          if (mountedRef.current) {
            setStreaming(false);
            streamStoreRef.current.reset();
            abortControllerRef.current = null;
          }

          if (
            streamEnded ||
            messageStarted
          ) {
            try {
              await refreshConversations();
            } catch {
              // The message is already saved; history refresh can wait.
            }
          }
        }
      },
      [
        handleApiFailure,
        refreshConversations,
      ]
    );

  const runGuestStream =
    useCallback(
      async ({
        content,
        history,
        optimisticMessage,
      }: {
        content: string;
        history: ChatMessage[];
        optimisticMessage?: ChatMessage;
      }) => {
        const controller =
          new AbortController();
        abortControllerRef.current =
          controller;

        setStreaming(true);
        setErrorMessage(null);
        setRetryMessageId(null);
        setGuestRetryContent(null);
        streamStoreRef.current.reset();

        let messageStarted = false;
        let streamEnded = false;
        let streamErrorReceived = false;
        const originalContent =
          content.trim();

        const providerHistory:
          GuestChatHistoryMessage[] =
          history
            .filter(
              (message) =>
                message.role === "user" ||
                message.role === "assistant"
            )
            .slice(-20)
            .map((message) => ({
              role: message.role,
              content: message.content,
            }));

        try {
          await streamGuestChatMessage({
            content: originalContent,
            history: providerHistory,
            anonymousSessionId:
              guestSessionIdRef.current,
            signal: controller.signal,
            onEvent: (
              event: ChatStreamEvent
            ) => {
              if (
                event.type ===
                "message_start"
              ) {
                messageStarted = true;
                return;
              }

              if (event.type === "token") {
                streamStoreRef.current.append(
                  event.content
                );
                return;
              }

              if (
                event.type ===
                "message_end"
              ) {
                streamEnded = true;
                setMessages(
                  (current) => [
                    ...current,
                    createLocalMessage(
                      0,
                      "assistant",
                      event.assistant_message.content
                    ),
                  ]
                );
                setGuestRetryContent(null);
                return;
              }

              if (event.type === "error") {
                streamErrorReceived = true;
                setErrorMessage(event.message);
                setGuestRetryContent(
                  originalContent
                );
              }
            },
          });

          if (
            !streamEnded &&
            !controller.signal.aborted &&
            !streamErrorReceived
          ) {
            setErrorMessage(
              "The response ended unexpectedly. You can retry the last message."
            );
            setGuestRetryContent(
              originalContent
            );
          }
        } catch (error) {
          if (
            error instanceof DOMException &&
            error.name === "AbortError"
          ) {
            const partial =
              streamStoreRef.current
                .getSnapshot()
                .trim();

            if (partial) {
              setMessages(
                (current) => [
                  ...current,
                  createLocalMessage(
                    0,
                    "assistant",
                    partial,
                    "stopped"
                  ),
                ]
              );
              setGuestRetryContent(
                originalContent
              );
              setErrorMessage(
                "Generation stopped. You can retry the last message."
              );
            } else if (!messageStarted) {
              if (optimisticMessage) {
                setMessages(
                  (current) =>
                    current.filter(
                      (message) =>
                        message.id !==
                        optimisticMessage.id
                    )
                );
              }
              draftRef.current =
                originalContent;
              setDraft(originalContent);
              setErrorMessage(
                "Generation stopped. Your draft was restored."
              );
            } else {
              setGuestRetryContent(
                originalContent
              );
              setErrorMessage(
                "Generation stopped. You can retry the last message."
              );
            }
          } else {
            if (!messageStarted) {
              if (optimisticMessage) {
                setMessages(
                  (current) =>
                    current.filter(
                      (message) =>
                        message.id !==
                        optimisticMessage.id
                    )
                );
              }
              draftRef.current =
                originalContent;
              setDraft(originalContent);
            }

            handleApiFailure(error);
            setGuestRetryContent(
              messageStarted
                ? originalContent
                : null
            );
          }
        } finally {
          if (mountedRef.current) {
            setStreaming(false);
            streamStoreRef.current.reset();
            abortControllerRef.current = null;
          }
        }
      },
      [handleApiFailure]
    );

  const sendMessage = useCallback(
    async (override?: string) => {
      if (
        requestBusyRef.current ||
        streaming ||
        submitting ||
        initialLoading ||
        conversationLoading ||
        !online
      ) {
        return;
      }

      const content = (
        override ?? draft
      ).trim();

      if (
        !content ||
        content.length > MAX_MESSAGE_CHARS
      ) {
        return;
      }

      requestBusyRef.current = true;
      setSubmitting(true);

      if (isGuest) {
        const historyBefore = messages;
        const optimistic =
          createLocalMessage(
            0,
            "user",
            content
          );

        setMessages((current) => [
          ...current,
          optimistic,
        ]);
        draftRef.current = "";
        setDraft("");

        try {
          await runGuestStream({
            content,
            history: historyBefore,
            optimisticMessage: optimistic,
          });
        } catch (error) {
          handleApiFailure(error);
        } finally {
          requestBusyRef.current = false;
          if (mountedRef.current) {
            setSubmitting(false);
          }
        }
        return;
      }

      let conversationId =
        activeConversationId;

      try {
        if (!conversationId) {
          const conversation =
            await createChatConversation();

          conversationId =
            conversation.id;
          setActiveConversationId(
            conversation.id
          );
          setConversations((current) => [
            conversation,
            ...current.filter(
              (item) =>
                item.id !==
                conversation.id
            ),
          ]);
        }

        const optimistic =
          createLocalMessage(
            conversationId,
            "user",
            content
          );

        setMessages((current) => [
          ...current,
          optimistic,
        ]);
        draftRef.current = "";
        setDraft("");

        try {
          window.sessionStorage.removeItem(
            CHAT_DRAFT_KEY
          );
        } catch {
          // Ignore storage failures for authenticated drafts.
        }

        await runAuthenticatedStream({
          conversationId,
          content,
          optimisticMessage: optimistic,
        });
      } catch (error) {
        draftRef.current = content;
        setDraft(content);
        handleApiFailure(error);
      } finally {
        requestBusyRef.current = false;
        if (mountedRef.current) {
          setSubmitting(false);
        }
      }
    },
    [
      activeConversationId,
      conversationLoading,
      draft,
      handleApiFailure,
      initialLoading,
      isGuest,
      messages,
      online,
      runAuthenticatedStream,
      runGuestStream,
      streaming,
      submitting,
    ]
  );

  async function retryLastMessage() {
    if (
      requestBusyRef.current ||
      streaming ||
      submitting ||
      conversationLoading ||
      !online
    ) {
      return;
    }

    if (isGuest) {
      if (!guestRetryContent) {
        return;
      }

      requestBusyRef.current = true;
      setSubmitting(true);

      const retryIndex =
        [...messages]
          .map((message, index) => ({
            message,
            index,
          }))
          .reverse()
          .find(
            ({ message }) =>
              message.role === "user" &&
              message.content.trim() ===
                guestRetryContent.trim()
          )?.index;

      const historyBefore =
        retryIndex === undefined
          ? messages.filter(
              (message) =>
                !message.localState
            )
          : messages.slice(0, retryIndex);

      setMessages((current) =>
        current.filter(
          (message) =>
            !(
              message.localState &&
              message.role === "assistant"
            )
        )
      );

      try {
        await runGuestStream({
          content: guestRetryContent,
          history: historyBefore,
        });
      } finally {
        requestBusyRef.current = false;
        if (mountedRef.current) {
          setSubmitting(false);
        }
      }
      return;
    }

    if (
      !activeConversationId ||
      !retryMessageId
    ) {
      return;
    }

    requestBusyRef.current = true;
    setSubmitting(true);

    setMessages((current) =>
      current.filter(
        (message) =>
          !(
            message.localState &&
            message.role === "assistant"
          )
      )
    );

    try {
      await runAuthenticatedStream({
        conversationId:
          activeConversationId,
        retryId: retryMessageId,
      });
    } finally {
      requestBusyRef.current = false;
      if (mountedRef.current) {
        setSubmitting(false);
      }
    }
  }

  function stopGeneration() {
    abortControllerRef.current?.abort();
  }

  function handleComposerKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      void sendMessage();
    }
  }

  const canSend =
    draft.trim().length > 0 &&
    draft.length <= MAX_MESSAGE_CHARS &&
    !streaming &&
    !submitting &&
    !initialLoading &&
    !conversationLoading &&
    online;

  if (authLoading) {
    return (
      <main className={styles.authLoading}>
        <Logo size={46} />
        <LoaderCircle
          className={styles.spinner}
          size={28}
        />
        <span>
          Opening AUREXIS AI...
        </span>
      </main>
    );
  }

  const canRetry =
    !streaming &&
    (isGuest
      ? Boolean(guestRetryContent)
      : Boolean(retryMessageId));

  return (
    <main className={styles.chatPage}>
      <header className={styles.chatHeader}>
        <div className={styles.headerBrand}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() =>
              router.push(
                isGuest
                  ? "/"
                  : "/dashboard"
              )
            }
            aria-label={
              isGuest
                ? "Back to AUREXIS"
                : "Back to dashboard"
            }
            title={
              isGuest
                ? "Back to AUREXIS"
                : "Back to dashboard"
            }
          >
            <ArrowLeft size={18} />
          </button>

          <Logo
            size={34}
            showText={false}
          />

          <div>
            <strong>AUREXIS AI</strong>
            <span>
              <i
                className={
                  online
                    ? styles.onlineDot
                    : styles.offlineDot
                }
              />
              {online
                ? "Ready to help"
                : "Offline"}
            </span>
          </div>
        </div>

        <div className={styles.headerActions}>
          {isGuest && (
            <button
              type="button"
              className={styles.headerActionButton}
              onClick={signInToSave}
            >
              <UserRound size={15} />
              <span>Sign in to save chats</span>
            </button>
          )}

          <button
            type="button"
            className={styles.headerActionButton}
            onClick={startNewChat}
            disabled={
              streaming ||
              submitting ||
              initialLoading ||
              conversationLoading
            }
          >
            <MessageSquarePlus size={16} />
            <span>New Chat</span>
          </button>

          {!isGuest && (
            <button
              type="button"
              className={styles.iconButton}
              onClick={() =>
                setHistoryOpen(
                  (current) => !current
                )
              }
              aria-label="Toggle conversation history"
              title="Conversation history"
              aria-expanded={historyOpen}
            >
              {historyOpen ? (
                <PanelLeftClose size={18} />
              ) : (
                <PanelLeftOpen size={18} />
              )}
            </button>
          )}

          <ThemeToggle />
        </div>
      </header>

      <div
        className={`${styles.workspace} ${
          isGuest
            ? styles.guestWorkspace
            : ""
        }`}
      >
        {!isGuest && (
          <aside
            className={`${styles.sidebar} ${
              historyOpen
                ? styles.sidebarOpen
                : styles.sidebarClosed
            }`}
            aria-label="Conversation history"
          >
            <div className={styles.sidebarHeader}>
              <div>
                <History size={16} />
                <strong>Conversations</strong>
              </div>

              <button
                type="button"
                className={styles.mobileCloseButton}
                onClick={() =>
                  setHistoryOpen(false)
                }
                aria-label="Close history"
              >
                <X size={18} />
              </button>
            </div>

            <button
              type="button"
              className={styles.newChatButton}
              onClick={startNewChat}
              disabled={
                streaming ||
                submitting ||
                initialLoading ||
                conversationLoading
              }
            >
              <MessageSquarePlus size={17} />
              New Chat
            </button>

            <div
              className={styles.conversationList}
            >
              {initialLoading ? (
                <div className={styles.sidebarStatus}>
                  <LoaderCircle
                    className={styles.spinner}
                    size={18}
                  />
                  Loading history...
                </div>
              ) : conversations.length === 0 ? (
                <div className={styles.sidebarEmpty}>
                  <History size={22} />
                  <strong>
                    No conversations yet
                  </strong>
                  <span>
                    Start a chat and it will appear here.
                  </span>
                </div>
              ) : (
                conversations.map(
                  (conversation) => {
                    const active =
                      conversation.id ===
                      activeConversationId;

                    return (
                      <div
                        key={conversation.id}
                        className={`${styles.conversationItem} ${
                          active
                            ? styles.conversationActive
                            : ""
                        }`}
                      >
                        <button
                          type="button"
                          className={styles.conversationSelect}
                          onClick={() =>
                            void openConversation(
                              conversation.id
                            )
                          }
                          aria-current={
                            active
                              ? "page"
                              : undefined
                          }
                        >
                          <span dir="auto">
                            {conversation.title}
                          </span>
                          <time>
                            {formatConversationDate(
                              conversation.updated_at
                            )}
                          </time>
                        </button>

                        <button
                          type="button"
                          className={styles.deleteConversation}
                          onClick={() =>
                            void handleDeleteConversation(
                              conversation
                            )
                          }
                          aria-label={`Delete ${conversation.title}`}
                          title="Delete conversation"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  }
                )
              )}
            </div>
          </aside>
        )}

        {!isGuest && historyOpen && (
          <button
            type="button"
            className={styles.drawerBackdrop}
            onClick={() =>
              setHistoryOpen(false)
            }
            aria-label="Close conversation history"
          />
        )}

        <section className={styles.chatMain}>
          {isGuest && (
            <div
              className={styles.guestBanner}
              role="status"
            >
              <span dir="auto">
                You’re chatting as a guest. This conversation will disappear when you leave.
              </span>
              <button
                type="button"
                onClick={signInToSave}
              >
                Sign in to save chats
              </button>
            </div>
          )}

          {!online && (
            <div
              className={styles.connectionBanner}
              role="status"
            >
              You’re offline. Keep this page open and retry when your connection returns.
            </div>
          )}

          <ChatMessages
            messages={messages}
            streaming={streaming}
            streamStore={
              streamStoreRef.current
            }
            loading={
              initialLoading ||
              conversationLoading
            }
            emptyState={
              <EmptyChatState
                firstName={firstName}
                onPrompt={(prompt) =>
                  void sendMessage(prompt)
                }
              />
            }
          />

          <div className={styles.composerArea}>
            {errorMessage && (
              <div
                className={styles.errorBanner}
                role="alert"
              >
                <span>
                  {errorMessage}
                </span>

                {canRetry && (
                  <button
                    type="button"
                    onClick={() =>
                      void retryLastMessage()
                    }
                  >
                    <RefreshCw size={14} />
                    Retry
                  </button>
                )}
              </div>
            )}

            <div className={styles.composer}>
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(event) => {
                  const nextDraft =
                    event.target.value.slice(
                      0,
                      MAX_MESSAGE_CHARS
                    );

                  draftRef.current = nextDraft;
                  setDraft(nextDraft);
                }}
                onKeyDown={handleComposerKeyDown}
                dir="auto"
                rows={1}
                maxLength={MAX_MESSAGE_CHARS}
                placeholder="Message AUREXIS AI..."
                aria-label="Message AUREXIS AI"
                disabled={
                  conversationLoading ||
                  initialLoading
                }
              />

              <div className={styles.composerActions}>
                {draft.length >=
                  CHAR_COUNT_THRESHOLD && (
                  <span
                    className={
                      draft.length >=
                      MAX_MESSAGE_CHARS
                        ? styles.characterLimit
                        : styles.characterCount
                    }
                  >
                    {draft.length}/
                    {MAX_MESSAGE_CHARS}
                  </span>
                )}

                {streaming ? (
                  <button
                    type="button"
                    className={styles.stopButton}
                    onClick={stopGeneration}
                    aria-label="Stop generation"
                    title="Stop generation"
                  >
                    <Square
                      size={14}
                      fill="currentColor"
                    />
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles.sendButton}
                    onClick={() =>
                      void sendMessage()
                    }
                    disabled={!canSend}
                    aria-label="Send message"
                    title="Send message"
                  >
                    <Send size={17} />
                  </button>
                )}
              </div>
            </div>

            <p className={styles.composerHint}>
              {isGuest
                ? "Guest chats are not saved · Enter to send · Shift + Enter for a new line"
                : "Enter to send · Shift + Enter for a new line"}
            </p>
          </div>
        </section>
      </div>

      {!isGuest && !historyOpen && (
        <button
          type="button"
          className={styles.mobileHistoryButton}
          onClick={() =>
            setHistoryOpen(true)
          }
          aria-label="Open conversation history"
        >
          <Menu size={18} />
        </button>
      )}
    </main>
  );
}
