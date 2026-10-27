import { Resend } from "npm:resend@4.1.2";
import {
  trainingEnrollmentTemplate,
  businessConsultationTemplate,
  adminApplicationAlertTemplate,
} from "./templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      throw new Error("RESEND_API_KEY secret is not set in Supabase.");
    }

    const resend = new Resend(apiKey);
    const body = await req.json().catch(() => ({}));

    const record = body.record || body;
    if (!record || !record.id) {
      return new Response(
        JSON.stringify({ message: "No application record found in webhook payload." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const appId = String(record.id || "").trim();
    const solutionTitle = String(record.solution_title || record.program || record.training_name || "Training / Service Program").trim();
    const category = String(record.category || (record.track === "Academy" ? "Learning" : "Business")).trim();
    const name = String(record.full_name || record.name || record.customer || "Valued Applicant").trim();
    const email = String(record.email || "").trim().toLowerCase();
    const phone = String(record.phone || "N/A").trim();
    const currentYear = String(new Date().getFullYear());
    const applicationDate = new Date(record.created_at || Date.now()).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const applicationReference = String(record.reference || record.application_ref || `#APP-${appId.slice(-6).toUpperCase()}`);

    if (!email) {
      console.warn(`[handle-application-event] No email address for application #${appId}. Skipping.`);
      return new Response(
        JSON.stringify({ success: false, error: "No recipient email found on record." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isLearning = category.toLowerCase() === "learning" || String(record.track || "").toLowerCase() === "academy";

    let customerHtml = "";
    let customerSubject = "";

    if (isLearning) {
      // 1. Training Application confirmation Mail
      customerSubject = `${solutionTitle} Application Received – Eimah`;
      customerHtml = trainingEnrollmentTemplate
        .replace(/{{trainingName}}/g, solutionTitle)
        .replace(/{{applicantName}}/g, name)
        .replace(/{{applicationDate}}/g, applicationDate)
        .replace(/{{applicationReference}}/g, applicationReference)
        .replace(/{{year}}/g, currentYear);
    } else {
      // 2. Service Confirmation mail
      customerSubject = `${solutionTitle} Application Received – Eimah`;
      customerHtml = businessConsultationTemplate
        .replace(/{{serviceName}}/g, solutionTitle)
        .replace(/{{customerName}}/g, name)
        .replace(/{{applicationDate}}/g, applicationDate)
        .replace(/{{applicationReference}}/g, applicationReference)
        .replace(/{{year}}/g, currentYear);
    }

    // 3. Admin Notification Template
    const adminHtml = adminApplicationAlertTemplate
      .replace(/{{programType}}/g, `${isLearning ? "Training Course" : "Service Solution"}: ${solutionTitle}`)
      .replace(/{{applicantName}}/g, name)
      .replace(/{{applicantEmail}}/g, email)
      .replace(/{{applicantPhone}}/g, phone)
      .replace(/{{applicationDate}}/g, applicationDate)
      .replace(/{{applicationReference}}/g, applicationReference)
      .replace(/{{year}}/g, currentYear);

    const emailPromises: Promise<any>[] = [];

    // Send confirmation email to applicant
    emailPromises.push(
      resend.emails.send({
        from: isLearning ? "EIMAH Academy <hello@eimah.com>" : "EIMAH Solutions <hello@eimah.com>",
        to: email,
        replyTo: "hello@eimah.com",
        subject: customerSubject,
        html: customerHtml,
      })
    );

    // Send notification alert to Admin
    emailPromises.push(
      resend.emails.send({
        from: "EIMAH Alerts <hello@eimah.com>",
        to: "hello@eimah.com",
        replyTo: email,
        subject: `🔔 [New Application] ${solutionTitle} — ${name}`,
        html: adminHtml,
      })
    );

    const settled = await Promise.allSettled(emailPromises);
    const failures: any[] = [];
    const successes: any[] = [];

    settled.forEach((item, index) => {
      const recipientType = index === 0 ? `Customer (${email})` : "Admin (hello@eimah.com)";
      if (item.status === "rejected") {
        failures.push({ target: recipientType, error: item.reason?.message || String(item.reason) });
      } else if (item.value?.error) {
        failures.push({ target: recipientType, error: item.value.error?.message || JSON.stringify(item.value.error) });
      } else {
        successes.push({ target: recipientType, id: item.value?.data?.id });
      }
    });

    if (failures.length > 0) {
      console.error("[handle-application-event] Email dispatch failures:", failures);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Some or all emails failed to dispatch.",
          failures,
          successes,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[handle-application-event] ✅ Emails successfully sent for application #${appId} (${category})`);

    return new Response(
      JSON.stringify({ success: true, count: successes.length, successes }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("[handle-application-event Error]", error);
    return new Response(JSON.stringify({ error: error?.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
