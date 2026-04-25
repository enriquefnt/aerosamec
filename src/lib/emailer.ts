import nodemailer from "nodemailer";

/**
 * Transport SMTP único
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true solo para 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Verifica conexión SMTP al iniciar (opcional pero útil)
 */
transporter.verify()
  .then(() => {
    console.log("📧 SMTP listo para enviar emails");
  })
  .catch(err => {
    console.error("❌ Error SMTP:", err);
  });

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
  return transporter.sendMail({
    from: `"AeroSAMEC" <${process.env.SMTP_USER}>`, // 👈 CLAVE
    to,
    subject,
    text,
    html,
  });
}
