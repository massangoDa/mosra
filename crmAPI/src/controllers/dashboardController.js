import { db } from '../db.js';

const getDashboard = (req, res) => {
    try {
        res.json({
            message: "ダッシュボードにアクセスした",
            user: req.user
        });
    } catch (error) {
        res.error(500, error.message);
    }
}

const getMonthlySales = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();

        // 今月の開始日と終了日
        const startOfMonth = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/01`;
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const endOfMonth = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(lastDay).padStart(2, '0')}`;

        // 先月の開始日と終了日
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const startOfLastMonth = `${lastMonthDate.getFullYear()}/${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}/01`;
        const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        const endOfLastMonth = `${lastMonthDate.getFullYear()}/${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}/${String(lastDayOfLastMonth).padStart(2, '0')}`;

        // 今月の売上のみを集計
        const currentMonthResult = await db.collection("invoices").aggregate([
            {
                $match: {
                    userId: userId,
                    invoiceRequest: {
                        $regex: /^\d{4}\/\d{2}\/\d{2}$/,
                        $gte: startOfMonth,
                        $lte: endOfMonth
                    },
                    invoiceStatus: "完了"
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$totalAmount" },
                    count: { $sum: 1 }
                }
            }
        ]).toArray();

        // 先月の売上を集計
        const lastMonthResult = await db.collection("invoices").aggregate([
            {
                $match: {
                    userId: userId,
                    invoiceRequest: {
                        $regex: /^\d{4}\/\d{2}\/\d{2}$/,
                        $gte: startOfLastMonth,
                        $lte: endOfLastMonth
                    },
                    invoiceStatus: "完了"
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$totalAmount" }
                }
            }
        ]).toArray();

        // 定義
        const currentTotal = currentMonthResult.length > 0 ? currentMonthResult[0].totalAmount : 0;
        const currentCount = currentMonthResult.length > 0 ? currentMonthResult[0].count : 0;
        const lastTotal = lastMonthResult.length > 0 ? lastMonthResult[0].totalAmount : 0;

        // 前月比を計算
        let percentageChange = 0;
        if (lastTotal > 0) {
            percentageChange = ((currentTotal - lastTotal) / lastTotal) * 100;
        }

        res.json({
            currentMonth: {
                totalAmount: currentTotal,
                count: currentCount
            },
            lastMonth: {
                totalAmount: lastTotal
            },
            comparison: {
                percentageChange: percentageChange.toFixed(1),
                isPositive: percentageChange >= 0
            }
        })
    } catch (error) {
        console.log("getMonthlySalesでエラーが発生した", error);
        res.error(500, error.message);
    }
}

const getUnpaidInvoices = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const today = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;

        const result = await db.collection("invoices").aggregate([
            {
                $match: {
                    userId: userId,
                    invoiceRequest: {
                        $regex: /^\d{4}\/\d{2}\/\d{2}$/,
                        $lt: today
                    },
                    invoiceStatus: { $in: ["取引中", "停滞中"] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$totalAmount" },
                    count: { $sum: 1 }
                }
            }
        ]).toArray();

        const unpaidTotal = result.length > 0 ? result[0].totalAmount : 0;
        const unpaidCount = result.length > 0 ? result[0].count : 0;

        res.json({
            totalAmount: unpaidTotal,
            count: unpaidCount
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: error.message });
    }
}

export default {
    getDashboard,
    getMonthlySales,
    getUnpaidInvoices,
};