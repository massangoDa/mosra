import express from 'express';
const router = express.Router();
import { authenticateToken } from '../middleware/auth.js';
import accountsController from '../controllers/accountsController.js';
import multer from "multer";
import * as path from "node:path";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const upload = multer({ dest: path.join(__dirname, '..', 'uploads', 'icons') });

router.post('/login', accountsController.loginAccount); // 単
router.post('/register', accountsController.registerAccount); // 単
router.post('/logout', accountsController.logoutAccount); // 単
router.put('/user', accountsController.updateAccount); // 単
router.put('/user/icon', upload.single('icon'), accountsController.updateIcon); // 単
router.get('/loginHistory', authenticateToken, accountsController.getLoginHistory); // 複

export default router;