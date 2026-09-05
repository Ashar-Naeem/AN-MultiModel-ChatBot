const nodemailer = require("nodemailer");

function getEmailUser() {
  return (process.env.EMAIL_USER || process.env.SMTP_USER || "").trim();
}

function getEmailPass() {
  // Gmail App Passwords are often copied with spaces
  return (process.env.EMAIL_PASS || process.env.SMTP_PASS || "").replace(/\s+/g, "");
}

function isSmtpConfigured() {
  return Boolean(getEmailUser() && getEmailPass());
}

function isResendConfigured() {
  return Boolean((process.env.RESEND_API_KEY || "").trim());
}

function isEmailConfigured() {
  return isSmtpConfigured() || isResendConfigured();
}

function createTransporter(portOverride) {
  const emailUser = getEmailUser();
  const emailPass = getEmailPass();

  if (!emailUser || !emailPass) {
    return null;
  }

  if (process.env.EMAIL_HOST) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587", 10),
      secure: process.env.EMAIL_SECURE === "true",
      auth: { user: emailUser, pass: emailPass }
    });
  }

  const port = portOverride || 465;
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port,
    secure: port === 465,
    requireTLS: port === 587,
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });
}

function buildEmailContent(otp, purpose = "signup") {
  const title =
    purpose === "signup"
      ? "Verify Your Email - AN AI Studio"
      : purpose === "reset_password"
      ? "Password Reset Code - AN AI Studio"
      : "Login Verification Code - AN AI Studio";

  const actionText =
    purpose === "signup"
      ? "creating your AN AI Studio account"
      : purpose === "reset_password"
      ? "resetting your account password"
      : "signing in to AN AI Studio";

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; margin: 0; padding: 24px; color: #f8fafc; }
        .card { max-width: 520px; margin: 0 auto; background: #111827; border-radius: 16px; border: 1px solid #374151; overflow: hidden; }
        .header { background: linear-gradient(135deg, #38bdf8 0%, #6366f1 50%, #a855f7 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
        .body { padding: 32px 28px; }
        .text { font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
        .otp-box { background: rgba(99, 102, 241, 0.1); border: 2px dashed #6366f1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #38bdf8; }
        .expiry { font-size: 13px; color: #f59e0b; margin-top: 8px; }
        .footer { text-align: center; font-size: 12px; color: #475569; padding: 20px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>AN AI Studio</h1>
          <p>${title}</p>
        </div>
        <div class="body">
          <p class="text">
            Thank you for ${actionText}. Use the verification code below. It expires in 10 minutes.
          </p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="expiry">Valid for 10 minutes</div>
          </div>
          <p class="text">
            If you did not request this code, you can ignore this email.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} AN AI Studio. Never share this code with anyone.
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `Your AN AI Studio verification code is ${otp}. It is valid for 10 minutes. If you did not request this, ignore this email.`;
  const subject = "Your AN AI Studio verification code";

  return { htmlContent, textContent, subject };
}

async function sendViaResend(toEmail, otp, purpose) {
  const apiKey = (process.env.RESEND_API_KEY || "").trim();
  if (!apiKey) {
    return null;
  }

  const { htmlContent, textContent, subject } = buildEmailContent(otp, purpose);
  const fromAddress =
    process.env.EMAIL_FROM ||
    `AN AI Studio <${getEmailUser() || "onboarding@resend.dev"}>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: fromAddress,
      to: [toEmail],
      subject,
      html: htmlContent,
      text: textContent
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || payload.error || "Resend API rejected the email.");
  }

  return {
    success: true,
    provider: "resend",
    messageId: payload.id,
    message: "Verification code sent to your email inbox."
  };
}

async function sendViaSmtp(toEmail, otp, purpose) {
  if (!isSmtpConfigured()) {
    return null;
  }

  const { htmlContent, textContent, subject } = buildEmailContent(otp, purpose);
  const fromUser = getEmailUser();
  const portsToTry = process.env.EMAIL_HOST ? [null] : [465, 587];
  let lastError = null;

  for (const port of portsToTry) {
    try {
      const transporter = createTransporter(port);
      if (!transporter) {
        return null;
      }

      const info = await transporter.sendMail({
        from: `"AN AI Studio" <${fromUser}>`,
        to: toEmail,
        subject,
        text: textContent,
        html: htmlContent
      });

      return {
        success: true,
        provider: "smtp",
        messageId: info.messageId,
        message: "Verification code sent to your email inbox."
      };
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    throw lastError;
  }
  return null;
}

/**
 * Sends a 6-digit OTP verification email.
 * Never logs or returns the OTP to the client.
 */
async function sendOtpEmail(toEmail, otp, purpose = "signup") {
  if (!isEmailConfigured()) {
    const error = new Error(
      "Email delivery is not configured. Add EMAIL_USER and EMAIL_PASS (Gmail App Password) to the .env file."
    );
    error.code = "EMAIL_NOT_CONFIGURED";
    throw error;
  }

  const errors = [];

  if (isResendConfigured()) {
    try {
      const result = await sendViaResend(toEmail, otp, purpose);
      if (result) {
        console.log(`OTP email sent via Resend to ${toEmail}`);
        return result;
      }
    } catch (error) {
      errors.push(`Resend: ${error.message}`);
      console.error("Resend OTP email failed:", error.message);
    }
  }

  if (isSmtpConfigured()) {
    try {
      const result = await sendViaSmtp(toEmail, otp, purpose);
      if (result) {
        console.log(`OTP email sent via SMTP to ${toEmail}`);
        return result;
      }
    } catch (error) {
      errors.push(`SMTP: ${error.message}`);
      console.error("SMTP OTP email failed:", error.message);
    }
  }

  const error = new Error(
    errors.length
      ? `Could not send verification email. ${errors.join(" | ")}`
      : "Could not send verification email. Check EMAIL_USER and EMAIL_PASS."
  );
  error.code = "EMAIL_SEND_FAILED";
  throw error;
}

module.exports = {
  sendOtpEmail,
  isEmailConfigured
};
