import { Router } from 'express';
import { create, getAll, getById } from '../controllers/category.controller.js';
import { validateSchema } from '../middlewares/validateData.middleware.js';
import { createCategorySchema } from '../../utils/validators.js';
import { authenticate } from '../middlewares/auth.middleware.js'; 

const router = Router();

router.get('/', getAll);
router.get('/:id', getById);
router.post('/',authenticate, validateSchema(createCategorySchema), create);

export default router;