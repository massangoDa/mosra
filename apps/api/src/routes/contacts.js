import express from 'express';
const router = express.Router({ mergeParams: true });
import { authenticateToken } from '../middleware/auth.js';
import contactsController from '../controllers/contactsController.js';

router.get('/', authenticateToken, contactsController.getContacts); // 複
router.post('/', authenticateToken, contactsController.createContact); // 単
router.put('/:contactId', authenticateToken, contactsController.updateContact); // 単
router.delete('/:contactId', authenticateToken, contactsController.deleteContact); // 単

export default router;