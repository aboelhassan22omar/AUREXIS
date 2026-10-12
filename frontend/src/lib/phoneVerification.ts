import { apiRequest } from "@/lib/api";

export type VerificationStart = {
  poll_secret: string;
  link: string;
  message: string;
  business_number: string;
  expires_at: string;
  dev_simulate: boolean;
};

export type VerificationStatus = {
  status: "pending" | "code_sent" | "verified" | "rejected";
  reason: string | null;
  expires_at: string;
};

export function startPhoneVerification(phone: string, purpose: "signup" | "reset") {
  return apiRequest<VerificationStart>("/auth/whatsapp/start", {
    method: "POST",
    body: JSON.stringify({ phone, purpose }),
  });
}

export function resetPasswordWithPhone(phone: string, pollSecret: string, newPassword: string) {
  return apiRequest<{ message: string }>("/auth/password/reset", {
    method: "POST",
    body: JSON.stringify({ phone, phone_verification: pollSecret, new_password: newPassword }),
  });
}

export function getVerificationStatus(pollSecret: string) {
  return apiRequest<VerificationStatus>("/auth/whatsapp/status", {
    method: "POST",
    body: JSON.stringify({ poll_secret: pollSecret }),
  });
}

export function verifyPhoneCode(pollSecret: string, code: string) {
  return apiRequest<{ verified: boolean; phone: string }>("/auth/whatsapp/verify", {
    method: "POST",
    body: JSON.stringify({ poll_secret: pollSecret, code }),
  });
}

/** Development only: the backend refuses unless WHATSAPP_DEV_SIMULATE is on. */
export function simulateWhatsAppMessage(pollSecret: string) {
  return apiRequest<{ code: string }>("/auth/whatsapp/dev/simulate", {
    method: "POST",
    body: JSON.stringify({ poll_secret: pollSecret }),
  });
}

export const COUNTRIES = [
  { code: "EG", dial: "+20", label: "Egypt" },
  { code: "SA", dial: "+966", label: "Saudi Arabia" },
  { code: "AE", dial: "+971", label: "UAE" },
  { code: "KW", dial: "+965", label: "Kuwait" },
  { code: "QA", dial: "+974", label: "Qatar" },
  { code: "BH", dial: "+973", label: "Bahrain" },
  { code: "OM", dial: "+968", label: "Oman" },
  { code: "JO", dial: "+962", label: "Jordan" },
  { code: "LB", dial: "+961", label: "Lebanon" },
  { code: "IQ", dial: "+964", label: "Iraq" },
  { code: "MA", dial: "+212", label: "Morocco" },
  { code: "GB", dial: "+44", label: "United Kingdom" },
  { code: "US", dial: "+1", label: "United States" },
] as const;

/** "+20" + "0128 833 9613" -> "+201288339613" (national leading 0 dropped). */
export function toE164(dial: string, national: string) {
  const digits = national.replace(/\D/g, "").replace(/^0+/, "");
  return digits ? `${dial}${digits}` : "";
}

export type Availability = {
  email_available: boolean | null;
  username_available: boolean | null;
  username_valid: boolean | null;
};

export function checkAvailability(fields: { email?: string; username?: string }) {
  return apiRequest<Availability>("/auth/availability", {
    method: "POST",
    body: JSON.stringify(fields),
  });
}
