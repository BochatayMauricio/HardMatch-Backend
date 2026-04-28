import { Router } from 'express';
import { create, getByProduct, getHistory, registerClick } from '../controllers/listing.controller.js';
import { validateSchema } from '../middlewares/validateData.middleware.js';
import { createListingSchema } from '../../utils/validators.js';
import { authenticate } from '../middlewares/auth.middleware.js'; 

const router = Router();

router.get('/product/:productId', getByProduct);
router.get('/product/:productId/history', getHistory);
router.post('/',authenticate, validateSchema(createListingSchema), create);
router.post('/:id/click',authenticate, registerClick);

export default router;