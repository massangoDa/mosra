import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import * as dashboardController from '../controllers/dashboard.controller.js';

const router = express.Router();



export default router;