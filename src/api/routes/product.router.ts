import { Router } from 'express';
import { create, getAll, getById, remove, update, compare } from '../controllers/product.controller.js';
import { validateSchema } from '../middlewares/validateData.middleware.js';
import { createProductSchema, compareProductsSchema } from '../../utils/validators.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// ==========================================
// RUTAS PÚBLICAS (Cualquier usuario o visitante)
// ==========================================
router.get('/', getAll);

router.post('/compare', validateSchema(compareProductsSchema), compare);

router.get('/:id', getById);

// ==========================================
// RUTAS PRIVADAS (Requieren token)
// ==========================================
router.use(authenticate);

router.post('/', validateSchema(createProductSchema), create);
router.put('/:id', validateSchema(createProductSchema), update);
router.delete('/:id', remove);

export default router;