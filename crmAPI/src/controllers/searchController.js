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

const searchLastNameFirstName = async (req, res) => {
    try {
        const contactId = req.params.contactId;
        const userId = req.user.id;

        console.log("contactId", contactId);

        const resultContact = await db.collection("contacts").findOne({
            _id: new ObjectId(contactId),
            userId: userId,
        }, {
            projection: { lastName: 1, firstName: 1 }
        });

        if (!resultContact) {
            return res.error(404);
        }

        res.json({
            lastName: resultContact.lastName,
            firstName: resultContact.firstName,
        });

    } catch (error) {
        res.error(500, error.message);
    }
}

export default {
    searchCompanyName,
    searchTransactions,
    searchLastNameFirstName,
}