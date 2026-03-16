import { Router } from 'express';
import { create, getAll, getById } from '../controllers/brand.controller.js';
import { validateSchema } from '../middlewares/validateData.middleware.js';
import { createBrandSchema } from '../../utils/validators.js';
import { authenticate } from '../middlewares/auth.middleware.js'; 

const router = Router();

// ==========================================
// RUTAS PÚBLICAS (Cualquier usuario o visitante)
// ==========================================
router.get('/', getAll);
router.get('/:id', getById);

// ==========================================
// RUTAS PRIVADAS (Requieren token)
// ==========================================
router.use(authenticate); // Aplica autenticación a todas las rutas de este router

// POST, PUT, DELETE protegidos
router.post('/', validateSchema(createBrandSchema), create);

export default router;