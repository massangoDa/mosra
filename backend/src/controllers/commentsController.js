import {ObjectId} from "mongodb";
import {db} from "../db.js";

const createComment = async (req, res) => {
    try {
        const customerId = req.params.customerId;
        const userId = req.user.id;
        const { message } = req.body;

        const comments = {
            userId: userId,
            customerId: new ObjectId(customerId),
            comment: message,
            createdAt: new Date(),
        };
        const commentResult = await db.collection("comments").insertOne(comments);

        res.status(201).json({ success: true, commentResult });
    } catch (error) {
        res.error(500, error.message);
    }
}

const getComments = async (req, res) => {
    try {
        const customerId = req.params.customerId;
        const userId = req.user.id;

        const comments = await db.collection("comments").find({
            userId: userId,
            customerId: new ObjectId(customerId),
        }).sort({ createdAt: 1 }).toArray();

        const commentsWithName = comments.map(comment => ({
            ...comment,
            name: req.user.name
        }));

        res.json(commentsWithName);
    } catch (error) {
        res.error(500, error.message);
    }
}

export default {
    createComment,
    getComments,
}