import { Request, Response } from 'express';
import { emailService } from '../services/emailService';
import { notificationLogService, NotificationType } from '../services/NotificationLogService';

class NotificationController {
  /**
   * @swagger
   * /api/notifications/email/verify:
   *   post:
   *     summary: Envia um email de verificação para o usuário logado
   *     tags: [Notifications]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Email de verificação enviado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Verification email sent."
   *       401:
   *         description: Usuário não autenticado
   *       500:
   *         description: Erro ao enviar email
   */
  public async sendVerificationEmail(req: Request, res: Response): Promise<void> {
    let logId: string | null = null;
    
    try {
      // TODO: Implementar uma forma real de obter o usuário.
      // Por enquanto, usaremos dados mocados para o exemplo.
      const user = {
        email: 'maia.cspg@gmail.com',
        name: 'Maia Test User',
        verificationToken: 'mock-token-12345' // Em um caso real, isso seria gerado e salvo no DB
      };

      if (!user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      // Criar log de notificação
      const log = await notificationLogService.create({
        type: NotificationType.EMAIL,
        recipient: user.email,
        subject: 'Verifique seu endereço de email - Portal Sabercon',
        template_name: 'email-verification',
        verification_token: user.verificationToken,
        user_id: 'admin', // TODO: Pegar do token JWT
        provider: 'Gmail SMTP',
        metadata: {
          userName: user.name,
          userAgent: req.get('User-Agent'),
          ip: req.ip
        }
      });

      logId = log.id;

      console.log(`📧 Enviando email de verificação para: ${user.email}`);
      console.log(`📧 Nome do usuário: ${user.name}`);
      console.log(`📧 Token de verificação: ${user.verificationToken}`);
      console.log(`📊 Log ID: ${logId}`);
      
      const emailResult = await emailService.sendVerificationEmail(user.email, user.name, user.verificationToken);

      if (emailResult && emailResult.messageId) {
        // Marcar como enviado com sucesso
        await notificationLogService.markAsSent(logId, emailResult.messageId, emailResult);
        
        res.status(200).json({
          message: 'Verification email sent.',
          recipient: user.email,
          status: 'success',
          logId: logId
        });
      } else {
        // Marcar como falhado
        await notificationLogService.markAsFailed(logId, 'Email service returned false or no messageId');
        
        res.status(500).json({ message: 'Failed to send verification email.' });
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      
      // Marcar como falhado se temos o logId
      if (logId) {
        await notificationLogService.markAsFailed(logId, error instanceof Error ? error.message : 'Unknown error');
      }
      
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default new NotificationController();