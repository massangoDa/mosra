import express from 'express';
const router = express.Router({ mergeParams: true });
import { authenticateToken } from '../../middleware/auth.middleware.js';
import * as invoicesController from "../../controllers/invoice.controller.js";

// customers/:customerId/cases/:caseId/invoices/
router.post('/', authenticateToken, invoicesController.createInvoice);
router.get('/', authenticateToken, invoicesController.getInvoices);

export default router;
