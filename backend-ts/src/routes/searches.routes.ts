import express from 'express'
const router = express.Router({ mergeParams: true })
import { authenticateToken } from '../middleware/auth.middleware.js'
import * as searchesController from '../controllers/searches.controller.js'

// search/

router.get('/customer/:customerId/companyName', authenticateToken, searchesController.searchCompanyName)

export default router
