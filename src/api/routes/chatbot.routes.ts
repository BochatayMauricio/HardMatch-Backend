import { Router } from 'express';
import { handleChat } from '../controllers/chatbot.controller.js';
import { optionalAuthenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', optionalAuthenticate, handleChat);

export default router;