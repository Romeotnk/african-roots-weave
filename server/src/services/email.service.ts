import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter =
  env.smtp.host && env.smtp.user && env.smtp.pass
    ? nodemailer.createTransport({
        host: env.smtp.host,
        port: env.smtp.port,
        secure: env.smtp.port === 465,
        auth: {
          user: env.smtp.user,
          pass: env.smtp.pass,
        },
      })
    : null;

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export const sendEmail = async ({ to, subject, html }: EmailPayload) => {
  // Never attempt a real SMTP round-trip from the automated test suite: it's slow
  // (a bad/unreachable server can take many seconds to fail) and doesn't need a
  // real inbox — tests read the verification/reset link straight from the DB/service layer.
  if (!transporter || process.env.NODE_ENV === "test") {
    console.info(`[email:dev] ${subject} -> ${to}`);
    console.info(html);
    return;
  }

  await transporter.sendMail({
    from: env.smtp.from,
    to,
    subject,
    html,
  });
};

export const sendVerificationEmail = async (to: string, verificationUrl: string) =>
  sendEmail({
    to,
    subject: "Verifiez votre email Iwosan",
    html: `<p>Bienvenue sur Iwosan.</p><p><a href="${verificationUrl}">Verifier mon email</a></p>`,
  });

export const sendPasswordResetEmail = async (to: string, resetUrl: string) =>
  sendEmail({
    to,
    subject: "Reinitialisation du mot de passe Iwosan",
    html: `<p>Une demande de reinitialisation a ete faite.</p><p><a href="${resetUrl}">Changer mon mot de passe</a></p>`,
  });
