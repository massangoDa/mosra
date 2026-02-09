import express from 'express'
const router = express.Router({ mergeParams: true })
import { authenticateToken } from '../../middleware/auth.middleware.js'
import * as casesController from '../../controllers/case.controller.js'

// customers/:customerId/cases/

router.get('/', authenticateToken, casesController.getCases)
router.post('/', authenticateToken, casesController.createCase)

router.get('/:caseId', authenticateToken, casesController.getCase)
router.put('/:caseId', authenticateToken, casesController.updateCase)
router.delete('/:caseId', authenticateToken, casesController.deleteCase)

export default router
