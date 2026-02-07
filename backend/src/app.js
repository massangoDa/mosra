import express from 'express';
import routes from './routes/index.js';
import {authenticateToken} from "./middleware/auth.js";
import {db} from "./db.js";
import {manageCalendarEvent} from "./utils/manageCalendarEvent.js";
import * as path from "node:path";
import {fileURLToPath} from "url";

const app = express();

app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.set("trust proxy", true);


// responseの型を固定化
app.use((req, res, next) => {
    res.error = (status = 500, error) => {
        res.status(status).json({ success: false, error });
    };
    res.success = (status = 200, data) => {
        res.status(status).json({ success: true, data });
    };
    next();
});

app.use("/api", routes);

/*
 カレンダー関連
———————————————*/
// 全てのイベントを提供
app.get('/api/calendar-events', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const events = await db.collection("calendar-events").find({
            userId: userId,
        }).sort({ createdAt: -1 }).toArray();
        res.json(events);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})

// 今日のイベントを提供
app.get('/api/today-calendar-events', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const now = new Date();
        const todayStr = `${now.getUTCFullYear()}-${String(now.getUTCMonth()+1).padStart(2,'0')}-${String(now.getUTCDate()).padStart(2,'0')}`;

        const events = await db.collection("calendar-events").aggregate([
            {
                $match: {
                    userId: userId
                }
            },
            {
                $addFields: {
                    startDateStr: { $substr: ["$startTime", 0, 10] }
                }
            },
            {
                $match: {
                    startDateStr: todayStr
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ]).toArray();

        res.json(events);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})

// 予定を追加
app.post('/api/calendar-events', authenticateToken, async (req, res) => {
    try {
        const { title, description, date, startTime, endTime, category, color } = req.body;
        const userId = req.user.id;

        await manageCalendarEvent({
            userId: userId,
            title: `予定: ${title}`,
            description: description,
            date: date,
            startTime: startTime,
            endTime: endTime,
            allDay: false,
            category: category,
            color: color,
        });

        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})


// 全ての請求書情報提供機能
app.get('/api/invoices', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const invoices = await db.collection("invoices").find({
            userId: userId,
        }).sort({ createdAt: -1 }).toArray();

        res.json(invoices);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})

export default app;