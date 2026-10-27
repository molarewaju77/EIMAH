import { Resend } from "npm:resend@4.1.2";
import {
  orderCourierReceivedTemplate,
  orderPickupReceivedTemplate,
  orderCourierShippedTemplate,
  orderPickupReadyTemplate,
  orderCourierDeliveredTemplate,
  orderPickupCollectedTemplate,
  orderAdminAlertTemplate,
} from "./templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function formatNaira(amount: number): string {
  return "₦" + Number(amount || 0).toLocaleString("en-NG");
}

function renderItemsTable(items: any[]): string {
  if (!items || !items.length) {
    return `<tr><td colspan="3" style="padding: 10px 0; color: #64748b; font-size: 13px; text-align: center;">1x Custom Studio Order</td></tr>`;
  }

  return items
    .map((item: any) => {
      const itemSubtotal = item.subtotal || Number(item.price || 0) * Number(item.qty || 1);
      const variantText = item.variant
        ? `<div style="font-size: 11.5px; color: #64748b; margin-top: 2px;">${item.variant}</div>`
        : "";
      const weightText = item.weight
        ? `<span style="color: #94a3b8; font-size: 11px;"> (${item.weight} kg)</span>`
        : "";

      return `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
            <div style="font-weight: 600; font-size: 13px; color: #0f172a; line-height: 1.4;">${item.name}${weightText}</div>
            ${variantText}
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: center; color: #475569; font-weight: 500; font-size: 13px; vertical-align: top;">
            ${item.qty || 1}
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 600; font-size: 13px; color: #0f172a; vertical-align: top;">
            ${formatNaira(itemSubtotal)}
          </td>
        </tr>
      `;
    })
    .join("");
}

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
    const payload = await req.json();

    const type = payload.type || (payload.record ? "INSERT" : "MANUAL");
    const record = payload.record || payload;
    const oldRecord = payload.old_record || {};

    if (!record || !record.id) {
      return new Response(JSON.stringify({ message: "No order record found in payload." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orderId = String(record.id);
    const trackingId = String(record.tracking_id || record.trackingId || orderId);
    const customerName = String(record.customer || "Valued Customer").trim();
    const customerEmail = String(record.email || "").trim().toLowerCase();
    const customerPhone = String(record.phone || "N/A").trim();
    const total = Number(record.total || 0);
    const subtotal = Number(record.subtotal || total);
    const shippingFee = Number(record.shipping_fee || record.shippingFee || 0);
    const status = String(record.status || "Paid");
    const oldStatus = String(oldRecord?.status || "");
    const deliveryMethod = String(record.delivery_method || record.deliveryMethod || "Courier");
    const isPickup = deliveryMethod.toLowerCase().includes("pickup");
    const address = String(record.address || (isPickup ? "Main Pickup Station, Lagos" : "Delivery Address"));
    const courierName = String(record.courier_name || record.courier || "Express Courier Delivery");
    const estimatedDelivery = String(record.estimated_delivery || "2 - 4 Business Days");
    const pickupLocation = String(record.pickup_location || address);
    const pickupDateTime = String(record.pickup_time || "Mon - Sat (9:00 AM - 6:00 PM)");
    const pickupReference = String(record.pickup_ref || `PK-${orderId.slice(-6).toUpperCase()}`);
    const items = Array.isArray(record.items) ? record.items : [];

    const orderDate = new Date(record.created_at || Date.now()).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const deliveryDate = new Date().toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const formattedSubtotal = formatNaira(subtotal);
    const formattedShipping = shippingFee > 0 ? formatNaira(shippingFee) : "Free";
    const formattedTotal = formatNaira(total);
    const itemsHtml = renderItemsTable(items);
    const currentYear = String(new Date().getFullYear());

    console.log(`[Edge Function: handle-order-event] Processing: ${type} for #${orderId} (Status: ${status}, Old: ${oldStatus}, isPickup: ${isPickup})`);

    const emailPromises: Promise<any>[] = [];

    // ==========================================
    // 1. ORDER CREATED / PAID (INSERT Event)
    // ==========================================
    if (type === "INSERT" || (status === "Paid" && oldStatus !== "Paid")) {
      const receiptTemplate = isPickup ? orderPickupReceivedTemplate : orderCourierReceivedTemplate;
      const receiptHtml = receiptTemplate
        .replace(/{{customerName}}/g, customerName)
        .replace(/{{orderId}}/g, orderId)
        .replace(/{{orderDate}}/g, orderDate)
        .replace(/{{trackingId}}/g, trackingId)
        .replace(/{{subtotal}}/g, formattedSubtotal)
        .replace(/{{shippingFee}}/g, formattedShipping)
        .replace(/{{total}}/g, formattedTotal)
        .replace(/{{deliveryMethod}}/g, deliveryMethod)
        .replace(/{{shippingAddress}}/g, address)
        .replace(/{{customerPhone}}/g, customerPhone)
        .replace(/{{itemsHtml}}/g, itemsHtml)
        .replace(/{{year}}/g, currentYear);

      const adminAlertHtml = orderAdminAlertTemplate
        .replace(/{{customerName}}/g, customerName)
        .replace(/{{customerEmail}}/g, customerEmail)
        .replace(/{{customerPhone}}/g, customerPhone)
        .replace(/{{orderId}}/g, orderId)
        .replace(/{{trackingId}}/g, trackingId)
        .replace(/{{total}}/g, formattedTotal)
        .replace(/{{deliveryMethod}}/g, deliveryMethod)
        .replace(/{{shippingAddress}}/g, address)
        .replace(/{{itemsHtml}}/g, itemsHtml)
        .replace(/{{year}}/g, currentYear);

      if (customerEmail && customerEmail.includes("@")) {
        emailPromises.push(
          resend.emails.send({
            from: "EIMAH Orders <hello@eimah.com>",
            to: customerEmail,
            replyTo: "hello@eimah.com",
            subject: `Your Eimah Order Confirmation – Order #${orderId}`,
            html: receiptHtml,
          })
        );
      }

      emailPromises.push(
        resend.emails.send({
          from: "EIMAH Orders <hello@eimah.com>",
          to: "hello@eimah.com",
          replyTo: customerEmail || "hello@eimah.com",
          subject: `💰 [New Order] #${orderId} — ${formattedTotal} by ${customerName}`,
          html: adminAlertHtml,
        })
      );
    }

    // ==========================================
    // 2. ORDER SHIPPED / READY FOR PICKUP (UPDATE Event)
    // ==========================================
    if (
      (status === "Shipped" || status === "Ready for Pick-up") &&
      oldStatus !== "Shipped" &&
      oldStatus !== "Ready for Pick-up"
    ) {
      if (isPickup || status === "Ready for Pick-up") {
        const pickupHtml = orderPickupReadyTemplate
          .replace(/{{customerName}}/g, customerName)
          .replace(/{{orderId}}/g, orderId)
          .replace(/{{pickupLocation}}/g, pickupLocation)
          .replace(/{{pickupDateTime}}/g, pickupDateTime)
          .replace(/{{pickupReference}}/g, pickupReference)
          .replace(/{{year}}/g, currentYear);

        if (customerEmail && customerEmail.includes("@")) {
          emailPromises.push(
            resend.emails.send({
              from: "EIMAH Orders <hello@eimah.com>",
              to: customerEmail,
              replyTo: "hello@eimah.com",
              subject: `Your Eimah Order Is Ready for Pickup – Order #${orderId}`,
              html: pickupHtml,
            })
          );
        }
      } else {
        const shippedHtml = orderCourierShippedTemplate
          .replace(/{{customerName}}/g, customerName)
          .replace(/{{orderId}}/g, orderId)
          .replace(/{{courierName}}/g, courierName)
          .replace(/{{trackingId}}/g, trackingId)
          .replace(/{{estimatedDelivery}}/g, estimatedDelivery)
          .replace(/{{year}}/g, currentYear);

        if (customerEmail && customerEmail.includes("@")) {
          emailPromises.push(
            resend.emails.send({
              from: "EIMAH Shipping <hello@eimah.com>",
              to: customerEmail,
              replyTo: "hello@eimah.com",
              subject: `Your Eimah Order Is on the Way – Order #${orderId}`,
              html: shippedHtml,
            })
          );
        }
      }
    }

    // ==========================================
    // 3. ORDER DELIVERED / COLLECTED (UPDATE Event)
    // ==========================================
    if (
      (status === "Delivered" || status === "Collected") &&
      oldStatus !== "Delivered" &&
      oldStatus !== "Collected"
    ) {
      if (isPickup || status === "Collected") {
        const collectedHtml = orderPickupCollectedTemplate
          .replace(/{{customerName}}/g, customerName)
          .replace(/{{orderId}}/g, orderId)
          .replace(/{{collectionDate}}/g, deliveryDate)
          .replace(/{{pickupLocation}}/g, pickupLocation)
          .replace(/{{year}}/g, currentYear);

        if (customerEmail && customerEmail.includes("@")) {
          emailPromises.push(
            resend.emails.send({
              from: "EIMAH Orders <hello@eimah.com>",
              to: customerEmail,
              replyTo: "hello@eimah.com",
              subject: `Delivered! Your Eimah Order Is Here – Order #${orderId}`,
              html: collectedHtml,
            })
          );
        }
      } else {
        const deliveredHtml = orderCourierDeliveredTemplate
          .replace(/{{customerName}}/g, customerName)
          .replace(/{{orderId}}/g, orderId)
          .replace(/{{deliveryDate}}/g, deliveryDate)
          .replace(/{{shippingAddress}}/g, address)
          .replace(/{{year}}/g, currentYear);

        if (customerEmail && customerEmail.includes("@")) {
          emailPromises.push(
            resend.emails.send({
              from: "EIMAH Orders <hello@eimah.com>",
              to: customerEmail,
              replyTo: "hello@eimah.com",
              subject: `Delivered! Your Eimah Order Is Here – Order #${orderId}`,
              html: deliveredHtml,
            })
          );
        }
      }
    }

    const settled = await Promise.allSettled(emailPromises);
    const failures: any[] = [];
    const successes: any[] = [];

    settled.forEach((item) => {
      if (item.status === "rejected") {
        failures.push(item.reason?.message || String(item.reason));
      } else if (item.value?.error) {
        failures.push(item.value.error?.message || JSON.stringify(item.value.error));
      } else {
        successes.push(item.value?.data?.id);
      }
    });

    if (failures.length > 0) {
      console.error(`[Edge Function: handle-order-event] ⚠️ Failures for #${orderId}:`, failures);
    } else {
      console.log(`[Edge Function: handle-order-event] ✅ Finished processing #${orderId}:`, successes);
    }

    return new Response(JSON.stringify({ success: failures.length === 0, failures, count: successes.length }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[Edge Function: handle-order-event Error]", error);
    return new Response(JSON.stringify({ error: error?.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
