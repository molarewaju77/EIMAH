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
    min-width: 130px;
  }
  .detail-val {
    color: #0f172a;
    font-weight: 600;
  }
  .signoff {
    font-size: 13.5px;
    color: #475569;
    line-height: 1.6;
    margin: 18px 0 14px;
  }
  .btn-container {
    text-align: left;
    margin: 20px 0 22px;
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

// ============================================================================
// 7. TRAINING APPLICATION CONFIRMATION MAIL
// ============================================================================
export const trainingEnrollmentTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>{{trainingName}} Application Received – Eimah</title>
    <style>${sharedStyles}</style>
  </head>
  <body>
    <div class="card">
      ${headerHtml}
      <div class="content">
        <h1 class="title">Application Received</h1>
        <p class="greeting">Dear {{applicantName}},</p>
        <p class="greeting">
          Thank you for applying for {{trainingName}} with Eimah.
        </p>
        <p class="greeting">
          We have successfully received your application and it is currently being reviewed.
        </p>

        <div class="details-box">
          <div class="detail-row"><span class="detail-label">Training:</span> <span class="detail-val">{{trainingName}}</span></div>
          <div class="detail-row"><span class="detail-label">Application Date:</span> <span class="detail-val">{{applicationDate}}</span></div>
          <div class="detail-row"><span class="detail-label">Application Reference:</span> <span class="detail-val">{{applicationReference}}</span></div>
        </div>

        <p class="greeting">
          We will contact you with the next steps once your application has been reviewed.
        </p>

        <p class="greeting">
          Thank you for choosing Eimah.
        </p>

        <div class="signoff">
          Kind Regards,<br />
          <strong>Eimah Team</strong>
        </div>
      </div>
      ${footerHtml}
    </div>
  </body>
</html>`;

// ============================================================================
// 8. SERVICE CONFIRMATION MAIL (BUSINESS CONSULTATION / SERVICES)
// ============================================================================
export const businessConsultationTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>{{serviceName}} Application Received – Eimah</title>
    <style>${sharedStyles}</style>
  </head>
  <body>
    <div class="card">
      ${headerHtml}
      <div class="content">
        <h1 class="title">Application Received</h1>
        <p class="greeting">Dear {{customerName}},</p>
        <p class="greeting">
          Thank you for choosing Eimah. We have successfully received your application for {{serviceName}} and our team will review the details provided.
        </p>

        <div class="details-box">
          <div class="detail-row"><span class="detail-label">Service:</span> <span class="detail-val">{{serviceName}}</span></div>
          <div class="detail-row"><span class="detail-label">Application Date:</span> <span class="detail-val">{{applicationDate}}</span></div>
          <div class="detail-row"><span class="detail-label">Application Reference:</span> <span class="detail-val">{{applicationReference}}</span></div>
        </div>

        <p class="greeting">
          We will contact you with the next steps regarding your request.
        </p>

        <p class="greeting">
          Thank you for choosing Eimah.
        </p>

        <div class="signoff">
          Kind regards,<br />
          <strong>Eimah Team</strong>
        </div>
      </div>
      ${footerHtml}
    </div>
  </body>
</html>`;

// ============================================================================
// 9. ADMIN APPLICATION ALERT TEMPLATE
// ============================================================================
export const adminApplicationAlertTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>New Application Alert - {{applicationReference}}</title>
    <style>${sharedStyles}</style>
  </head>
  <body>
    <div class="card">
      ${headerHtml}
      <div class="content">
        <h1 class="title">New Application Alert ⚡</h1>
        <p class="greeting">
          A new application has been submitted on EIMAH.
        </p>

        <div class="details-box">
          <div class="detail-row"><span class="detail-label">Type / Program:</span> <span class="detail-val">{{programType}}</span></div>
          <div class="detail-row"><span class="detail-label">Applicant Name:</span> <span class="detail-val">{{applicantName}}</span></div>
          <div class="detail-row"><span class="detail-label">Applicant Email:</span> <span class="detail-val">{{applicantEmail}}</span></div>
          <div class="detail-row"><span class="detail-label">Applicant Phone:</span> <span class="detail-val">{{applicantPhone}}</span></div>
          <div class="detail-row"><span class="detail-label">Date Submitted:</span> <span class="detail-val">{{applicationDate}}</span></div>
          <div class="detail-row"><span class="detail-label">Reference ID:</span> <span class="detail-val">{{applicationReference}}</span></div>
        </div>

        <div class="btn-container">
          <a href="https://eimah.com/admin/applications" class="btn">View in Admin Portal</a>
        </div>
      </div>
      ${footerHtml}
    </div>
  </body>
</html>`;
