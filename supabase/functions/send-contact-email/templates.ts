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
  .message-box {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 0;
    padding: 14px;
    font-size: 13.5px;
    line-height: 1.6;
    color: #334155;
    white-space: pre-wrap;
    margin-top: 6px;
  }
  .signoff {
    font-size: 13.5px;
    color: #475569;
    line-height: 1.6;
    margin: 18px 0 14px;
  }
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
    <a href="https://eimah.com" target="_blank" style="text-decoration: none; display: inline-block;">
      <img 
        src="https://eimah.com/eimah-logo.svg" 
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

export const contactAdminTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>New Contact Message - EIMAH</title>
    <style>${sharedStyles}</style>
  </head>
  <body>
    <div class="card">
      ${headerHtml}
      <div class="content">
        <h1 class="title">New Website Inquiry 📩</h1>
        <p class="greeting">
          A visitor has submitted a message via the website contact form.
        </p>

        <div class="details-box">
          <div class="detail-row"><span class="detail-label">Sender Name:</span> <span class="detail-val">{{name}}</span></div>
          <div class="detail-row"><span class="detail-label">Email Address:</span> <span class="detail-val">{{email}}</span></div>
          <div class="detail-row"><span class="detail-label">Subject:</span> <span class="detail-val">{{subject}}</span></div>
        </div>

        <div style="margin: 16px 0;">
          <div class="detail-label" style="margin-bottom: 6px;">Message Content:</div>
          <div class="message-box">{{message}}</div>
        </div>
      </div>
      ${footerHtml}
    </div>
  </body>
</html>`;

export const contactAutoReplyTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>Message Received - EIMAH</title>
    <style>${sharedStyles}</style>
  </head>
  <body>
    <div class="card">
      ${headerHtml}
      <div class="content">
        <h1 class="title">We Received Your Message</h1>
        <p class="greeting">Dear {{name}},</p>
        <p class="greeting">
          Thank you for reaching out to EIMAH. We have received your inquiry and our team will get back to you shortly.
        </p>

        <div class="details-box">
          <div class="detail-row"><span class="detail-label">Topic / Subject:</span> <span class="detail-val">{{subject}}</span></div>
        </div>

        <p class="greeting">
          If your inquiry is urgent, you can also reach us directly on WhatsApp at <a href="https://wa.me/2349071464295" style="color: #0f172a; font-weight: 600;">+234 907 146 4295</a>.
        </p>

        <div class="signoff">
          Warm regards,<br />
          <strong>Eimah Team</strong>
        </div>
      </div>
      ${footerHtml}
    </div>
  </body>
</html>`;
