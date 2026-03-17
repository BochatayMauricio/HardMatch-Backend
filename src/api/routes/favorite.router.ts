import { Router } from 'express';
import { add, getMyFavorites, remove } from '../controllers/favorite.controller.js';
import { validateSchema } from '../middlewares/validateData.middleware.js';
import { addFavoriteSchema } from '../../utils/validators.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// ==========================================
// RUTAS DE FAVORITOS (Todas requieren Token)
// ==========================================
router.post('/', authenticate, validateSchema(addFavoriteSchema), add);
router.get('/', authenticate, getMyFavorites);
router.delete('/:idProduct', authenticate, remove);

export default router;