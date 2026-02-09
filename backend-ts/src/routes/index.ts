import express from 'express'
import customersRoutes from './customers/customer.routes.js'
import accountsRoutes from './accounts.routes.js'
import casesRoutes from './customers/case.routes.js'
import invoicesRoutes from './customers/invoice.routes.js'
import transactionRoutes from './customers/transaction.routes.js'

const router = express.Router()

router.use('/customers', customersRoutes)
router.use('/customers/:customerId/cases', casesRoutes)
router.use('/customers/:customerId/cases/:caseId/invoices', invoicesRoutes)
router.use('/customers/:customerId/cases/:caseId/invoices/:invoiceId/transactions/', transactionRoutes)

router.use('/accounts', accountsRoutes)

export default router
