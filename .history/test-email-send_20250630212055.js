const testEmailSend = async () => {
  console.log('🧪 Testando API de envio de emails...')
  
  try {
    const emailData = {
      title: 'Teste de Envio',
      message: 'Esta é uma mensagem de teste para verificar se o sistema de envio de emails está funcionando corretamente.',
      type: 'info',
      category: 'email',
      priority: 'medium',
      sendEmail: true,
      sendPush: false,
      iconType: 'announcement',
      recipients: {
        emails: ['teste1@exemplo.com', 'teste2@exemplo.com']
      }
    }

    console.log('📧 Dados de teste:', emailData)

    const response = await fetch('http://localhost:3000/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    })

    const result = await response.json()
    
    console.log('📊 Status da resposta:', response.status)
    console.log('📊 Resultado:', result)

    if (result.success) {
      console.log('✅ Teste passou! Email enviado com sucesso')
      console.log(`📧 Enviado para ${emailData.recipients.emails.length} destinatário(s)`)
    } else {
      console.log('❌ Teste falhou:', result.message)
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

// Executar teste
testEmailSend() 