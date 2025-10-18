import app from "./app.js";
import dotenv from "dotenv";
import {connectToMongo} from "./db.js";
dotenv.config();

const PORT = process.env.PORT || 5000;

connectToMongo().then(() => {
    app.listen(PORT, () => {
        console.log(`サーバーが起動しました (ポート:${PORT})`);
    })
})