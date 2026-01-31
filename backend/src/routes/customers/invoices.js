import express from 'express';
const router = express.Router({ mergeParams: true });
import { authenticateToken } from '../../middleware/auth.js';
import invoicesController from '../../controllers/cases/invoicesController.js';

router.get('/', authenticateToken, invoicesController.getInvoices); // 複
router.post('/', authenticateToken, invoicesController.createInvoice); // 単
router.get('/:invoiceId', authenticateToken, invoicesController.getInvoice); // 単
router.put('/:invoiceId', authenticateToken, invoicesController.updateInvoice); // 単
router.delete('/:invoiceId', authenticateToken, invoicesController.deleteInvoice); // 単
router.get('/:invoiceId/transactions' ,authenticateToken, invoicesController.getInvoiceTransactions); // 単の複
router.get('/:invoiceId/transactions/:transactionId', authenticateToken, invoicesController.getInvoiceTransaction); // 単の単
router.put('/:invoiceId/transactions/:transactionId', authenticateToken, invoicesController.updateInvoiceTransaction); // 単の単
router.delete('/:invoiceId/transactions/:transactionId', authenticateToken, invoicesController.deleteInvoiceTransaction); // 単の単

export default router;