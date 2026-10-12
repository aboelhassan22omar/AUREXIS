import type { ReactNode } from "react";

import AuthFrame from "@/components/auth/AuthShell";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthFrame>{children}</AuthFrame>;
}
