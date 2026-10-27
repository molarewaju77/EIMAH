import { Resend } from "npm:resend@4.1.2";
import { contactAdminTemplate, contactAutoReplyTemplate } from "./templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // 1. Handle CORS Preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      throw new Error("RESEND_API_KEY secret is not set in Supabase.");
    }

    const resend = new Resend(apiKey);
    const body = await req.json();

    const rawName = String(body.name || "").trim();
    const name =
      !rawName ||
      rawName.toLowerCase().includes("restock") ||
      rawName.toLowerCase() === "customer"
        ? "Esteemed Customer"
        : rawName;
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "N/A").trim();
    const subject = String(body.subject || "General Inquiry").trim();
    const message = String(body.message || "").trim();

    if (!email || !message) {
      return new Response(
        JSON.stringify({ error: "Email and message are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Render Admin Notification
    const adminHtml = contactAdminTemplate
      .replace(/{{name}}/g, name)
      .replace(/{{email}}/g, email)
      .replace(/{{phone}}/g, phone)
      .replace(/{{subject}}/g, subject)
      .replace(/{{message}}/g, message);

    // 2. Render Customer Auto-reply
    const customerHtml = contactAutoReplyTemplate
      .replace(/{{name}}/g, name)
      .replace(/{{subject}}/g, subject)
      .replace(/{{message}}/g, message)
      .replace(/{{year}}/g, String(new Date().getFullYear()));

    const emailPromises: Promise<any>[] = [];

    // 1. Send Admin Notification to hello@eimah.com
    emailPromises.push(
      resend.emails.send({
        from: "EIMAH Contact <hello@eimah.com>",
        to: "hello@eimah.com",
        replyTo: email,
        subject: `[New Inquiry] ${subject} — ${name}`,
        html: adminHtml,
      })
    );

    // 2. Send Customer Auto-reply to customer
    emailPromises.push(
      resend.emails.send({
        from: "EIMAH <hello@eimah.com>",
        to: email,
        replyTo: "hello@eimah.com",
        subject: "We've received your message — EIMAH",
        html: customerHtml,
      })
    );

    const results = await Promise.allSettled(emailPromises);
    console.log("[Edge Function: send-contact-email] Results:", results);

    return new Response(
      JSON.stringify({ success: true, message: "Inquiry emails dispatched successfully." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[Edge Function: send-contact-email Error]", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Internal server error." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
