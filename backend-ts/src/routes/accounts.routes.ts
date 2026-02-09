import express from 'express'
const router = express.Router()
import { authenticateToken } from '../middleware/auth.middleware.js'
import * as accountsController from '../controllers/account.controller.js'
import { fileURLToPath } from 'url'
import * as path from 'node:path'
import multer from 'multer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const upload = multer({ dest: path.join(__dirname, '..', 'uploads', 'icons') })

router.post('/login', accountsController.loginAccount)
router.post('/register', accountsController.registerAccount)
router.post('/logout', accountsController.logoutAccount)
router.put('/user', authenticateToken, accountsController.updateAccount)
router.put('/user/icon', authenticateToken, upload.single('icon'), accountsController.updateIcon)
router.get('/userInfo', authenticateToken, accountsController.getUserInfo)
router.get('/loginHistory', authenticateToken, accountsController.getLoginHistory)

export default router
