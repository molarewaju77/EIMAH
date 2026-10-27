import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);

      // Dedicated Paystack Webhook endpoint (proxies to Supabase Edge Function)
      if (url.pathname === "/api/webhooks/paystack") {
        if (request.method === "POST") {
          try {
            const signature = request.headers.get("x-paystack-signature") || "";
            const rawBody = await request.text();
            const edgeRes = await fetch(
              "https://waxwaoycblhkihrxvifb.supabase.co/functions/v1/paystack-webhook",
              {
                method: "POST",
                headers: {
                  "content-type": "application/json",
                  "x-paystack-signature": signature,
                },
                body: rawBody,
              }
            );
            const resJson = await edgeRes.json().catch(() => ({}));
            return new Response(JSON.stringify(resJson), {
              status: edgeRes.status,
              headers: { "content-type": "application/json" },
            });
          } catch (err: any) {
            console.error("[Paystack Webhook Forwarding Error]", err);
            return new Response(
              JSON.stringify({ error: err?.message || "Webhook processing failed" }),
              {
                status: 400,
                headers: { "content-type": "application/json" },
              },
            );
          }
        } else if (request.method === "GET") {
          return new Response(
            JSON.stringify({ status: "active", endpoint: "https://waxwaoycblhkihrxvifb.supabase.co/functions/v1/paystack-webhook" }),
            {
              status: 200,
              headers: { "content-type": "application/json" },
            },
          );
        }
      }

      // Dedicated Flutterwave Webhook endpoint (proxies to Supabase Edge Function)
      if (url.pathname === "/api/webhooks/flutterwave") {
        if (request.method === "POST") {
          try {
            const signature = request.headers.get("verif-hash") || "";
            const rawBody = await request.text();
            const edgeRes = await fetch(
              "https://waxwaoycblhkihrxvifb.supabase.co/functions/v1/flutterwave-webhook",
              {
                method: "POST",
                headers: {
                  "content-type": "application/json",
                  "verif-hash": signature,
                },
                body: rawBody,
              }
            );
            const resJson = await edgeRes.json().catch(() => ({}));
            return new Response(JSON.stringify(resJson), {
              status: edgeRes.status,
              headers: { "content-type": "application/json" },
            });
          } catch (err: any) {
            console.error("[Flutterwave Webhook Forwarding Error]", err);
            return new Response(
              JSON.stringify({ error: err?.message || "Webhook processing failed" }),
              {
                status: 400,
                headers: { "content-type": "application/json" },
              },
            );
          }
        } else if (request.method === "GET") {
          return new Response(
            JSON.stringify({ status: "active", endpoint: "https://waxwaoycblhkihrxvifb.supabase.co/functions/v1/flutterwave-webhook" }),
            {
              status: 200,
              headers: { "content-type": "application/json" },
            },
          );
        }
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
