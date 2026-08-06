import { env } from "../config/env.js";
import { sendEmail } from "../services/email.service.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const sendContactMessage = asyncHandler(async (req, res) => {
  const name = String(req.body.name ?? "").trim();
  const email = String(req.body.email ?? "").trim();
  const subject = String(req.body.subject ?? "").trim();
  const message = String(req.body.message ?? "").trim();

  if (!name) throw new ApiError(400, "Le nom est requis");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(400, "Un email valide est requis");
  if (!subject) throw new ApiError(400, "Le sujet est requis");
  if (message.length < 10) throw new ApiError(400, "Le message doit contenir au moins 10 caracteres");

  try {
    await sendEmail({
      to: env.contactEmail,
      subject: `[Contact Iwosan] ${subject}`,
      html: `
        <p><strong>De :</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>
        <p><strong>Sujet :</strong> ${escapeHtml(subject)}</p>
        <p><strong>Message :</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
      `,
    });
  } catch (error) {
    console.error("Contact message email failed:", error);
    throw new ApiError(502, "Le message n'a pas pu etre transmis pour le moment. Reessayez dans un instant ou appelez-nous directement.");
  }

  res.status(201).json(apiResponse(true, null, "Message envoye"));
});
