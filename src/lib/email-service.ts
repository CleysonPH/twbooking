import nodemailer from 'nodemailer'

// Verificar se todas as configurações de e-mail estão presentes
if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn('⚠️  Configurações de e-mail incompletas. Verifique as variáveis SMTP_HOST, SMTP_USER e SMTP_PASS')
}

// Configuração do transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true para 465, false para outras portas
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

/**
 * Envia e-mail de recuperação de senha
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
  
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@twbooking.com',
    to: email,
    subject: 'Recuperação de senha - TWBooking',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recuperação de senha</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; border: 1px solid #e9ecef;">
            <h1 style="color: #2563eb; margin-bottom: 20px;">Recuperação de Senha</h1>
            
            <p>Olá!</p>
            
            <p>Você solicitou a recuperação de senha para sua conta no TWBooking.</p>
            
            <p>Para redefinir sua senha, clique no link abaixo:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Redefinir Senha
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              <strong>Importante:</strong> Este link é válido por apenas 1 hora e pode ser usado apenas uma vez.
            </p>
            
            <p style="color: #6b7280; font-size: 14px;">
              Se você não solicitou esta recuperação, pode ignorar este e-mail com segurança.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
            
            <p style="color: #6b7280; font-size: 12px; text-align: center;">
              Este é um e-mail automático, não responda a esta mensagem.<br>
              TWBooking - Sistema de Agendamento Online
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
      Recuperação de Senha - TWBooking
      
      Olá!
      
      Você solicitou a recuperação de senha para sua conta no TWBooking.
      
      Para redefinir sua senha, acesse o link abaixo:
      ${resetUrl}
      
      Importante: Este link é válido por apenas 1 hora e pode ser usado apenas uma vez.
      
      Se você não solicitou esta recuperação, pode ignorar este e-mail com segurança.
      
      TWBooking - Sistema de Agendamento Online
    `
  }

  await transporter.sendMail(mailOptions)
}

/**
 * Envia e-mail de confirmação de alteração de senha
 */
export async function sendPasswordChangedEmail(email: string): Promise<void> {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@twbooking.com',
    to: email,
    subject: 'Senha alterada com sucesso - TWBooking',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Senha alterada</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; border: 1px solid #e9ecef;">
            <h1 style="color: #16a34a; margin-bottom: 20px;">Senha Alterada com Sucesso</h1>
            
            <p>Olá!</p>
            
            <p>Sua senha foi alterada com sucesso em ${new Date().toLocaleString('pt-BR')}.</p>
            
            <div style="background: #dcfce7; border: 1px solid #16a34a; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #16a34a; font-weight: bold;">
                ✓ Alteração realizada com segurança
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              <strong>Dicas de segurança:</strong>
            </p>
            <ul style="color: #6b7280; font-size: 14px;">
              <li>Mantenha sua senha segura e não a compartilhe</li>
              <li>Use uma senha única para cada serviço</li>
              <li>Se você não fez esta alteração, entre em contato conosco imediatamente</li>
            </ul>
            
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
            
            <p style="color: #6b7280; font-size: 12px; text-align: center;">
              Este é um e-mail automático, não responda a esta mensagem.<br>
              TWBooking - Sistema de Agendamento Online
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
      Senha Alterada com Sucesso - TWBooking
      
      Olá!
      
      Sua senha foi alterada com sucesso em ${new Date().toLocaleString('pt-BR')}.
      
      Dicas de segurança:
      - Mantenha sua senha segura e não a compartilhe
      - Use uma senha única para cada serviço
      - Se você não fez esta alteração, entre em contato conosco imediatamente
      
      TWBooking - Sistema de Agendamento Online
    `
  }

  await transporter.sendMail(mailOptions)
}
