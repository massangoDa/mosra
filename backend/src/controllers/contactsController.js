import { db } from '../db.js';
import {ObjectId} from "mongodb";

const getContacts = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.collection("contacts").find({
            userId: userId,
        }).sort({ createdAt: -1 }).toArray();

        res.json(result);
    } catch(error) {
        console.log("連絡先取得でエラー発生", error);
        res.error(500, error.message);
    }
}

const createContact = async (req, res) => {
    try {
        const { lastName, firstName, customerId, email, phone, notes } = req.body;
        const userId = req.user.id;

        const contact = {
            userId: userId,
            customerId: customerId ? new ObjectId(customerId) : null,
            lastName: lastName,
            firstName: firstName,
            email: email,
            phone: phone,
            notes: notes,
            createdAt: new Date(),
        };

        const result = await db.collection("contacts").insertOne(contact);
        res.success(201);
    } catch (error) {
        console.log("連絡先を追加でエラー発生", error);
        res.error(500, error.message);
    }
}

const updateContact = async (req, res) => {
    try {
        const { lastName, firstName, customerId, email, phone, notes } = req.body;
        const contactId = req.params.contactId;
        const userId = req.user.id;

        const existingContact = await db.collection("contacts").findOne({
            _id: new ObjectId(contactId),
            userId: userId
        });

        const updateData = {
            $set: {
                updatedAt: new Date()
            }
        }

        if (lastName !== undefined) updateData.$set.lastName = lastName;
        if (firstName !== undefined) updateData.$set.firstName = firstName;
        if (customerId !== undefined) updateData.$set.customerId = new ObjectId(customerId);
        if (email !== undefined) updateData.$set.email = email;
        if (phone !== undefined) updateData.$set.phone = phone;
        if (notes !== undefined) updateData.$set.notes = notes;

        const result = await db.collection("contacts").updateOne({
            _id: new ObjectId(contactId),
            userId: userId
        },
            updateData
        );

        if (result.modifiedCount === 0) {
            return res.error(404);
        }

        res.json({ success: true, message: "連絡先が更新されました" });
    } catch (error) {
        console.log("連絡先更新でエラー発生", error);
        res.error(500, error.message);
    }
}

const deleteContact = async (req, res) => {
    try {
        const contactId = req.params.contactId;
        const userId = req.user.id;

        const result = await db.collection("contacts").deleteOne({
            _id: new ObjectId(contactId),
            userId: userId
        });

        res.json({ success: true, message: "連絡先の削除に成功しました" });
    } catch (error) {
        console.log("連絡先の削除でエラーが発生", error);
        res.error(500, error.message);
    }
}

export default {
    getContacts,
    createContact,
    updateContact,
    deleteContact,
}