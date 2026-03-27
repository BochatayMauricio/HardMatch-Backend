import { Router } from 'express';
import { create, getAll, getById, remove, update, compare } from '../controllers/product.controller.js';
import { validateSchema } from '../middlewares/validateData.middleware.js';
import { createProductSchema, compareProductsSchema } from '../../utils/validators.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getAll);
router.post('/compare', validateSchema(compareProductsSchema), compare);
router.get('/:id', getById);

router.post('/',authenticate, validateSchema(createProductSchema), create);
router.put('/:id',authenticate, validateSchema(createProductSchema), update);
router.delete('/:id',authenticate, remove);

export default router;