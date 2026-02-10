import express from 'express'
const router = express.Router({ mergeParams: true })
import { authenticateToken } from '../middleware/auth.middleware.js'
import * as contactsController from '../controllers/contact.controller.js'

// contacts/

router.get('/', authenticateToken, contactsController.getContacts)
router.post('/', authenticateToken, contactsController.createContact)

router.get('/:contactId', authenticateToken, contactsController.getContact)
router.put('/:contactId', authenticateToken, contactsController.updateContact)
router.delete('/:contactId', authenticateToken, contactsController.deleteContact)

export default router
