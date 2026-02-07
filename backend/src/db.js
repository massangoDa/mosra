import { MongoClient } from 'mongodb';
import dotenv from "dotenv";
dotenv.config();

const url = process.env.MONGODB_URL;

let db;
let client;

export async function connectToMongo() {
    try {
        client = await MongoClient.connect(url);
        console.log("Mongoサーバーと接続されました")
        db = client.db('crm');
        return db;
    } catch (err) {
        console.log("Mongoとの接続でエラーが発生しました", err);
        process.exit(1);
    }
}

export { db };