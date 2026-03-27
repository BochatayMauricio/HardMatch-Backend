import { Request, Response } from 'express';
import { procesarMensajeChat } from '../../core/services/chatbot.service.js';

export const handleChat = async (req: Request, res: Response): Promise<void> => {
    try {
        const { message, history } = req.body;
        const userId = req.user?.userId || (req.user as any)?.id;

        if (!message) {
            res.status(400).json({ error: "El campo 'message' es obligatorio." });
            return;
        }

        const reply = await procesarMensajeChat(message, history, userId);

        res.status(200).json({ success: true, reply });

    } catch (error) {
        // ...
    }
};