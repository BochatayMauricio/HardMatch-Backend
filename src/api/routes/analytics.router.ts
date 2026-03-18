import { Router } from 'express';
import { handleRedirect } from '../controllers/analytics.controller.js';

const router = Router();

// No le ponemos 'authenticate' obligatorio para que los invitados también sumen clicks
router.get('/:listingId', handleRedirect);

export default router;