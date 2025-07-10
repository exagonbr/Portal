import { Request, Response } from 'express';
import { ChatRepository } from '../repositories/ChatRepository'
import { Chat } from '../entities/Chat';;
import { ChatMessage } from '../entities/ChatMessage';

const chatRepository = new ChatRepository();

class ChatController {
    async getMessages(req: Request, res: Response) {
        try {
            const messages = await chatRepository.findAllPaginated(req.query);
            res.json({ success: true, data: messages });
        } catch (error) {
            console.error('Erro ao buscar mensagens:', error);
            res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        }
    }

    async sendMessage(req: Request, res: Response) {
        try {
            const message = await chatRepository.create(req.body);
            res.status(201).json({ success: true, data: message });
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        }
    }
}

export default new ChatController();