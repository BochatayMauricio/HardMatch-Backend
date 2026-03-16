import { Router } from 'express';
import { create, getAll, getById } from '../controllers/category.controller.js';
import { validateSchema } from '../middlewares/validateData.middleware.js';
import { createCategorySchema } from '../../utils/validators.js';

// Asumiendo que Valentino ya armó este middleware:
import { authenticate } from '../middlewares/auth.middleware.js'; 

const router = Router();

// ==========================================
// RUTAS PÚBLICAS (Cualquier usuario o visitante)
// ==========================================
router.get('/', getAll);
router.get('/:id', getById);

// ==========================================
// RUTAS PÚBLICAS (Cualquier usuario o visitante)
// ==========================================
router.use(authenticate); // Aplica autenticación a todas las rutas de este router

// POST, PUT, DELETE protegidos
router.post('/', validateSchema(createCategorySchema), create);

export default router;