import express from 'express';
const router = express.Router();
import { authenticateToken } from '../middleware/auth.js';
import accountsController from '../controllers/accountsController.js';

router.post('/login', accountsController.loginAccount);
router.post('/register', accountsController.registerAccount);
router.post('/logout', accountsController.logoutAccount);

export default router;