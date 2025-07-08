import { Request, Response } from 'express';
import { ChatRepository } from '../repositories/ChatRepository'
import { Chat } from '../entities/Chat';;

const chatRepository = new ChatRepository();

class ChatController {
    async getMessages(req: Request, res: Response) {
        const messages = await chatRepository.findAll(req.query);
        res.json(messages);
    }

    async sendMessage(req: Request, res: Response) {
        const message = await chatRepository.create(req.body);
        res.status(201).json(message);
    }
}

export default new ChatController();