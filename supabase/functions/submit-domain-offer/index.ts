import { createClient } from "https://esm.sh/@supabase/supabase-js@2.101.1";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.25.76";

const allowedOrigins = new Set([
  "https://techfriday.tech",
  "https://www.techfriday.tech",
  "https://techfriday-launchpad.lovable.app",
  "http://localhost:8080",
]);

const offerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  company: z.string().trim().max(120).optional(),
  email: z.string().trim().email().max(254),
  website: z.string().trim().url().max(500).optional().or(z.literal("")),
  offerAmount: z.coerce.number().int().min(100).max(100_000_000),
  intendedUse: z.string().trim().min(2).max(120),
  message: z.string().trim().max(2000).optional(),
  acknowledgment: z.literal(true),
  websiteCheck: z.string().max(0).optional(),
}).strict();

const securityHeaders = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
};

function response(origin: string, body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, ...securityHeaders, "Access-Control-Allow-Origin": origin, Vary: "Origin" },
  });
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sendOptionalEmail(offer: z.infer<typeof offerSchema>) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const recipient = Deno.env.get("OFFER_NOTIFICATION_EMAIL");
  const sender = Deno.env.get("OFFER_FROM_EMAIL");
  if (!apiKey || !recipient || !sender) return;

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: sender,
      to: [recipient],
      subject: `TechFriday.tech offer: $${offer.offerAmount.toLocaleString()} from ${offer.name}`,
      text: [
        `Name: ${offer.name}`,
        `Company: ${offer.company || "Not provided"}`,
        `Email: ${offer.email}`,
        `Website: ${offer.website || "Not provided"}`,
        `Offer: $${offer.offerAmount.toLocaleString()} USD`,
        `Intended use: ${offer.intendedUse}`,
        `Message: ${offer.message || "Not provided"}`,
      ].join("\n"),
    }),
  });
  if (!emailResponse.ok) console.error("Offer notification email failed", emailResponse.status);
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") ?? "";
  if (!allowedOrigins.has(origin)) return response("null", { error: "Origin not allowed" }, 403);
  if (req.method === "OPTIONS") return new Response("ok", { headers: { ...corsHeaders, "Access-Control-Allow-Origin": origin, Vary: "Origin" } });
  if (req.method !== "POST") return response(origin, { error: "Method not allowed" }, 405);

  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (contentLength > 12_000) return response(origin, { error: "Request is too large" }, 413);

  try {
    const parsed = offerSchema.safeParse(await req.json());
    if (!parsed.success) return response(origin, { error: "Please check the form and try again." }, 400);
    const offer = parsed.data;
    if (offer.websiteCheck) return response(origin, { success: true }, 200);

    const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const fingerprint = await sha256(`${forwarded}|${offer.email.toLowerCase()}`);
    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceKey) return response(origin, { error: "Inquiry service is unavailable." }, 503);
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error: countError } = await admin
      .from("domain_inquiries")
      .select("id", { count: "exact", head: true })
      .eq("submission_fingerprint", fingerprint)
      .gte("created_at", oneHourAgo);
    if (countError) throw countError;
    if ((count ?? 0) >= 3) return response(origin, { error: "Too many inquiries. Please try again later." }, 429);

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count: duplicateCount, error: duplicateError } = await admin
      .from("domain_inquiries")
      .select("id", { count: "exact", head: true })
      .eq("submission_fingerprint", fingerprint)
      .eq("offer_amount", offer.offerAmount)
      .gte("created_at", tenMinutesAgo);
    if (duplicateError) throw duplicateError;
    if ((duplicateCount ?? 0) > 0) return response(origin, { success: true }, 200);

    const { error: insertError } = await admin.from("domain_inquiries").insert({
      name: offer.name,
      company: offer.company || null,
      email: offer.email.toLowerCase(),
      website: offer.website || null,
      offer_amount: offer.offerAmount,
      intended_use: offer.intendedUse,
      message: offer.message || null,
      submission_fingerprint: fingerprint,
    });
    if (insertError) throw insertError;

    await sendOptionalEmail(offer);
    return response(origin, { success: true }, 201);
  } catch (error) {
    console.error("submit-domain-offer failed", error instanceof Error ? error.message : "Unknown error");
    return response(origin, { error: "We couldn’t submit your inquiry. Please try again shortly." }, 500);
  }
});
