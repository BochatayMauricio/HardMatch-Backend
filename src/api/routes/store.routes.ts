// src/routes/store.routes.ts
import { Router } from 'express';
import { 
  getStores, 
  getStoreById, 
  createStore, 
  updateStore, 
  deleteStore 
} from '../controllers/store.controller.js'; // Asegúrate de que la ruta sea correcta
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// Obtener todas las tiendas activas
router.get('/', getStores);
// Obtener una tienda específica por su ID
router.get('/:id', getStoreById);

router.use(authenticate);
// Crear una nueva tienda
router.post('/', createStore);
// Actualizar los datos de una tienda
router.put('/:id', updateStore);
// Dar de baja (lógica) a una tienda
router.delete('/:id', deleteStore);


export default router;