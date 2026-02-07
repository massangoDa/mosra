import { MongoClient, Db } from 'mongodb';
import dotenv from "dotenv";

dotenv.config();

const url: string = process.env.MONGODB_URL || '';

let client: MongoClient | undefined;
export let db: Db;

export async function connectToMongo(): Promise<Db> {
    if (db) return db;

    try {
        client = await MongoClient.connect(url);
        console.log("Mongoサーバーと接続されました");

        db = client.db('crm');
        return db;
    } catch (err) {
        console.log("Mongoとの接続でエラーが発生しました", err);
        process.exit(1);
    }
}