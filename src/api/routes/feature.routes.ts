import { Router } from 'express';
import { create, getAll, assignToProduct, getByProduct } from '../controllers/feature.controller.js';
import { validateSchema } from '../middlewares/validateData.middleware.js';
import { createFeatureSchema, assignFeatureSchema } from '../../utils/validators.js';
import { authenticate } from '../middlewares/auth.middleware.js'; 

const router = Router();

// ==========================================
// RUTAS PÚBLICAS (Cualquier usuario o visitante)
// ==========================================
router.get('/', getAll);
router.get('/product/:productId', getByProduct);

router.use(authenticate);
// ==========================================
// RUTAS PRIVADAS (Requieren token)
// ==========================================
router.post('/', validateSchema(createFeatureSchema), create);
router.post('/product/:productId', validateSchema(assignFeatureSchema), assignToProduct);

export default router;