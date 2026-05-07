import nodemailer from "nodemailer";

type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  secure: boolean;
  requireTLS?: boolean;
};

function getSmtpConfig(): SmtpConfig {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT || 0);
  const user = process.env.SMTP_USER?.trim();
  const pass = (process.env.SMTP_PASS || process.env.SMTP_PASSWORD || "").trim();
  const from = (process.env.SMTP_FROM || user || "").trim();

  if (!host || !port || !user || !pass) {
    throw new Error(
      "Configuración SMTP incompleta: se requiere SMTP_HOST, SMTP_PORT, SMTP_USER y SMTP_PASS/SMTP_PASSWORD"
    );
  }

  if (Number.isNaN(port) || port <= 0) {
    throw new Error("SMTP_PORT inválido: debe ser un número mayor a 0");
  }

  const secure = port === 465;
  const requireTLS = port === 587 ? true : undefined;

  return { host, port, user, pass, from, secure, requireTLS };
}

function createTransporter() {
  const { host, port, user, pass, secure, requireTLS } = getSmtpConfig();

  return nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Función genérica de envío
 */
export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  const smtp = getSmtpConfig();
  const transporter = createTransporter();

  try {
    await transporter.verify();
  } catch (error) {
    console.error("SMTP verify error", {
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      requireTLS: smtp.requireTLS,
      userHint: smtp.user ? `${smtp.user.slice(0, 3)}***` : "missing",
      code: (error as { code?: string })?.code,
      responseCode: (error as { responseCode?: number })?.responseCode,
      command: (error as { command?: string })?.command,
    });
    throw error;
  }

  return transporter.sendMail({
    from: `"AeroSAMEC" <${smtp.from}>`,
    to,
    subject,
    text,
    html,
  });
}
