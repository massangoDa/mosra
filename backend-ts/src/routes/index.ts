import express from 'express';
import customersRoutes from "./customer.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import accountsRoutes from "./accounts.routes.js";

const router = express.Router();

router.use("/customers", customersRoutes);
router.use("/accounts", accountsRoutes)
router.use("/dashboard", dashboardRoutes);

export default router;