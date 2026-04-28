import { Router } from "express";
import { queryController } from "../../api/controllers/query.controller.js";
// Opcional: import { extractUserIfPresent } from '../middlewares/auth.js'; 
// (Usá un middleware que no bloquee si no hay token, solo que extraiga el user si existe)

const router = Router();

router.post("/", queryController.logSearch);

export default router;