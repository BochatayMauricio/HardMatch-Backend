import { Router } from 'express';
import { 
  getStores, 
  getStoreById, 
  createStore, 
  updateStore, 
  deleteStore 
} from '../controllers/store.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getStores);
router.get('/:id', getStoreById);
router.post('/',authenticate, createStore);
router.put('/:id', authenticate, updateStore);
router.delete('/:id',authenticate, deleteStore);


export default router;