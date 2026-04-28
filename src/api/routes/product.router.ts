import { Router } from 'express';
import {
	create,
	getAll,
	getById,
	remove,
	update,
	compare,
	syncFromScraper,
	syncFromScraperByMercadoLibre,
	syncFromScraperByCompraGamer,
	syncFromScraperByVenex,
	syncFromScraperByFravega
} from '../controllers/product.controller.js';
import { validateSchema } from '../middlewares/validateData.middleware.js';
import {
	createProductSchema,
	compareProductsSchema,
	syncScrapedProductsSchema
} from '../../utils/validators.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getAll);
router.post('/compare', validateSchema(compareProductsSchema), compare);
router.get('/:id', getById);

router.post('/',authenticate, validateSchema(createProductSchema), create);
router.put('/:id',authenticate, validateSchema(createProductSchema), update);
router.delete('/:id',authenticate, remove);

//scrapers
router.post('/sync-from-scraper', authenticate, validateSchema(syncScrapedProductsSchema), syncFromScraper);
router.post('/sync-from-mercadolibre', authenticate, validateSchema(syncScrapedProductsSchema), syncFromScraperByMercadoLibre);
router.post('/sync-from-compragamer', authenticate, validateSchema(syncScrapedProductsSchema), syncFromScraperByCompraGamer);
router.post('/sync-from-venex', authenticate, validateSchema(syncScrapedProductsSchema), syncFromScraperByVenex);
router.post('/sync-from-fravega', authenticate, validateSchema(syncScrapedProductsSchema), syncFromScraperByFravega);

export default router;