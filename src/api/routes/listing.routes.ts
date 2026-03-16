import { Router } from 'express';
import { create, getByProduct, getHistory } from '../controllers/listing.controller.js';
import { validateSchema } from '../middlewares/validateData.middleware.js';
import { createListingSchema } from '../../utils/validators.js';
import { authenticate } from '../middlewares/auth.middleware.js'; 

const router = Router();

// ==========================================
// RUTAS PÚBLICAS (Para que el Frontend muestre los precios)
// ==========================================
router.get('/product/:productId', getByProduct);
router.get('/product/:productId/history', getHistory);

// ==========================================
// RUTAS PRIVADAS (Para que el Scraper (o un Admin) envíe las ofertas nuevas)
// ==========================================
router.use(authenticate);
router.post('/', validateSchema(createListingSchema), create);


export default router;