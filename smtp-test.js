import nodemailer from "nodemailer";
import "dotenv/config";

async function testSMTP() {
  console.log("SMTP_HOST:", process.env.SMTP_HOST);
  console.log("SMTP_PORT:", process.env.SMTP_PORT);
  console.log("SMTP_USER:", process.env.SMTP_USER);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  console.log("🔎 Verificando conexión SMTP...");
  await transporter.verify();
  console.log("✅ SMTP verify OK");

  const info = await transporter.sendMail({
    from: '"AeroSAMEC Test" <aerosamec@saltaped.com>',
    //to: "enriquefinetti@gmail.com",
    to: "enriquefinetti@yahoo.com.ar",
    subject: "Test SMTP AeroSAMEC",
    text: "Si recibís este mail, el SMTP funciona correctamente.",
  });

  console.log("✅ Email enviado");
  console.log("messageId:", info.messageId);
  console.log("accepted:", info.accepted);
  console.log("rejected:", info.rejected);
  console.log("pending:", info.pending);
  console.log("response:", info.response);
  console.log("envelope:", info.envelope);
}

testSMTP().catch((err) => {
  console.error("❌ Error SMTP:", err);
});
