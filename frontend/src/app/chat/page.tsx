import type { Metadata } from "next";

import ChatWorkspace from "@/components/chat/ChatWorkspace";


export const metadata: Metadata = {
  title: "AUREXIS AI Chat",
  description:
    "Chat securely with AUREXIS AI inside your Aurexis workspace.",
  robots: {
    index: false,
    follow: false,
  },
};


export default function ChatPage() {
  return <ChatWorkspace />;
}
