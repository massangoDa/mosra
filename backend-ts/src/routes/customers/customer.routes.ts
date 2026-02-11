import express from 'express'
const router = express.Router({ mergeParams: true })
import { authenticateToken } from '../../middleware/auth.middleware.js'
import * as customersController from '../../controllers/customer.controller.js'

router.get('/', authenticateToken, customersController.getCustomers)
router.post('/', authenticateToken, customersController.createCustomer)

router.get('/:customerId', authenticateToken, customersController.getCustomer)
router.put('/:customerId', authenticateToken, customersController.updateCustomer)
router.delete('/:customerId', authenticateToken, customersController.deleteCustomer)

router.get('/:customerId/contacts', authenticateToken, customersController.getCustomerContacts)

export default router
