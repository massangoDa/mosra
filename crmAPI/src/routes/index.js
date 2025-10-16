import express from 'express';
const router = express.Router();
import dashboardRoutes from "./dashboard.js";

router.use("/dashboard", dashboardRoutes);
// 明日はココ。router.useで/customers の場合
// それと、/customers:customerId/transactions これは取引関連を入れたい

export default router;