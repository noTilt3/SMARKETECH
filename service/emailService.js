// service/emailService.js
const nodemailer = require("nodemailer");

// Configuração do transporter (usando GSMTP como exemplo)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // Use App Password para Gmail
  },
});

/**
 * Envia email de reset de senha
 */
async function sendResetEmail(email, resetLink) {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || "noreply@smarketech.com",
      to: email,
      subject: "Redefinição de Senha - SmarkeTech",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Redefinição de Senha</h2>
          <p>Você solicitou a redefinição de sua senha.</p>
          <p>Clique no link abaixo para criar uma nova senha:</p>
          <a href="${resetLink}" 
             style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
             Redefinir Senha
          </a>
          <p>Se você não solicitou esta redefinição, ignore este email.</p>
          <p><strong>Este link expira em 1 hora.</strong></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            SmarkeTech &copy; ${new Date().getFullYear()}
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email enviado:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Erro ao enviar email:", error);
    throw error;
  }
}

/**
 * Envia email de boas-vindas
 */
async function sendWelcomeEmail(email, nome) {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || "noreply@smarketech.com",
      to: email,
      subject: "Bem-vindo ao SmarkeTech!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Bem-vindo, ${nome}!</h2>
          <p>Sua conta no sistema SmarkeTech foi criada com sucesso.</p>
          <p>Você já pode fazer login e começar a usar o sistema.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            SmarkeTech &copy; ${new Date().getFullYear()}
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email de boas-vindas enviado:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Erro ao enviar email de boas-vindas:", error);
    throw error;
  }
}

module.exports = {
  sendResetEmail,
  sendWelcomeEmail,
};
