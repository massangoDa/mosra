import express from 'express';
const router = express.Router();
import { authenticateToken } from '../middleware/auth.js';
import accountsController from '../controllers/accountsController.js';

router.post('/login', accountsController.loginAccount); // 単
router.post('/register', accountsController.registerAccount); // 単
router.post('/logout', accountsController.logoutAccount); // 単
router.put('/user', accountsController.updateAccount); // 単

export default router;