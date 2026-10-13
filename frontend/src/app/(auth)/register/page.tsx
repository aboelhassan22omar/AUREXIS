import type { Metadata } from "next";

import { AuthHeading } from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <>
      <AuthHeading
        eyebrow="New workspace"
        title="Join Aurexis."
        lead="Create your Aurexis workspace."
      />
      <RegisterForm />
    </>
  );
}
