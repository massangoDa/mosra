# APIテンプレート

`API_Template` はAPIの作成する際のテンプレートを提供します。

## 実装の決まり (Controller)

- **非同期処理**: すべて `async / await` を使用し、`try-catch` で囲む。
- **認証**: 必ず `req.user.id` からユーザーIDを取得する。
- **DB操作**: `db.js` からインポートした `db` オブジェクトを使用する。
- **レスポンス**:
    - 成功時: `res.json()` または `res.success(status)` を使用。
    - 失敗時: `res.error(status, message)` を使用し、一貫したエラー形式を維持する。
- **IDの扱い**:
  - MongoDBの `_id` や参照ID（`customerId` 等）を扱う際は、`mongodb` モジュールの `ObjectId` でラップする。
  - **注意**: `userId` に関しては、過去の経緯から `ObjectId` でラップせず、文字列のまま扱う（一貫性維持のため）。

## 実装の決まり (Router)

- **認証ミドルウェア**: 全てのエンドポイントで `authenticateToken` を使用し、認証を必須とする。
- **パラメータの継承**: 子ルートで親のパスパラメータ（例：`/customer/:customerId/cases`）にアクセスできるよう、`express.Router({ mergeParams: true })` を使用する。
- **エクスポート**: 各リソース（accounts, cases等）ごとにファイルを分け、`src/routes/index.js` で集約して `app.js` から利用する。

## 実装例: Controller
`src/controllers/exampleController.js`

```javascript
import { db } from '../db.js';
import { ObjectId } from "mongodb";

const getExamples = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.collection("examples").find({ userId }).toArray();
        res.json(result);
    } catch (error) {
        console.error("取得エラー:", error);
        res.error(500, error.message);
    }
};

const createExample = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, customerId } = req.body;

        const newItem = {
            userId: userId, // ObjectIdにしない
            customerId: customerId ? new ObjectId(customerId) : null,
            name,
            createdAt: new Date()
        };

        await db.collection("examples").insertOne(newItem);
        res.success(201);
    } catch (error) {
        console.error("作成エラー:", error);
        res.error(500, error.message);
    }
};

const updateExample = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { name } = req.body;

        const result = await db.collection("examples").updateOne(
            { _id: new ObjectId(id), userId: userId },
            { 
                $set: { 
                    name, 
                    updatedAt: new Date() 
                } 
            }
        );

        if (result.modifiedCount === 0) return res.error(404, "対象が見つかりません");
        res.json({ success: true });
    } catch (error) {
        console.error("更新エラー:", error);
        res.error(500, error.message);
    }
};

export default {
    getExamples,
    createExample,
    updateExample
};
```

## 実装例: Router (リソース単位)
`src/routes/examples.js`

```javascript
import express from 'express';
const router = express.Router({ mergeParams: true });
import { authenticateToken } from '../middleware/auth.js';
import Controller from '../controllers/exampleController.js';

router.get('/', authenticateToken, Controller.getExamples);
router.post('/', authenticateToken, Controller.createExample);
router.put('/:id', authenticateToken, Controller.updateExample);

export default router;
```

## 実装例: Router (集約)
`src/routes/index.js`

```javascript
import express from 'express';
const router = express.Router();

import exampleRoutes from "./examples.js";

router.use("/examples", exampleRoutes);

export default router;
```

## 注意点
- 更新( `updateOne` )の際は、 `$set` を使用して必要なフィールドのみを更新し、 `updateAt` を付与します。