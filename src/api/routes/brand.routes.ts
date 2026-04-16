import { Router } from 'express';
import { create, getAll, getById } from '../controllers/brand.controller.js';
import { validateSchema } from '../middlewares/validateData.middleware.js';
import { createBrandSchema } from '../../utils/validators.js';
import { authenticate } from '../middlewares/auth.middleware.js'; 

const router = Router();

router.get('/', getAll);
router.get('/:id', getById);
router.post('/',authenticate, validateSchema(createBrandSchema), create);

export default router;