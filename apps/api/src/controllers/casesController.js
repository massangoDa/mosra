import {db} from '../db.js';
import {ObjectId} from "mongodb";

const createCase = async (req, res) => {
    try {
        const { caseName, category, caseStartDate, caseFinishDate, monthlyFee, billingCycle } = req.body;
        const customerId = req.params.customerId;
        const userId = req.user.id;

        const Case = {
            userId: userId,
            customerId: new ObjectId(customerId),
            caseName: caseName,
            category: category,
            caseStartDate: caseStartDate,
            caseFinishDate: caseFinishDate,
            monthlyFee: monthlyFee,
            billingCycle: billingCycle,
            createdAt: new Date(),
        }

        const result = await db.collection("cases").insertOne(Case);
        res.success(201);
    } catch (error) {
        console.log("案件作成でエラーが発生:", error);
        res.error(500, error.message);
    }
}

const getCases = async (req, res) => {
    try {
        const customerId = req.params.customerId;
        const userId = req.user.id;

        const cases = await db.collection("cases").find({
            userId: userId,
            customerId: new ObjectId(customerId)
        }).sort({ createdAt: -1 }).toArray();

        res.json(cases);
    } catch (error) {
        res.error(500, error.message);
    }
}

const getCase = async (req, res) => {
    try {
        const customerId = req.params.customerId;
        const caseId = req.params.caseId;
        const userId = req.user.id;

        const caseResult = await db.collection("cases").findOne({
            userId: userId,
            customerId: new ObjectId(customerId),
            _id: new ObjectId(caseId)
        });

        res.json(caseResult);
    } catch (error) {
        console.log("案件(単)取得でエラーが発生:", error);
        res.error(500, error.message);
    }
}

export default {
    createCase,
    getCases,
    getCase,
}