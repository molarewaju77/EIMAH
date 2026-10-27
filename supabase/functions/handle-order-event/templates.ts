// ============================================================================
// SHARED DESIGN TOKENS & STYLES (EIMAH UNIFIED DESIGN SYSTEM)
// ============================================================================

const sharedStyles = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    margin: 0;
    padding: 0;
    -webkit-font-smoothing: antialiased;
  }
  .card {
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 0;
    max-width: 540px;
    margin: 0 auto;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
  }
  .header {
    padding: 20px 28px 0;
    text-align: left;
  }
  .logo-img {
    height: 24px;
    max-height: 24px;
    width: auto;
    display: block;
    border: 0;
  }
  .brand-fallback {
    font-size: 19px;
    font-weight: 700;
    letter-spacing: -0.3px;
    color: #0f172a;
    margin: 0;
    text-decoration: none;
  }
  .brand-fallback span {
    color: #f590dd;
  }
  .divider {
    border-bottom: 1px solid #edf2f7;
    margin-top: 14px;
  }
  .content {
    padding: 16px 28px 28px;
  }
  .title {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 12px;
    letter-spacing: -0.2px;
  }
  .greeting {
    font-size: 14px;
    line-height: 1.6;
    color: #475569;
    margin: 0 0 14px;
  }
  /* Details Box */
  .details-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-left: 3px solid #f590dd;
    border-radius: 0;
    padding: 14px 18px;
    margin: 18px 0;
  }
  .detail-row {
    padding: 5px 0;
    font-size: 13px;
  }
  .detail-label {
    color: #64748b;
    font-weight: 500;
    display: inline-block;
    min-width: 120px;
  }
  .detail-val {
    color: #0f172a;
    font-weight: 600;
  }
  /* Section Heading */
  .section-heading {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #0f172a;
    margin: 22px 0 10px;
  }
  /* Order Items Table */
  .items-table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
  }
  .items-table th {
    text-align: left;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #94a3b8;
    padding-bottom: 8px;
    border-bottom: 1px solid #e2e8f0;
  }
  .items-table td {
    padding: 10px 0;
    border-bottom: 1px solid #f1f5f9;
    font-size: 13px;
  }
  .items-total-box {
    border-top: 1px solid #e2e8f0;
    padding-top: 12px;
    margin-top: 8px;
  }
  .total-row {
    display: flex;
    justify-content: space-between;
    font-size: 12.5px;
    color: #64748b;
    margin-bottom: 5px;
  }
  .total-row.grand {
    font-size: 14px;
    font-weight: 700;
    color: #0f172a;
    border-top: 1px solid #e2e8f0;
    padding-top: 8px;
    margin-top: 6px;
  }
  /* Button */
  .btn-container {
    text-align: left;
    margin: 18px 0 20px;
  }
  .btn {
    display: inline-block;
    background-color: #f590dd;
    color: #ffffff !important;
    text-decoration: none;
    padding: 12px 24px;
    border-radius: 0;
    font-weight: 500;
    font-size: 13px;
    letter-spacing: 0.2px;
    text-align: center;
  }
  .promo-banner {
    display: block;
    background-color: #0f172a;
    color: #ffffff !important;
    text-align: center;
    text-decoration: none;
    padding: 14px 20px;
    font-weight: 600;
    font-size: 13px;
    letter-spacing: 0.5px;
    margin: 20px 0;
    border-radius: 0;
  }
  .signoff {
    font-size: 13.5px;
    color: #475569;
    line-height: 1.6;
    margin: 18px 0 14px;
  }
  /* Get In Touch Box */
  .support-box {
    background-color: #f1f3f6;
    padding: 22px 20px 20px;
    text-align: center;
    border-top: 1px solid #e2e8f0;
    width: 100%;
    box-sizing: border-box;
  }
  .support-title {
    font-size: 12.5px;
    font-weight: 600;
    color: #0f172a;
    margin: 0 0 5px;
    letter-spacing: -0.1px;
  }
  .support-contact {
    font-size: 11.5px;
    color: #475569;
    line-height: 1.5;
    margin: 0 0 10px;
  }
  .support-contact a {
    color: #0f172a;
    font-weight: 500;
    text-decoration: none;
  }
  .social-links {
    margin: 0;
    text-align: center;
  }
  /* Locked Light Scheme (Prevents color inversion in Dark Mode) */
  :root {
    color-scheme: light;
    supported-color-schemes: light;
  }
  /* Bottom Branded Banner Bar */
  .bottom-banner {
    background-color: #f590dd;
    color: #ffffff;
    font-size: 14px;
    font-weight: 400;
    text-align: center;
    padding: 12px 16px;
    letter-spacing: 0.1px;
  }
`;

const headerHtml = `
  <div class="header">
    <a href="https://emah-brand-studio.vercel.app" target="_blank" style="text-decoration: none; display: inline-block;">
      <img 
        src="https://emah-brand-studio.vercel.app/eimah-logo.svg" 
        alt="EIMAH." 
        class="logo-img"
        style="height: 24px; max-height: 24px; width: auto; display: block; border: 0;"
        onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
      />
      <span class="brand-fallback" style="display: none;">EIMAH<span>.</span></span>
    </a>
    <div class="divider"></div>
  </div>
`;

const footerHtml = `
  <div class="support-box">
    <div class="support-title">Get in touch</div>
    <div class="support-contact">
      Call or WhatsApp us at <a href="https://wa.me/2349071464295">+234 907 146 4295</a><br />
      <a href="mailto:hello@eimah.com">hello@eimah.com</a>
    </div>
    <div class="social-links" style="margin-top: 14px; text-align: center;">
      <a href="https://www.instagram.com/eimah_official?igsi=MWpwbThqdGd4MWJmNQ%3D%3D&utm_source=qr" target="_blank" style="display: inline-block; margin: 0 8px; text-decoration: none; vertical-align: middle;" title="Instagram">
        <img src="https://img.icons8.com/material-outlined/48/64748b/instagram-new.png" width="18" height="18" alt="Instagram" style="display: block; width: 18px; height: 18px; border: 0;" />
      </a>
      <a href="https://www.tiktok.com/@eimah_official?_r=1&_t=ZS-99AoU7Nqh41" target="_blank" style="display: inline-block; margin: 0 8px; text-decoration: none; vertical-align: middle;" title="TikTok">
        <img src="https://img.icons8.com/material-outlined/48/64748b/tiktok.png" width="18" height="18" alt="TikTok" style="display: block; width: 18px; height: 18px; border: 0;" />
      </a>
      <a href="https://wa.me/2349071464295" target="_blank" style="display: inline-block; margin: 0 8px; text-decoration: none; vertical-align: middle;" title="WhatsApp">
        <img src="https://img.icons8.com/material-outlined/48/64748b/whatsapp.png" width="18" height="18" alt="WhatsApp" style="display: block; width: 18px; height: 18px; border: 0;" />
      </a>
    </div>
  </div>
  <div class="bottom-banner">
    Copyright &copy; {{year}} EIMAH. All rights reserved.
  </div>
`;

// ============================================================================
// 1. COURIER DELIVERY: ORDER RECEIVED
// ============================================================================
export const orderCourierReceivedTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>Your Eimah Order Confirmation – Order {{orderId}}</title>
    <style>${sharedStyles}</style>
  </head>
  <body>
    <div class="card">
      ${headerHtml}
      <div class="content">
        <h1 class="title">Order Confirmation</h1>
        <p class="greeting">Dear {{customerName}},</p>
        <p class="greeting">
          Thank you for your order with Eimah! We have received your order #{{orderId}} and we’re getting it ready for shipping.
        </p>

        <div class="details-box">
          <div class="detail-row"><span class="detail-label">Order ID:</span> <span class="detail-val">#{{orderId}}</span></div>
          <div class="detail-row"><span class="detail-label">Order Date:</span> <span class="detail-val">{{orderDate}}</span></div>
          <div class="detail-row"><span class="detail-label">Tracking ID:</span> <span class="detail-val" style="font-family: monospace;">{{trackingId}}</span></div>
          <div class="detail-row"><span class="detail-label">Delivery Method:</span> <span class="detail-val">Courier Delivery</span></div>
        </div>

        <div class="btn-container">
          <a href="https://emah-brand-studio.vercel.app/track?id={{trackingId}}" class="btn">Track Your Order Live</a>
        </div>

        <div class="section-heading">Order Breakdown</div>
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: center; width: 40px;">Qty</th>
              <th style="text-align: right; width: 90px;">Price</th>
            </tr>
          </thead>
          <tbody>
            {{itemsHtml}}
          </tbody>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-top: 1px solid #e2e8f0; margin-top: 10px; border-collapse: collapse;">
          <tr>
            <td align="left" style="padding: 6px 0 3px; font-size: 13px; color: #64748b; text-align: left;">Subtotal:</td>
            <td align="right" style="padding: 6px 0 3px; font-size: 13px; font-weight: 500; color: #0f172a; text-align: right;">{{subtotal}}</td>
          </tr>
          <tr>
            <td align="left" style="padding: 3px 0 6px; font-size: 13px; color: #64748b; text-align: left;">Shipping:</td>
            <td align="right" style="padding: 3px 0 6px; font-size: 13px; font-weight: 500; color: #0f172a; text-align: right;">{{shippingFee}}</td>
          </tr>
          <tr>
            <td align="left" style="padding: 8px 0 2px; font-size: 13.5px; font-weight: 600; color: #0f172a; border-top: 1px solid #e2e8f0; text-align: left;">Total:</td>
            <td align="right" style="padding: 8px 0 2px; font-size: 14px; font-weight: 600; color: #0f172a; border-top: 1px solid #e2e8f0; text-align: right;">{{total}}</td>
          </tr>
        </table>

        <p class="greeting" style="margin-top: 18px;">
          We will notify you once your order has been shipped.
        </p>

        <div class="signoff">
          Thank you for choosing Eimah.<br />
          <strong>Eimah Team</strong>
        </div>
      </div>
      ${footerHtml}
    </div>
  </body>
</html>`;

// Alias for backward compatibility
export const orderReceiptTemplate = orderCourierReceivedTemplate;

// ============================================================================
// 2. COURIER DELIVERY: ORDER SHIPPED
// ============================================================================
export const orderCourierShippedTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>Your Eimah Order Is on the Way – Order #{{orderId}}</title>
    <style>${sharedStyles}</style>
  </head>
  <body>
    <div class="card">
      ${headerHtml}
      <div class="content">
        <h1 class="title">Order on the Way</h1>
        <p class="greeting">Dear {{customerName}},</p>
        <p class="greeting">
          Your order #{{orderId}} has been shipped and is now on its way to you.
        </p>

        <div class="details-box">
          <div class="detail-row"><span class="detail-label">Order ID:</span> <span class="detail-val">#{{orderId}}</span></div>
          <div class="detail-row"><span class="detail-label">Courier:</span> <span class="detail-val">{{courierName}}</span></div>
          <div class="detail-row"><span class="detail-label">Tracking ID:</span> <span class="detail-val" style="color: #0f172a; font-family: monospace;">{{trackingId}}</span></div>
          <div class="detail-row"><span class="detail-label">Estimated Delivery:</span> <span class="detail-val">{{estimatedDelivery}}</span></div>
        </div>

        <p class="greeting">
          Kindly use the tracking information above to monitor your delivery progress on our website.
        </p>

        <div class="btn-container">
          <a href="https://emah-brand-studio.vercel.app/track?id={{trackingId}}" class="btn">Track Your Order Live</a>
        </div>

        <div class="signoff">
          Thank you for shopping with Eimah.<br />
          <strong>Eimah Team</strong>
        </div>
      </div>
      ${footerHtml}
    </div>
  </body>
</html>`;

// Alias for backward compatibility
export const orderShippedTemplate = orderCourierShippedTemplate;

// ============================================================================
// 3. COURIER DELIVERY: ORDER DELIVERED
// ============================================================================
export const orderCourierDeliveredTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>Delivered! Your Eimah Order Is Here – Order #{{orderId}}</title>
    <style>${sharedStyles}</style>
  </head>
  <body>
    <div class="card">
      ${headerHtml}
      <div class="content">
        <h1 class="title">Delivered!</h1>
        <p class="greeting">Dear {{customerName}},</p>
        <p class="greeting">
          Your Eimah order #{{orderId}} has been successfully delivered.
        </p>
        <p class="greeting">
          We hope you enjoy your purchase and that it is everything you expected.
        </p>

        <div class="details-box">
          <div class="detail-row"><span class="detail-label">Order ID:</span> <span class="detail-val">#{{orderId}}</span></div>
          <div class="detail-row"><span class="detail-label">Delivery Date:</span> <span class="detail-val">{{deliveryDate}}</span></div>
          <div class="detail-row"><span class="detail-label">Delivered To:</span> <span class="detail-val">{{shippingAddress}}</span></div>
        </div>

        <p class="greeting">
          Thank you for choosing Eimah.
        </p>
        <p class="greeting" style="font-size: 13px; color: #64748b;">
          We’d love to hear about your experience. If you have any questions or need assistance, please contact us at <a href="mailto:hello@eimah.com" style="color: #0f172a; font-weight: 500;">hello@eimah.com</a>.
        </p>

        <div class="btn-container">
          <a href="https://emah-brand-studio.vercel.app/feedback?order={{orderId}}" class="btn">Leave a Review</a>
        </div>

        <a href="https://emah-brand-studio.vercel.app/shop" class="promo-banner">
          ✦ Discover New Collections – Shop Eimah ✦
        </a>

        <div class="signoff">
          Warm regards,<br />
          <strong>Eimah Team</strong>
        </div>
      </div>
      ${footerHtml}
    </div>
  </body>
</html>`;

// Alias for backward compatibility
export const orderDeliveredTemplate = orderCourierDeliveredTemplate;

// ============================================================================
// 4. PICKUP DELIVERY: ORDER RECEIVED
// ============================================================================
export const orderPickupReceivedTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>Your Eimah Order Confirmation – Order #{{orderId}}</title>
    <style>${sharedStyles}</style>
  </head>
  <body>
    <div class="card">
      ${headerHtml}
      <div class="content">
        <h1 class="title">Order Confirmation</h1>
        <p class="greeting">Dear {{customerName}},</p>
        <p class="greeting">
          Thank you for your order with Eimah. We have received your order #{{orderId}} and it is now being reviewed and processed.
        </p>

        <div class="details-box">
          <div class="detail-row"><span class="detail-label">Order ID:</span> <span class="detail-val">#{{orderId}}</span></div>
          <div class="detail-row"><span class="detail-label">Order Date:</span> <span class="detail-val">{{orderDate}}</span></div>
          <div class="detail-row"><span class="detail-label">Tracking ID:</span> <span class="detail-val" style="font-family: monospace;">{{trackingId}}</span></div>
          <div class="detail-row"><span class="detail-label">Delivery Method:</span> <span class="detail-val">Pickup Station</span></div>
        </div>

        <div class="btn-container">
          <a href="https://emah-brand-studio.vercel.app/track?id={{trackingId}}" class="btn">Track Your Order Live</a>
        </div>

        <div class="section-heading">Order Breakdown</div>
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: center; width: 40px;">Qty</th>
              <th style="text-align: right; width: 90px;">Price</th>
            </tr>
          </thead>
          <tbody>
            {{itemsHtml}}
          </tbody>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-top: 1px solid #e2e8f0; margin-top: 10px; border-collapse: collapse;">
          <tr>
            <td align="left" style="padding: 8px 0 2px; font-size: 13.5px; font-weight: 600; color: #0f172a; text-align: left;">Total:</td>
            <td align="right" style="padding: 8px 0 2px; font-size: 14px; font-weight: 600; color: #0f172a; text-align: right;">{{total}}</td>
          </tr>
        </table>

        <p class="greeting" style="margin-top: 18px;">
          We will notify you once your order is ready for pickup.
        </p>

        <div class="signoff">
          Thank you for choosing Eimah.<br />
          <strong>Eimah Team</strong>
        </div>
      </div>
      ${footerHtml}
    </div>
  </body>
</html>`;

// ============================================================================
// 5. PICKUP DELIVERY: ORDER READY FOR PICKUP
// ============================================================================
export const orderPickupReadyTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>Your Eimah Order Is Ready for Pickup – Order #{{orderId}}</title>
    <style>${sharedStyles}</style>
  </head>
  <body>
    <div class="card">
      ${headerHtml}
      <div class="content">
        <h1 class="title">Ready for Pickup</h1>
        <p class="greeting">Dear {{customerName}},</p>
        <p class="greeting">
          Your order #{{orderId}} is now ready for pickup.
        </p>

        <div class="details-box">
          <div class="detail-row"><span class="detail-label">Order ID:</span> <span class="detail-val">#{{orderId}}</span></div>
          <div class="detail-row"><span class="detail-label">Pickup Location:</span> <span class="detail-val">{{pickupLocation}}</span></div>
          <div class="detail-row"><span class="detail-label">Pickup Date/Time:</span> <span class="detail-val">{{pickupDateTime}}</span></div>
          <div class="detail-row"><span class="detail-label">Pickup Reference:</span> <span class="detail-val" style="color: #0f172a; font-family: monospace;">{{pickupReference}}</span></div>
        </div>

        <p class="greeting">
          Please present your Order ID or pickup reference when collecting your order.
        </p>

        <div class="signoff">
          Thank you for choosing Eimah.<br />
          <strong>Eimah Team</strong>
        </div>
      </div>
      ${footerHtml}
    </div>
  </body>
</html>`;

// ============================================================================
// 6. PICKUP DELIVERY: ORDER DELIVERED (COLLECTED)
// ============================================================================
export const orderPickupCollectedTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>Delivered! Your Eimah Order Is Here – Order #{{orderId}}</title>
    <style>${sharedStyles}</style>
  </head>
  <body>
    <div class="card">
      ${headerHtml}
      <div class="content">
        <h1 class="title">Order Collected</h1>
        <p class="greeting">Dear {{customerName}},</p>
        <p class="greeting">
          Your Eimah order #{{orderId}} has been successfully collected.
        </p>
        <p class="greeting">
          We hope you enjoy your purchase and that it is everything you expected.
        </p>

        <div class="details-box">
          <div class="detail-row"><span class="detail-label">Order ID:</span> <span class="detail-val">#{{orderId}}</span></div>
          <div class="detail-row"><span class="detail-label">Collection Date:</span> <span class="detail-val">{{collectionDate}}</span></div>
          <div class="detail-row"><span class="detail-label">Pickup Location:</span> <span class="detail-val">{{pickupLocation}}</span></div>
        </div>

        <p class="greeting">
          Thank you for choosing Eimah.
        </p>
        <p class="greeting" style="font-size: 13px; color: #64748b;">
          We’d love to hear about your experience. If you have any questions or need assistance, please contact us at <a href="mailto:hello@eimah.com" style="color: #0f172a; font-weight: 500;">hello@eimah.com</a>.
        </p>

        <a href="https://emah-brand-studio.vercel.app/shop" class="promo-banner">
          ✦ Discover New Collections – Shop Eimah ✦
        </a>

        <div class="signoff">
          Warm regards,<br />
          <strong>Eimah Team</strong>
        </div>
      </div>
      ${footerHtml}
    </div>
  </body>
</html>`;

// ============================================================================
// 7. ORDER ADMIN ALERT TEMPLATE
// ============================================================================
export const orderAdminAlertTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>New Paid Order Alert - #{{orderId}}</title>
    <style>${sharedStyles}</style>
  </head>
  <body>
    <div class="card">
      ${headerHtml}
      <div class="content">
        <h1 class="title" style="color: #0f172a;">New Paid Order Received ⚡</h1>
        <p class="greeting">
          A new order has been placed and confirmed paid on EIMAH.
        </p>

        <div class="details-box">
          <div class="detail-row"><span class="detail-label">Order ID:</span> <span class="detail-val">#{{orderId}}</span></div>
          <div class="detail-row"><span class="detail-label">Tracking ID:</span> <span class="detail-val" style="font-family: monospace;">{{trackingId}}</span></div>
          <div class="detail-row"><span class="detail-label">Customer Name:</span> <span class="detail-val">{{customerName}}</span></div>
          <div class="detail-row"><span class="detail-label">Customer Email:</span> <span class="detail-val">{{customerEmail}}</span></div>
          <div class="detail-row"><span class="detail-label">Customer Phone:</span> <span class="detail-val">{{customerPhone}}</span></div>
          <div class="detail-row"><span class="detail-label">Total Amount:</span> <span class="detail-val" style="color: #0f172a;">{{total}}</span></div>
          <div class="detail-row"><span class="detail-label">Delivery Method:</span> <span class="detail-val">{{deliveryMethod}}</span></div>
          <div class="detail-row"><span class="detail-label">Address / Station:</span> <span class="detail-val">{{shippingAddress}}</span></div>
        </div>

        <div class="section-heading">Order Breakdown</div>
        <table class="items-table">
          <thead>
            <tr>
              <th>Ordered Items</th>
              <th style="text-align: center; width: 40px;">Qty</th>
              <th style="text-align: right; width: 90px;">Price</th>
            </tr>
          </thead>
          <tbody>
            {{itemsHtml}}
          </tbody>
        </table>

        <div class="btn-container">
          <a href="https://emah-brand-studio.vercel.app/admin/orders" class="btn">View in Admin Portal</a>
        </div>
      </div>
      ${footerHtml}
    </div>
  </body>
</html>`;
