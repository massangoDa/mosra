import express from 'express';
const router = express.Router({ mergeParams: true });
import { authenticateToken } from '../../middleware/auth.js';
import casesController from "../../controllers/casesController.js";
import invoicesController from "../../controllers/invoicesController.js";

router.post('/', authenticateToken, casesController.createCase); // 単
router.get('/', authenticateToken, casesController.getCases); // 複
router.get('/:caseId', authenticateToken, casesController.getCase) // 単
router.post('/:caseId/invoices/', authenticateToken, invoicesController.createInvoice) // 単
router.get('/:caseId/invoices/', authenticateToken, invoicesController.getInvoices) // 複

export default router;