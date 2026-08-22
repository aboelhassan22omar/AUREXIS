export type ChatRole =
  | "user"
  | "assistant";

export type ChatMessage = {
  id: number;
  conversation_id: number;
  role: ChatRole;
  content: string;
  created_at: string;
  localState?:
    | "stopped"
    | "failed";
};

export type ChatConversationSummary = {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
};

export type ChatConversationDetail =
  ChatConversationSummary & {
    messages: ChatMessage[];
  };

export type GuestChatHistoryMessage = {
  role: ChatRole;
  content: string;
};

export type ChatStreamEvent =
  | {
      type: "message_start";
      user_message?: ChatMessage;
      guest?: boolean;
    }
  | {
      type: "token";
      content: string;
    }
  | {
      type: "message_end";
      assistant_message: ChatMessage;
      guest?: boolean;
    }
  | {
      type: "error";
      code: string;
      message: string;
      retryable: boolean;
    };
