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

/**
 * Envia e-mail de confirmação de agendamento para o cliente
 */
export async function sendBookingConfirmationToCustomer(booking: {
  id: string
  dateTime: Date
  serviceNameSnapshot: string
  servicePriceSnapshot: number
  serviceDescriptionSnapshot?: string | null
  customerNameSnapshot: string
  customerEmailSnapshot: string
  addressSnapshot: string
  provider: {
    businessName: string
    phone: string
    name: string
  }
}): Promise<void> {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(price)
  }

  const formatDateTime = (dateTime: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "America/Sao_Paulo"
    }).format(dateTime)
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@twbooking.com',
    to: booking.customerEmailSnapshot,
    subject: `Agendamento Confirmado - ${booking.serviceNameSnapshot}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Agendamento Confirmado</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; border: 1px solid #e9ecef;">
            <h1 style="color: #16a34a; margin-bottom: 20px;">✓ Agendamento Confirmado</h1>
            
            <p>Olá, <strong>${booking.customerNameSnapshot}</strong>!</p>
            
            <p>Seu agendamento foi confirmado com sucesso. Confira os detalhes abaixo:</p>
            
            <div style="background: #dcfce7; border: 1px solid #16a34a; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h2 style="color: #16a34a; margin-top: 0; margin-bottom: 15px;">Detalhes do Agendamento</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Serviço:</td>
                  <td style="padding: 8px 0; color: #374151;">${booking.serviceNameSnapshot}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Valor:</td>
                  <td style="padding: 8px 0; color: #374151;">${formatPrice(booking.servicePriceSnapshot)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Data e Horário:</td>
                  <td style="padding: 8px 0; color: #374151;">${formatDateTime(booking.dateTime)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Local:</td>
                  <td style="padding: 8px 0; color: #374151;">${booking.addressSnapshot}</td>
                </tr>
              </table>
              
              ${booking.serviceDescriptionSnapshot ? `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #16a34a;">
                  <h3 style="margin: 0 0 8px 0; color: #16a34a; font-size: 16px;">Descrição do Serviço:</h3>
                  <p style="margin: 0; color: #374151;">${booking.serviceDescriptionSnapshot}</p>
                </div>
              ` : ''}
            </div>

            <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0; margin-bottom: 15px;">Informações do Prestador</h3>
              <p style="margin: 5px 0;"><strong>Empresa:</strong> ${booking.provider.businessName}</p>
              <p style="margin: 5px 0;"><strong>Responsável:</strong> ${booking.provider.name}</p>
              <p style="margin: 5px 0;"><strong>Telefone:</strong> ${booking.provider.phone}</p>
            </div>

            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <h3 style="color: #92400e; margin-top: 0; margin-bottom: 10px;">📋 Orientações Importantes</h3>
              <ul style="color: #92400e; margin: 0; padding-left: 20px;">
                <li>Chegue pontualmente no horário agendado</li>
                <li>Confirme seu agendamento entrando em contato pelo telefone informado</li>
                <li>Em caso de cancelamento, avise com antecedência</li>
              </ul>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
            
            <p style="color: #6b7280; font-size: 12px; text-align: center;">
              Este é um e-mail automático, não responda a esta mensagem.<br>
              Em caso de dúvidas, entre em contato diretamente com o prestador.<br>
              TWBooking - Sistema de Agendamento Online
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
      Agendamento Confirmado - ${booking.serviceNameSnapshot}
      
      Olá, ${booking.customerNameSnapshot}!
      
      Seu agendamento foi confirmado com sucesso. Confira os detalhes abaixo:
      
      DETALHES DO AGENDAMENTO
      Serviço: ${booking.serviceNameSnapshot}
      Valor: ${formatPrice(booking.servicePriceSnapshot)}
      Data e Horário: ${formatDateTime(booking.dateTime)}
      Local: ${booking.addressSnapshot}
      ${booking.serviceDescriptionSnapshot ? `Descrição: ${booking.serviceDescriptionSnapshot}` : ''}
      
      INFORMAÇÕES DO PRESTADOR
      Empresa: ${booking.provider.businessName}
      Responsável: ${booking.provider.name}
      Telefone: ${booking.provider.phone}
      
      ORIENTAÇÕES IMPORTANTES
      - Chegue pontualmente no horário agendado
      - Confirme seu agendamento entrando em contato pelo telefone informado
      - Em caso de cancelamento, avise com antecedência
      
      TWBooking - Sistema de Agendamento Online
    `
  }

  await transporter.sendMail(mailOptions)
}

/**
 * Envia e-mail de notificação de novo agendamento para o prestador
 */
export async function sendBookingNotificationToProvider(booking: {
  id: string
  dateTime: Date
  serviceNameSnapshot: string
  servicePriceSnapshot: number
  customerNameSnapshot: string
  customerEmailSnapshot: string
  customer: {
    phone: string
  }
  provider: {
    businessName: string
    email: string
  }
}): Promise<void> {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(price)
  }

  const formatDateTime = (dateTime: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "America/Sao_Paulo"
    }).format(dateTime)
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@twbooking.com',
    to: booking.provider.email,
    subject: `Novo Agendamento - ${booking.serviceNameSnapshot}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Novo Agendamento</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; border: 1px solid #e9ecef;">
            <h1 style="color: #2563eb; margin-bottom: 20px;">📅 Novo Agendamento Recebido</h1>
            
            <p>Olá!</p>
            
            <p>Você recebeu um novo agendamento através do TWBooking. Confira os detalhes abaixo:</p>
            
            <div style="background: #dbeafe; border: 1px solid #2563eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h2 style="color: #2563eb; margin-top: 0; margin-bottom: 15px;">Detalhes do Agendamento</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Serviço:</td>
                  <td style="padding: 8px 0; color: #374151;">${booking.serviceNameSnapshot}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Valor:</td>
                  <td style="padding: 8px 0; color: #374151;">${formatPrice(booking.servicePriceSnapshot)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Data e Horário:</td>
                  <td style="padding: 8px 0; color: #374151;">${formatDateTime(booking.dateTime)}</td>
                </tr>
              </table>
            </div>

            <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0; margin-bottom: 15px;">Dados do Cliente</h3>
              <p style="margin: 5px 0;"><strong>Nome:</strong> ${booking.customerNameSnapshot}</p>
              <p style="margin: 5px 0;"><strong>E-mail:</strong> ${booking.customerEmailSnapshot}</p>
              <p style="margin: 5px 0;"><strong>Telefone:</strong> ${booking.customer.phone}</p>
            </div>

            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <h3 style="color: #92400e; margin-top: 0; margin-bottom: 10px;">📋 Próximos Passos</h3>
              <ul style="color: #92400e; margin: 0; padding-left: 20px;">
                <li>Confirme o agendamento entrando em contato com o cliente</li>
                <li>Prepare-se para o atendimento no horário marcado</li>
                <li>Acesse seu dashboard para gerenciar todos os agendamentos</li>
              </ul>
            </div>
            
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
      Novo Agendamento - ${booking.serviceNameSnapshot}
      
      Olá!
      
      Você recebeu um novo agendamento através do TWBooking. Confira os detalhes abaixo:
      
      DETALHES DO AGENDAMENTO
      Serviço: ${booking.serviceNameSnapshot}
      Valor: ${formatPrice(booking.servicePriceSnapshot)}
      Data e Horário: ${formatDateTime(booking.dateTime)}
      
      DADOS DO CLIENTE
      Nome: ${booking.customerNameSnapshot}
      E-mail: ${booking.customerEmailSnapshot}
      Telefone: ${booking.customer.phone}
      
      PRÓXIMOS PASSOS
      - Confirme o agendamento entrando em contato com o cliente
      - Prepare-se para o atendimento no horário marcado
      - Acesse seu dashboard para gerenciar todos os agendamentos
      
      TWBooking - Sistema de Agendamento Online
    `
  }

  await transporter.sendMail(mailOptions)
}
