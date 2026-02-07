import express from "express";
import dotenv from "dotenv";
import {connectToMongo} from "./utils/db.js";
import routes from "./routes/index.js";
import * as path from "node:path";
import {fileURLToPath} from "url";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("trust proxy", true);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api", routes);

connectToMongo().then(() => {
    app.listen(PORT, () => {
        console.log(`サーバーが起動しました (ポート:${PORT})`);
    })
})