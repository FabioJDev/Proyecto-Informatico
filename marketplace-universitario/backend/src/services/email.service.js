const nodemailer = require('nodemailer');
const { retryWithBackoff } = require('../utils/retryWithBackoff');

// ─────────────────────────────────────────────
// Transporter — SendGrid SMTP
// ─────────────────────────────────────────────
let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY },
  });

  return transporter;
}

// ─────────────────────────────────────────────
// Base HTML layout
// ─────────────────────────────────────────────
function baseTemplate(title, content) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: #1d4ed8; color: #fff; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; }
    .body { padding: 28px 32px; color: #333; }
    .body p { line-height: 1.6; }
    .badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; margin: 8px 0; }
    .badge-pending  { background: #fef9c3; color: #854d0e; }
    .badge-accepted { background: #dcfce7; color: #166534; }
    .badge-rejected { background: #fee2e2; color: #991b1b; }
    .badge-delivered{ background: #dbeafe; color: #1e40af; }
    .btn { display: inline-block; margin-top: 16px; padding: 12px 24px; background: #1d4ed8; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; }
    .footer { background: #f8fafc; padding: 16px 32px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    td, th { padding: 10px 12px; border: 1px solid #e5e7eb; font-size: 14px; }
    th { background: #f1f5f9; text-align: left; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 Marketplace Universitario</h1>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>Este correo fue enviado por <strong>Marketplace Universitario</strong>.</p>
      <p>Por favor no respondas a este correo.</p>
    </div>
  </div>
</body>
</html>`;
}

// ─────────────────────────────────────────────
// Internal send helper with retry (RF-15: < 5s)
// ─────────────────────────────────────────────
async function sendEmail(to, subject, html) {
  const t = await getTransporter();
  return retryWithBackoff(
    async () => {
      const info = await t.sendMail({
        from: `"Marketplace Universitario" <${process.env.EMAIL_FROM}>`,
        to,
        subject,
        html,
      });
      console.log(`📧 Email enviado a: ${to} — MessageId: ${info.messageId}`);
      return info;
    },
    3,
    500
  );
}

// ─────────────────────────────────────────────
// RF-15: Confirmación de pedido al comprador
// ─────────────────────────────────────────────
async function sendOrderConfirmation(buyerEmail, orderDetails) {
  const { orderId, productName, quantity, sellerName, message } = orderDetails;

  const html = baseTemplate(
    'Pedido recibido',
    `<h2>¡Tu pedido fue enviado! 🛍️</h2>
     <p>Hola, tu pedido ha sido registrado exitosamente y está esperando confirmación del vendedor.</p>
     <table>
       <tr><th>Pedido #</th><td>${orderId}</td></tr>
       <tr><th>Producto</th><td>${productName}</td></tr>
       <tr><th>Cantidad</th><td>${quantity}</td></tr>
       <tr><th>Vendedor</th><td>${sellerName}</td></tr>
       ${message ? `<tr><th>Mensaje</th><td>${message}</td></tr>` : ''}
       <tr><th>Estado</th><td><span class="badge badge-pending">PENDIENTE</span></td></tr>
     </table>
     <p style="margin-top:20px">Te notificaremos cuando el vendedor responda a tu pedido.</p>`
  );

  return sendEmail(buyerEmail, '✅ Tu pedido fue enviado — Marketplace Universitario', html);
}

// ─────────────────────────────────────────────
// RF-16: Notificación de nuevo pedido al vendedor
// ─────────────────────────────────────────────
async function sendNewOrderToSeller(sellerEmail, orderDetails) {
  const { orderId, productName, quantity, buyerEmail, message } = orderDetails;

  const html = baseTemplate(
    'Nuevo pedido recibido',
    `<h2>¡Tienes un nuevo pedido! 🎉</h2>
     <p>Un comprador acaba de solicitar uno de tus productos. Ingresa a tu panel para aceptar o rechazar el pedido.</p>
     <table>
       <tr><th>Pedido #</th><td>${orderId}</td></tr>
       <tr><th>Producto</th><td>${productName}</td></tr>
       <tr><th>Cantidad</th><td>${quantity}</td></tr>
       <tr><th>Comprador</th><td>${buyerEmail}</td></tr>
       ${message ? `<tr><th>Mensaje</th><td>${message}</td></tr>` : ''}
     </table>
     <p style="margin-top:20px"><strong>Tienes 24 horas para responder al pedido.</strong></p>`
  );

  return sendEmail(sellerEmail, '🛒 Nuevo pedido recibido — Marketplace Universitario', html);
}

// ─────────────────────────────────────────────
// RF-17: Cambio de estado del pedido al comprador
// ─────────────────────────────────────────────
async function sendOrderStatusChange(buyerEmail, status, orderDetails) {
  const { orderId, productName, sellerName } = orderDetails;

  const statusMessages = {
    ACCEPTED: { label: 'ACEPTADO', badge: 'accepted', emoji: '✅', msg: 'El vendedor aceptó tu pedido. Pronto recibirás más información sobre la entrega.' },
    REJECTED: { label: 'RECHAZADO', badge: 'rejected', emoji: '❌', msg: 'Lamentablemente el vendedor no pudo atender tu pedido en este momento.' },
    DELIVERED: { label: 'ENTREGADO', badge: 'delivered', emoji: '📦', msg: '¡Tu pedido fue marcado como entregado! Recuerda dejar una reseña sobre tu experiencia.' },
  };

  const info = statusMessages[status] || { label: status, badge: 'pending', emoji: '📋', msg: 'Tu pedido ha cambiado de estado.' };

  const html = baseTemplate(
    `Pedido ${info.label}`,
    `<h2>${info.emoji} Tu pedido fue ${info.label}</h2>
     <p>${info.msg}</p>
     <table>
       <tr><th>Pedido #</th><td>${orderId}</td></tr>
       <tr><th>Producto</th><td>${productName}</td></tr>
       <tr><th>Vendedor</th><td>${sellerName}</td></tr>
       <tr><th>Estado</th><td><span class="badge badge-${info.badge}">${info.label}</span></td></tr>
     </table>`
  );

  return sendEmail(buyerEmail, `${info.emoji} Tu pedido fue ${info.label} — Marketplace Universitario`, html);
}

// ─────────────────────────────────────────────
// RF-03: Recuperación de contraseña
// ─────────────────────────────────────────────
async function sendPasswordReset(email, resetToken) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const html = baseTemplate(
    'Recuperar contraseña',
    `<h2>Recuperación de contraseña 🔐</h2>
     <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
     <p>Haz clic en el siguiente enlace para crear una nueva contraseña. Este enlace es válido por <strong>1 hora</strong>.</p>
     <a class="btn" href="${resetUrl}">Restablecer contraseña</a>
     <p style="margin-top:20px; font-size:13px; color:#6b7280">Si no solicitaste este cambio, ignora este correo. Tu contraseña no será modificada.</p>
     <p style="font-size:12px; color:#9ca3af; margin-top:8px">O copia este enlace: ${resetUrl}</p>`
  );

  return sendEmail(email, '🔐 Recuperar contraseña — Marketplace Universitario', html);
}

// ─────────────────────────────────────────────
// US-01 / US-02: Welcome email on registration
// ─────────────────────────────────────────────
async function sendWelcomeEmail(email, role) {
  const isEmprendedor = role === 'EMPRENDEDOR';

  const content = isEmprendedor
    ? `<h2>¡Bienvenido al Marketplace Universitario! 🎉</h2>
       <p>Tu cuenta como <strong>Emprendedor</strong> ha sido creada exitosamente.</p>
       <p>Ya puedes crear tu perfil de negocio, publicar tus productos y servicios, y empezar a vender dentro de tu comunidad universitaria.</p>
       <a class="btn" href="${process.env.FRONTEND_URL}/profile/edit">Crear mi perfil →</a>`
    : `<h2>¡Bienvenido al Marketplace Universitario! 🎉</h2>
       <p>Tu cuenta como <strong>Comprador</strong> ha sido creada exitosamente.</p>
       <p>Explora el catálogo y descubre productos únicos de emprendedores de tu universidad.</p>
       <a class="btn" href="${process.env.FRONTEND_URL}/products">Ver catálogo →</a>`;

  return sendEmail(
    email,
    '¡Bienvenido al Marketplace Universitario!',
    baseTemplate('Bienvenida', content)
  );
}

module.exports = {
  sendOrderConfirmation,
  sendNewOrderToSeller,
  sendOrderStatusChange,
  sendPasswordReset,
  sendWelcomeEmail,
};
