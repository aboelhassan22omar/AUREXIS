import type { Metadata } from "next";

import { AuthHeading } from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <>
      <AuthHeading
        eyebrow="Workspace access"
        title="Welcome back."
        lead="Sign in to your Aurexis workspace."
      />
      <LoginForm />
    </>
  );
}
