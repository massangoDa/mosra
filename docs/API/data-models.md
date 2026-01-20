# データモデル

`data-models` はAPIおよびフロントエンドで使用されるデータモデルを説明します。

## 型定義について
本プロジェクトで使用されるすべての型定義は、[types/types.ts](../../apps/web/app/types/types.ts) に書かれています。

各テーブルの項目で、「型定義」列が `x` のものは、DBには保存されていますがアプリケーション側の型からは意図的に除外されている項目です。

## ドメインモデル
- [Customer（顧客）](#customer顧客)
- [Transaction（取引）](#transaction取引)

## Customer（顧客）
顧客の基本情報や取引の集計情報を保持しています。

| プロパティ         | 型      | 型定義 | 説明              |
|:--------------|:-------|:---:|:----------------|
| `_id`         | string |  ◯  | 内部システムID（DB主キー） |
| `userId`      | string |  ×  | ユーザID           |
| `contactId`   | string |  ◯  | 関連する担当者ID       |
| `companyName` | string |  ◯  | 会社名             |
| `type`        | string |  ◯  | 顧客種別（例：法人、個人）   |
| `category`    | string |  ◯  | 業種・カテゴリ         |
| `website`     | string |  ◯  | WebサイトURL       |
| `phone`       | string |  ◯  | 電話番号            |
| `description` | string |  ◯  | 備考・補足情報         |
| `totalAmount` | number |  ◯  | 累計取引金額          |
| `createdAt`   | string |  ×  | 作成日時            |
| `updatedAt`   | string |  ×  | 更新日時            |

```ts
interface Customer {
    _id: string;
    contactId: string;
    companyName: string;
    type?: string;
    category?: string;
    website?: string;
    phone?: string;
    description?: string;
    totalAmount?: number;
}
```

## Transaction（取引）
顧客の請求書内の取引情報を保持しています。

| プロパティ         | 型      | 型定義 | 説明              |
|:--------------|:-------|:---:|:----------------|
| `_id`         | string |  ◯  | 内部システムID（DB主キー） |
| `userId`      | string |  ×  | ユーザID           |
| `customerId`  | string |  ×  | 顧客ID            |
| `invoiceId`   | string |  ×  | 請求書ID           |
| `product`     | string |  ◯  | 請求内容            |
| `amount`      | number |  ◯  | 金額              |
| `taxInAmount` | number |  ◯  | 税金が入った金額        |
| `totalAmount` | number |  ◯  | 総額              |
| `cost`        | number |  ◯  | 原価              |
| `tax_rate`    | number |  ◯  | 税率(例: 10)       |
| `createdAt`   | string |  ×  | 作成日時            |
| `updatedAt`   | string |  ×  | 更新日時            |

```ts
interface Transaction {
    _id: string;
    product: string;
    amount: number;
    taxInAmount: number;
    totalAmount: number;
    cost: number;
    tax_rate: number;
}
```