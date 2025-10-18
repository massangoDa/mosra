import express from 'express';
const router = express.Router();

import accountsRoutes from "./accounts.js";
import dashboardRoutes from "./dashboard.js";
import customersRoutes from "./customers.js";
import searchRoutes from "./search.js";

router.use("/accounts", accountsRoutes)
router.use("/dashboard", dashboardRoutes);
router.use("/customers", customersRoutes);
router.use("/search", searchRoutes);

export default router;