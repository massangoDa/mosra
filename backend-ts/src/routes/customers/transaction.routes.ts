import express from 'express'
const router = express.Router({ mergeParams: true })
import { authenticateToken } from '../../middleware/auth.middleware.js'
import * as transactionsController from '../../controllers/transaction.controller.js'

// customers/:customerId/cases/:caseId/invoices/:invoiceId/transactions/

router.get('/', authenticateToken, transactionsController.getTransactions)
router.post('/', authenticateToken, transactionsController.createTransaction)

router.put('/:transactionId/', authenticateToken, transactionsController.updateTransaction)

export default router
