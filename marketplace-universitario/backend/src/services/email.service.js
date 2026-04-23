const nodemailer = require('nodemailer');
const { retryWithBackoff } = require('../utils/retryWithBackoff');

// ─────────────────────────────────────────────
// Transporter — Gmail SMTP
// ─────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  secure: parseInt(process.env.EMAIL_PORT, 10) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
  socketTimeout: 10000,
});

// ─────────────────────────────────────────────
// Internal send helper with retry (RNF-11)
// ─────────────────────────────────────────────
async function sendEmail(to, subject, html, text) {
  const from = `"${process.env.EMAIL_FROM_NAME || 'Marketplace UAO'}" <${process.env.EMAIL_FROM}>`;

  return retryWithBackoff(
    async () => {
      const mailData = { from, to, subject, html };
      if (text) mailData.text = text;
      const info = await transporter.sendMail(mailData);
      console.log(`📧 Email enviado a: ${to} — MessageId: ${info.messageId}`);
      return info;
    },
    3,
    500
  );
}

// ─────────────────────────────────────────────
// RF-15: Confirmación de pedido al comprador
// CA-01: subject "Pedido confirmado – [Producto]"
// CA-02: buyerName, productName, quantity, entrepreneurName, date, orderId, next steps
// CA-03: table-based layout, inline CSS only (no <style> block — Gmail-safe)
// ─────────────────────────────────────────────
async function sendOrderConfirmation(buyerEmail, orderDetails) {
  const { orderId, productName, quantity, sellerName, buyerName, orderDate, message } = orderDetails;

  const platformUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const displayName = buyerName || buyerEmail.split('@')[0];
  const shortId     = (orderId || '').slice(0, 8).toUpperCase();
  const date        = orderDate || new Date().toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const subject = `Pedido confirmado – ${productName}`;

  // ── Inline-CSS HTML (CA-03: no <style> blocks, table-based) ──────────────
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#F6F6F6;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"
  style="background-color:#F6F6F6;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" border="0"
      style="max-width:600px;width:100%;background:#FFFFFF;border-radius:8px;overflow:hidden;border:1px solid #E8E8E8;">

      <!-- Top red stripe -->
      <tr><td style="background:#990100;height:6px;font-size:0;line-height:0;">&nbsp;</td></tr>

      <!-- Header -->
      <tr>
        <td style="background:#990100;padding:28px 40px;text-align:center;">
          <p style="margin:0;color:#FFFFFF;font-size:20px;font-weight:800;letter-spacing:-0.5px;">
            MARKETPLACE UAO
          </p>
          <p style="margin:4px 0 0;color:rgba(255,255,255,0.70);font-size:11px;letter-spacing:2px;">
            CAMPUS · UNIVERSIDAD AUTÓNOMA DE OCCIDENTE
          </p>
        </td>
      </tr>

      <!-- Hero: success + greeting -->
      <tr>
        <td style="padding:36px 40px 0;text-align:center;">
          <table cellpadding="0" cellspacing="0" border="0" align="center">
            <tr>
              <td style="width:64px;height:64px;background:rgba(153,1,0,0.08);
                border-radius:50%;text-align:center;vertical-align:middle;
                font-size:28px;line-height:64px;">
                &#x2705;
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 6px;color:#1A1A1A;font-size:22px;font-weight:700;">
            ¡Pedido confirmado!
          </p>
          <p style="margin:0;color:#666666;font-size:15px;line-height:1.6;">
            Hola <strong style="color:#333333;">${displayName}</strong>,
            tu solicitud fue enviada correctamente.
          </p>
        </td>
      </tr>

      <!-- Order details card -->
      <tr>
        <td style="padding:28px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="background:#F6F6F6;border-radius:8px;border:1px solid #E8E8E8;overflow:hidden;">

            <tr>
              <td style="padding:14px 20px;border-bottom:1px solid #E8E8E8;">
                <p style="margin:0;font-size:10px;color:#999999;letter-spacing:2px;
                  text-transform:uppercase;font-weight:700;">
                  Detalles del pedido
                </p>
              </td>
            </tr>

            <!-- Product name -->
            <tr>
              <td style="padding:14px 20px;border-bottom:1px solid #E8E8E8;">
                <p style="margin:0 0 2px;color:#666666;font-size:12px;">Producto / Servicio</p>
                <p style="margin:0;color:#1A1A1A;font-size:15px;font-weight:700;">${productName}</p>
              </td>
            </tr>

            <!-- Quantity -->
            <tr>
              <td style="padding:14px 20px;border-bottom:1px solid #E8E8E8;">
                <p style="margin:0 0 2px;color:#666666;font-size:12px;">Cantidad</p>
                <p style="margin:0;color:#1A1A1A;font-size:15px;font-weight:700;">${quantity}</p>
              </td>
            </tr>

            <!-- Entrepreneur name -->
            <tr>
              <td style="padding:14px 20px;border-bottom:1px solid #E8E8E8;">
                <p style="margin:0 0 2px;color:#666666;font-size:12px;">Emprendedor</p>
                <p style="margin:0;color:#1A1A1A;font-size:15px;font-weight:700;">${sellerName}</p>
              </td>
            </tr>

            <!-- Date -->
            <tr>
              <td style="padding:14px 20px;border-bottom:1px solid #E8E8E8;">
                <p style="margin:0 0 2px;color:#666666;font-size:12px;">Fecha y hora del pedido</p>
                <p style="margin:0;color:#1A1A1A;font-size:15px;font-weight:700;">${date}</p>
              </td>
            </tr>

            <!-- Order ID -->
            <tr>
              <td style="padding:14px 20px;">
                <p style="margin:0 0 2px;color:#666666;font-size:12px;">Número de pedido</p>
                <p style="margin:0;color:#990100;font-size:13px;font-weight:700;font-family:monospace;">
                  #${shortId}
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>

      <!-- Next steps (CA-02) -->
      <tr>
        <td style="padding:0 40px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="border-left:4px solid #990100;border-radius:0 8px 8px 0;
              background:rgba(153,1,0,0.05);">
            <tr>
              <td style="padding:16px 20px;">
                <p style="margin:0;color:#333333;font-size:14px;line-height:1.7;">
                  <strong style="color:#990100;">¿Qué sigue?</strong><br>
                  El emprendedor revisará tu solicitud en las próximas
                  <strong>24 horas</strong>.
                  Te notificaremos por correo cuando acepte o responda tu pedido.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- CTA button -->
      <tr>
        <td style="padding:0 40px 36px;text-align:center;">
          <a href="${platformUrl}/catalog"
            style="display:inline-block;background:#990100;color:#FFFFFF;
              text-decoration:none;padding:14px 32px;border-radius:6px;
              font-size:15px;font-weight:700;">
            Seguir explorando el catálogo
          </a>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#333333;padding:20px 40px;text-align:center;">
          <p style="margin:0;color:#999999;font-size:12px;line-height:1.8;">
            Este correo fue enviado automáticamente por
            <strong style="color:#E8E8E8;">Marketplace UAO</strong><br>
            Universidad Autónoma de Occidente · Cali, Colombia<br>
            <span style="color:#666666;">Si no realizaste este pedido, ignora este mensaje.</span>
          </p>
        </td>
      </tr>

      <!-- Bottom red stripe -->
      <tr><td style="background:#990100;height:4px;font-size:0;line-height:0;">&nbsp;</td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;

  // ── Plain text fallback (CA-03) ───────────────────────────────────────────
  const text = `
¡Pedido confirmado! – Marketplace UAO

Hola ${displayName},

Tu solicitud fue enviada correctamente.

DETALLES DEL PEDIDO
──────────────────────────────
Producto:     ${productName}
Cantidad:     ${quantity}
Emprendedor:  ${sellerName}
Fecha:        ${date}
N° pedido:    #${shortId}
${message ? `\nMensaje:      ${message}` : ''}

¿QUÉ SIGUE?
El emprendedor revisará tu solicitud en las próximas 24 horas.
Te notificaremos cuando responda tu pedido.

Visita el catálogo: ${platformUrl}/catalog

──────────────────────────────
Marketplace UAO · Universidad Autónoma de Occidente · Cali, Colombia
`.trim();

  return sendEmail(buyerEmail, subject, html, text);
}

// ─────────────────────────────────────────────
// RF-16: Notificación de nuevo pedido al vendedor
// ─────────────────────────────────────────────
async function sendNewOrderToSeller(sellerEmail, orderDetails) {
  const { orderId, productName, quantity, buyerEmail, message } = orderDetails;

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Nuevo pedido recibido</title></head>
<body style="margin:0;padding:0;background:#F6F6F6;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F6F6F6;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0"
  style="max-width:600px;width:100%;background:#FFFFFF;border-radius:8px;border:1px solid #E8E8E8;overflow:hidden;">
  <tr><td style="background:#990100;height:6px;font-size:0;line-height:0;">&nbsp;</td></tr>
  <tr>
    <td style="background:#990100;padding:28px 40px;text-align:center;">
      <p style="margin:0;color:#FFFFFF;font-size:20px;font-weight:800;">MARKETPLACE UAO</p>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.70);font-size:11px;letter-spacing:2px;">CAMPUS · UAO</p>
    </td>
  </tr>
  <tr>
    <td style="padding:32px 40px;">
      <p style="margin:0 0 16px;color:#1A1A1A;font-size:20px;font-weight:700;">¡Tienes un nuevo pedido! 🎉</p>
      <p style="margin:0 0 20px;color:#666666;font-size:14px;line-height:1.6;">
        Un comprador acaba de solicitar uno de tus productos. Ingresa a tu panel para aceptar o rechazar el pedido.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background:#F6F6F6;border-radius:8px;border:1px solid #E8E8E8;">
        <tr><td style="padding:12px 20px;border-bottom:1px solid #E8E8E8;">
          <p style="margin:0 0 2px;color:#666666;font-size:12px;">Pedido #</p>
          <p style="margin:0;color:#990100;font-size:13px;font-weight:700;font-family:monospace;">#${(orderId||'').slice(0,8).toUpperCase()}</p>
        </td></tr>
        <tr><td style="padding:12px 20px;border-bottom:1px solid #E8E8E8;">
          <p style="margin:0 0 2px;color:#666666;font-size:12px;">Producto</p>
          <p style="margin:0;color:#1A1A1A;font-size:15px;font-weight:700;">${productName}</p>
        </td></tr>
        <tr><td style="padding:12px 20px;border-bottom:1px solid #E8E8E8;">
          <p style="margin:0 0 2px;color:#666666;font-size:12px;">Cantidad</p>
          <p style="margin:0;color:#1A1A1A;font-size:15px;font-weight:700;">${quantity}</p>
        </td></tr>
        <tr><td style="padding:12px 20px;${message ? 'border-bottom:1px solid #E8E8E8;' : ''}">
          <p style="margin:0 0 2px;color:#666666;font-size:12px;">Comprador</p>
          <p style="margin:0;color:#1A1A1A;font-size:15px;font-weight:700;">${buyerEmail}</p>
        </td></tr>
        ${message ? `<tr><td style="padding:12px 20px;">
          <p style="margin:0 0 2px;color:#666666;font-size:12px;">Mensaje del comprador</p>
          <p style="margin:0;color:#1A1A1A;font-size:14px;font-style:italic;">"${message}"</p>
        </td></tr>` : ''}
      </table>
      <p style="margin:20px 0 0;color:#333333;font-size:14px;font-weight:700;">
        Tienes 24 horas para responder al pedido.
      </p>
    </td>
  </tr>
  <tr><td style="background:#333333;padding:16px 40px;text-align:center;">
    <p style="margin:0;color:#999999;font-size:12px;">Marketplace UAO · Universidad Autónoma de Occidente</p>
  </td></tr>
  <tr><td style="background:#990100;height:4px;font-size:0;line-height:0;">&nbsp;</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  const text = `¡Nuevo pedido! – Marketplace UAO\n\nProducto: ${productName}\nCantidad: ${quantity}\nComprador: ${buyerEmail}${message ? `\nMensaje: ${message}` : ''}\n\nResponde en las próximas 24 horas.`;

  return sendEmail(sellerEmail, `Nuevo pedido: ${productName} — Marketplace UAO`, html, text);
}

// ─────────────────────────────────────────────
// RF-17: Cambio de estado del pedido al comprador
// ─────────────────────────────────────────────
async function sendOrderStatusChange(buyerEmail, status, orderDetails) {
  const { orderId, productName, sellerName } = orderDetails;

  const statusMessages = {
    ACCEPTED: { label: 'Aceptado', emoji: '✅', msg: 'El emprendedor aceptó tu pedido. Pronto recibirás más información sobre la entrega.' },
    REJECTED: { label: 'Rechazado', emoji: '❌', msg: 'Lamentablemente el emprendedor no pudo atender tu pedido en este momento.' },
    DELIVERED: { label: 'Entregado', emoji: '📦', msg: '¡Tu pedido fue marcado como entregado! Recuerda dejar una reseña sobre tu experiencia.' },
  };

  const info = statusMessages[status] || { label: status, emoji: '📋', msg: 'Tu pedido ha cambiado de estado.' };

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Tu pedido fue ${info.label}</title></head>
<body style="margin:0;padding:0;background:#F6F6F6;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F6F6F6;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0"
  style="max-width:600px;width:100%;background:#FFFFFF;border-radius:8px;border:1px solid #E8E8E8;overflow:hidden;">
  <tr><td style="background:#990100;height:6px;font-size:0;line-height:0;">&nbsp;</td></tr>
  <tr><td style="background:#990100;padding:28px 40px;text-align:center;">
    <p style="margin:0;color:#FFFFFF;font-size:20px;font-weight:800;">MARKETPLACE UAO</p>
  </td></tr>
  <tr>
    <td style="padding:32px 40px;">
      <p style="margin:0 0 12px;font-size:22px;">${info.emoji}</p>
      <p style="margin:0 0 12px;color:#1A1A1A;font-size:20px;font-weight:700;">Tu pedido fue ${info.label}</p>
      <p style="margin:0 0 20px;color:#666666;font-size:14px;line-height:1.6;">${info.msg}</p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F6F6F6;border-radius:8px;border:1px solid #E8E8E8;">
        <tr><td style="padding:12px 20px;border-bottom:1px solid #E8E8E8;">
          <p style="margin:0 0 2px;color:#666666;font-size:12px;">Pedido #</p>
          <p style="margin:0;color:#990100;font-size:13px;font-weight:700;font-family:monospace;">#${(orderId||'').slice(0,8).toUpperCase()}</p>
        </td></tr>
        <tr><td style="padding:12px 20px;border-bottom:1px solid #E8E8E8;">
          <p style="margin:0 0 2px;color:#666666;font-size:12px;">Producto</p>
          <p style="margin:0;color:#1A1A1A;font-size:15px;font-weight:700;">${productName}</p>
        </td></tr>
        <tr><td style="padding:12px 20px;">
          <p style="margin:0 0 2px;color:#666666;font-size:12px;">Emprendedor</p>
          <p style="margin:0;color:#1A1A1A;font-size:15px;font-weight:700;">${sellerName}</p>
        </td></tr>
      </table>
    </td>
  </tr>
  <tr><td style="background:#333333;padding:16px 40px;text-align:center;">
    <p style="margin:0;color:#999999;font-size:12px;">Marketplace UAO · Universidad Autónoma de Occidente</p>
  </td></tr>
  <tr><td style="background:#990100;height:4px;font-size:0;line-height:0;">&nbsp;</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  const text = `Tu pedido fue ${info.label} – Marketplace UAO\n\n${info.msg}\n\nProducto: ${productName}\nEmprendedor: ${sellerName}\nPedido: #${(orderId||'').slice(0,8).toUpperCase()}`;

  return sendEmail(buyerEmail, `${info.emoji} Tu pedido fue ${info.label} — Marketplace UAO`, html, text);
}

// ─────────────────────────────────────────────
// RF-03: Recuperación de contraseña
// ─────────────────────────────────────────────
async function sendPasswordReset(email, resetToken) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Recuperar contraseña</title></head>
<body style="margin:0;padding:0;background:#F6F6F6;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F6F6F6;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0"
  style="max-width:600px;width:100%;background:#FFFFFF;border-radius:8px;border:1px solid #E8E8E8;overflow:hidden;">
  <tr><td style="background:#990100;height:6px;font-size:0;line-height:0;">&nbsp;</td></tr>
  <tr><td style="background:#990100;padding:28px 40px;text-align:center;">
    <p style="margin:0;color:#FFFFFF;font-size:20px;font-weight:800;">MARKETPLACE UAO</p>
  </td></tr>
  <tr>
    <td style="padding:32px 40px;">
      <p style="margin:0 0 16px;color:#1A1A1A;font-size:20px;font-weight:700;">🔐 Recuperación de contraseña</p>
      <p style="margin:0 0 12px;color:#666666;font-size:14px;line-height:1.6;">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta.
        Haz clic en el enlace a continuación — es válido por <strong>1 hora</strong>.
      </p>
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="padding:16px 0;">
          <a href="${resetUrl}" style="display:inline-block;background:#990100;color:#FFFFFF;
            text-decoration:none;padding:14px 28px;border-radius:6px;font-size:15px;font-weight:700;">
            Restablecer contraseña
          </a>
        </td></tr>
      </table>
      <p style="margin:12px 0 0;color:#999999;font-size:12px;">
        O copia este enlace: <span style="color:#990100;">${resetUrl}</span>
      </p>
      <p style="margin:16px 0 0;color:#999999;font-size:13px;">
        Si no solicitaste este cambio, ignora este correo.
      </p>
    </td>
  </tr>
  <tr><td style="background:#333333;padding:16px 40px;text-align:center;">
    <p style="margin:0;color:#999999;font-size:12px;">Marketplace UAO · Universidad Autónoma de Occidente</p>
  </td></tr>
  <tr><td style="background:#990100;height:4px;font-size:0;line-height:0;">&nbsp;</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  const text = `Recuperar contraseña – Marketplace UAO\n\nRestablecer contraseña: ${resetUrl}\n\nEste enlace es válido por 1 hora. Si no lo solicitaste, ignora este correo.`;

  return sendEmail(email, '🔐 Recuperar contraseña — Marketplace UAO', html, text);
}

// ─────────────────────────────────────────────
// US-01 / US-02: Welcome email on registration
// ─────────────────────────────────────────────
async function sendWelcomeEmail(email, role) {
  const isEmprendedor = role === 'EMPRENDEDOR';
  const platformUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const ctaUrl  = isEmprendedor ? `${platformUrl}/profile/edit` : `${platformUrl}/catalog`;
  const ctaText = isEmprendedor ? 'Crear mi perfil →' : 'Ver catálogo →';
  const body    = isEmprendedor
    ? `Tu cuenta como <strong>Emprendedor</strong> ha sido creada exitosamente.<br>Ya puedes crear tu perfil de negocio, publicar tus productos y empezar a vender.`
    : `Tu cuenta como <strong>Comprador</strong> ha sido creada exitosamente.<br>Explora el catálogo y descubre productos únicos de emprendedores de tu universidad.`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Bienvenido a Marketplace UAO</title></head>
<body style="margin:0;padding:0;background:#F6F6F6;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F6F6F6;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0"
  style="max-width:600px;width:100%;background:#FFFFFF;border-radius:8px;border:1px solid #E8E8E8;overflow:hidden;">
  <tr><td style="background:#990100;height:6px;font-size:0;line-height:0;">&nbsp;</td></tr>
  <tr><td style="background:#990100;padding:28px 40px;text-align:center;">
    <p style="margin:0;color:#FFFFFF;font-size:20px;font-weight:800;">MARKETPLACE UAO</p>
    <p style="margin:4px 0 0;color:rgba(255,255,255,0.70);font-size:11px;letter-spacing:2px;">CAMPUS · UAO</p>
  </td></tr>
  <tr>
    <td style="padding:32px 40px;text-align:center;">
      <p style="margin:0 0 12px;font-size:28px;">🎉</p>
      <p style="margin:0 0 12px;color:#1A1A1A;font-size:22px;font-weight:700;">¡Bienvenido al Marketplace UAO!</p>
      <p style="margin:0 0 24px;color:#666666;font-size:15px;line-height:1.7;">${body}</p>
      <table cellpadding="0" cellspacing="0" border="0" align="center">
        <tr><td>
          <a href="${ctaUrl}" style="display:inline-block;background:#990100;color:#FFFFFF;
            text-decoration:none;padding:14px 28px;border-radius:6px;font-size:15px;font-weight:700;">
            ${ctaText}
          </a>
        </td></tr>
      </table>
    </td>
  </tr>
  <tr><td style="background:#333333;padding:16px 40px;text-align:center;">
    <p style="margin:0;color:#999999;font-size:12px;">Marketplace UAO · Universidad Autónoma de Occidente · Cali, Colombia</p>
  </td></tr>
  <tr><td style="background:#990100;height:4px;font-size:0;line-height:0;">&nbsp;</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  const text = `¡Bienvenido al Marketplace UAO!\n\n${isEmprendedor ? 'Tu cuenta como Emprendedor fue creada exitosamente.' : 'Tu cuenta como Comprador fue creada exitosamente.'}\n\n${ctaUrl}`;

  return sendEmail(email, '¡Bienvenido a Marketplace UAO!', html, text);
}

module.exports = {
  sendOrderConfirmation,
  sendNewOrderToSeller,
  sendOrderStatusChange,
  sendPasswordReset,
  sendWelcomeEmail,
};
