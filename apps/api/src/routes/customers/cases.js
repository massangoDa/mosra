import express from 'express';
const router = express.Router({ mergeParams: true });
import { authenticateToken } from '../../middleware/auth.js';
import casesController from "../../controllers/casesController.js";

router.post('/', authenticateToken, casesController.createCase); // 単
router.get('/', authenticateToken, casesController.getCases); // 複
router.get('/:caseId', authenticateToken, casesController.getCase) // 単

export default router;