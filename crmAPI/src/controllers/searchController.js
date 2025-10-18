import {ObjectId} from "mongodb";
import {db} from "../db.js";
import {normalizeForSearch} from "../utils/normalizeForSearch.js";

const searchCompanyName = async (req, res) => {
    try {
        const customerId = req.params.customerId;
        const userId = req.user.id;

        const resultCompanyName = await db.collection("customers").findOne({
            _id: new ObjectId(customerId),
            userId: userId,
        }, {
            projection: { companyName: 1 }
        });

        res.json({
            companyName: resultCompanyName.companyName,
        });
    } catch (error) {
        res.error(500, error.message);
    }
}

const searchTransactions = async (req, res) => {
    try {
        const query = req.query.q;
        const userId = req.user.id;

        const normalized = normalizeForSearch(query);

        const transactions = await db.collection("transactions").find({
            userId: userId,
            searchProduct: { $regex: normalized, $options: 'i' }
        }).sort({ createdAt: -1 }).toArray();

        res.json({
            success: true,
            transactions
        });

    } catch (error) {
        res.error(500, error.message);
    }
}

export default {
    searchCompanyName,
    searchTransactions,
}