import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { prisma } from "../config/db.js";

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

// Fallback content used until a super admin overrides a template via
// /admin/site/textes (EmailTemplate table) — {{url}} is the only variable
// either template needs today.
export const EMAIL_TEMPLATE_DEFAULTS: Record<string, { subject: string; html: string }> = {
  verification: {
    subject: "Verifiez votre email Iwosan",
    html: `<p>Bienvenue sur Iwosan.</p><p><a href="{{url}}">Verifier mon email</a></p>`,
  },
  password_reset: {
    subject: "Reinitialisation du mot de passe Iwosan",
    html: `<p>Une demande de reinitialisation a ete faite.</p><p><a href="{{url}}">Changer mon mot de passe</a></p>`,
  },
};

const renderTemplate = async (key: string, vars: Record<string, string>) => {
  const override = await prisma.emailTemplate.findUnique({ where: { key } });
  const base = override ?? EMAIL_TEMPLATE_DEFAULTS[key];
  let { subject, html } = base;
  for (const [name, value] of Object.entries(vars)) {
    subject = subject.replaceAll(`{{${name}}}`, value);
    html = html.replaceAll(`{{${name}}}`, value);
  }
  return { subject, html };
};

export const sendVerificationEmail = async (to: string, verificationUrl: string) => {
  const { subject, html } = await renderTemplate("verification", { url: verificationUrl });
  return sendEmail({ to, subject, html });
};

export const sendPasswordResetEmail = async (to: string, resetUrl: string) => {
  const { subject, html } = await renderTemplate("password_reset", { url: resetUrl });
  return sendEmail({ to, subject, html });
};
