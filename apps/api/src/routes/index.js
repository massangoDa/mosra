import express from 'express';
const router = express.Router();

import customersRoutes from "./customers/index.js";
import accountsRoutes from "./accounts.js";
import dashboardRoutes from "./dashboard.js";
import searchRoutes from "./search.js";
import contactsRoutes from "./contacts.js";

router.use("/customers", customersRoutes);
router.use("/accounts", accountsRoutes)
router.use("/dashboard", dashboardRoutes);
router.use("/search", searchRoutes);
router.use("/contacts", contactsRoutes);

export default router;