import type { Metadata } from "next";

import { AuthHeading } from "@/components/auth/AuthShell";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset password",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHeading
        eyebrow="Account recovery"
        title="Reset password."
        lead="We'll verify your number over WhatsApp."
      />
      <ForgotPasswordForm />
    </>
  );
}
