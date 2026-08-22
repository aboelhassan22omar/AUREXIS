import { API_BASE_URL } from "@/lib/config";
import {
  clearAuthSession,
  getAccessToken,
  refreshSession,
} from "@/lib/auth";

import type {
  ChatConversationDetail,
  ChatConversationSummary,
  ChatStreamEvent,
  GuestChatHistoryMessage,
} from "@/types/chat";


type ApiErrorPayload = {
  detail?: string;
};

export class ChatApiError extends Error {
  status: number;

  constructor(
    status: number,
    message: string
  ) {
    super(message);
    this.name = "ChatApiError";
    this.status = status;
  }
}

async function readErrorMessage(
  response: Response
): Promise<string> {
  try {
    const data =
      (await response.json()) as ApiErrorPayload;

    return (
      data.detail ||
      "Something went wrong"
    );
  } catch {
    return "Something went wrong";
  }
}

async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {},
  retry = true
): Promise<Response> {
  const token = getAccessToken();

  if (!token) {
    throw new ChatApiError(
      401,
      "Authentication required"
    );
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(options.headers ?? {}),
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (
    response.status === 401 &&
    retry
  ) {
    try {
      const nextToken =
        await refreshSession();

      return fetch(
        `${API_BASE_URL}${endpoint}`,
        {
          ...options,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(options.headers ?? {}),
            Authorization:
              `Bearer ${nextToken}`,
          },
        }
      );
    } catch {
      clearAuthSession();

      throw new ChatApiError(
        401,
        "Your session has expired"
      );
    }
  }

  return response;
}

async function requestJson<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response =
    await authenticatedFetch(
      endpoint,
      options
    );

  if (!response.ok) {
    throw new ChatApiError(
      response.status,
      await readErrorMessage(response)
    );
  }

  return response.json() as Promise<T>;
}

export async function listChatConversations(): Promise<
  ChatConversationSummary[]
> {
  return requestJson<
    ChatConversationSummary[]
  >("/chat/conversations");
}

export async function createChatConversation(): Promise<
  ChatConversationSummary
> {
  return requestJson<
    ChatConversationSummary
  >("/chat/conversations", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function getChatConversation(
  conversationId: number
): Promise<ChatConversationDetail> {
  return requestJson<ChatConversationDetail>(
    `/chat/conversations/${conversationId}`
  );
}

export async function deleteChatConversation(
  conversationId: number
): Promise<void> {
  await requestJson<{ message: string }>(
    `/chat/conversations/${conversationId}`,
    {
      method: "DELETE",
    }
  );
}

async function consumeNdjsonStream(
  response: Response,
  onEvent: (event: ChatStreamEvent) => void
): Promise<void> {
  if (!response.ok) {
    throw new ChatApiError(
      response.status,
      await readErrorMessage(response)
    );
  }

  if (!response.body) {
    throw new ChatApiError(
      503,
      "Streaming is not available"
    );
  }

  const reader =
    response.body.getReader();
  const decoder =
    new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const {
        value,
        done,
      } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(
        value,
        {
          stream: true,
        }
      );

      let newlineIndex =
        buffer.indexOf("\n");

      while (newlineIndex >= 0) {
        const line = buffer
          .slice(0, newlineIndex)
          .trim();

        buffer = buffer.slice(
          newlineIndex + 1
        );

        if (line) {
          try {
            onEvent(
              JSON.parse(
                line
              ) as ChatStreamEvent
            );
          } catch {
            // Ignore malformed provider lines without breaking the stream.
          }
        }

        newlineIndex =
          buffer.indexOf("\n");
      }
    }

    const finalLine = buffer.trim();

    if (finalLine) {
      try {
        onEvent(
          JSON.parse(
            finalLine
          ) as ChatStreamEvent
        );
      } catch {
        // Ignore an incomplete final line.
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export type StreamChatOptions = {
  conversationId: number;
  content?: string;
  retryMessageId?: number;
  signal: AbortSignal;
  onEvent: (
    event: ChatStreamEvent
  ) => void;
};

export async function streamChatMessage({
  conversationId,
  content,
  retryMessageId,
  signal,
  onEvent,
}: StreamChatOptions): Promise<void> {
  const response =
    await authenticatedFetch(
      `/chat/conversations/${conversationId}/stream`,
      {
        method: "POST",
        body: JSON.stringify(
          retryMessageId
            ? {
                retry_message_id:
                  retryMessageId,
              }
            : {
                content,
              }
        ),
        signal,
        headers: {
          Accept:
            "application/x-ndjson",
        },
      }
    );

  await consumeNdjsonStream(
    response,
    onEvent
  );
}

export type StreamGuestChatOptions = {
  content: string;
  history: GuestChatHistoryMessage[];
  anonymousSessionId: string;
  signal: AbortSignal;
  onEvent: (
    event: ChatStreamEvent
  ) => void;
};

export async function streamGuestChatMessage({
  content,
  history,
  anonymousSessionId,
  signal,
  onEvent,
}: StreamGuestChatOptions): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/chat/guest/stream`,
    {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/x-ndjson",
        "X-AUREXIS-Guest-Session":
          anonymousSessionId,
      },
      body: JSON.stringify({
        content,
        history,
      }),
    }
  );

  await consumeNdjsonStream(
    response,
    onEvent
  );
}
