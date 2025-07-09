import { Request, Response } from 'express';
import SessionService from '../services/SessionService';
import { AppDataSource } from '../config/typeorm.config';
import { User } from '../entities/User';

class SessionController {
    async getActiveSessions(req: Request, res: Response) {
        try {
            const activeSessions = await SessionService.getActiveSessions();
            
            return res.status(200).json({
                success: true,
                data: activeSessions,
                total: activeSessions.length
            });
        } catch (error) {
            console.error('Erro ao buscar sessões ativas:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao buscar sessões ativas'
            });
        }
    }

    async terminateSession(req: Request, res: Response) {
        try {
            const { sessionId } = req.params;
            
            if (!sessionId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID da sessão é obrigatório'
                });
            }
            
            await SessionService.deleteSession(sessionId);
            
            return res.status(200).json({
                success: true,
                message: `Sessão ${sessionId} encerrada com sucesso`
            });
        } catch (error) {
            console.error('Erro ao encerrar sessão:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao encerrar sessão'
            });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const { userId, email } = req.body;

            // Validar dados obrigatórios
            if (!userId && !email) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'userId ou email são obrigatórios para criar uma sessão' 
                });
            }

            // Buscar usuário no banco de dados
            const userRepository = AppDataSource.getRepository(User);
            let user: User | null = null;

            if (userId) {
                user = await userRepository.findOne({
                    where: { id: parseInt(userId) },
                    relations: ['role']
                });
            } else if (email) {
                user = await userRepository.findOne({
                    where: { email },
                    relations: ['role']
                });
            }

            if (!user) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Usuário não encontrado' 
                });
            }

            if (!user.enabled) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Usuário não está ativo' 
                });
            }

            // Criar sessão usando o SessionService
            const sessionId = await SessionService.createSession(user);

            return res.status(201).json({
                success: true,
                message: 'Sessão criada com sucesso',
                data: {
                    sessionId,
                    userId: user.id,
                    email: user.email,
                    role: user.role?.name || 'STUDENT',
                    expiresIn: 86400 // 24 horas em segundos
                }
            });

        } catch (error) {
            console.error('Erro ao criar sessão:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor ao criar sessão' 
            });
        }
    }
}

export default new SessionController();