import { Router } from 'express';
import { handleRedirect } from '../controllers/analytics.controller.js';

const router = Router();

router.get('/:listingId', handleRedirect);

export default router;