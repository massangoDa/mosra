import express from 'express'
const router = express.Router({ mergeParams: true })
import { authenticateToken } from '../../middleware/auth.middleware.js'
import * as invoicesController from '../../controllers/invoice.controller.js'

// customers/:customerId/cases/:caseId/invoices/

router.get('/', authenticateToken, invoicesController.getInvoices)
router.post('/', authenticateToken, invoicesController.createInvoice)

router.get('/:invoiceId/', authenticateToken, invoicesController.getInvoice)

export default router
