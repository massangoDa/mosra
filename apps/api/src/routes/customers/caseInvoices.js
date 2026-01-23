import express from 'express';
const router = express.Router({ mergeParams: true });
import { authenticateToken } from '../../middleware/auth.js';
import commentsController from '../../controllers/commentsController.js';

router.post('/', authenticateToken, commentsController.createComment); // 単
router.get('/', authenticateToken, commentsController.getComments); // 複

export default router;