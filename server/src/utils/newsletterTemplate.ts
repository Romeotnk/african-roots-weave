// Table-based, inline-styled layout: email clients strip <style> blocks and
// ignore most CSS, so the branded look has to be inlined per element.
export const renderNewsletterEmail = (subject: string, bodyHtml: string, unsubscribeUrl: string) => `
<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:0;background-color:#f4f1ea;font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f1ea;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background-color:#1f5a39;padding:28px 32px;">
                <span style="color:#c08829;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Iwosan</span>
                <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:normal;">${subject}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:#2b2b28;font-size:15px;line-height:1.7;font-family:Arial,sans-serif;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background-color:#f4f1ea;border-top:1px solid #e5e1d6;font-family:Arial,sans-serif;">
                <p style="margin:0 0 8px;font-size:12px;color:#6b6a63;">
                  Vous recevez cet email car vous êtes inscrit(e) à la newsletter Iwosan, la plateforme panafricaine de la médecine traditionnelle.
                </p>
                <p style="margin:0;font-size:12px;">
                  <a href="${unsubscribeUrl}" style="color:#2d7a4f;">Se désabonner de la newsletter</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
