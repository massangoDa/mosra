# データモデル

`data-models` はAPIおよびフロントエンドで使用されるデータモデルを説明します。

## 型定義について
本プロジェクトで使用されるすべての型定義は、[types/types.ts](../../apps/web/app/types/types.ts) に書かれています。

各テーブルの項目で、「型定義」列が `x` のものは、DBには保存されていますがアプリケーション側の型からは意図的に除外されている項目です。

## ドメインモデル
- [Customer（顧客）](#customer顧客)
- [Transaction（取引）](#transaction取引)
- [Invoice (請求書)](#invoice-請求書)
- [Calendar（カレンダー）](#calendarカレンダー)
- [Comment（コメント）](#commentコメント)
- [Contacts（担当者）](#contacts担当者)
- [Cases（案件）](#cases案件)

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

## Invoice （請求書）
顧客の請求書情報を保持しています。

| プロパティ            | 型      | 型定義 | 説明              |
|:-----------------|:-------|:---:|:----------------|
| `_id`            | string |  ◯  | 内部システムID（DB主キー） |
| `userId`         | string |  ×  | ユーザID           |
| `customerId`     | string |  ◯  | 顧客ID            |
| `invoiceNumber`  | string |  ◯  | 請求書番号           |
| `totalAmount`    | number |  ◯  | 総額              |
| `invoiceRequest` | string |  ◯  | 請求する(した)日付      |
| `invoiceStatus`  | number |  ◯  | 請求書ステータス        |
| `createdAt`      | string |  ×  | 作成日時            |
| `updatedAt`      | string |  ×  | 更新日時            |

```ts
interface Invoice {
    _id: string;
    customerId: string;
    invoiceNumber: string;
    totalAmount: number;
    invoiceRequest: string;
    invoiceStatus: string;
}
```

## Calendar（カレンダー）
カレンダーに表示される予定・イベント情報を保持しています。

| プロパティ             | 型       | 型定義 | 説明        |
|:------------------|:--------|:---:|:----------|
| `_id`             | string  |  ◯  | 内部システムID  |
| `userId`          | string  |  ×  | ユーザID     |
| `title`           | string  |  ◯  | 予定タイトル    |
| `description`     | string  |  ◯  | 予定の詳細説明   |
| `date`            | string  |  ◯  | 予定日       |
| `startTime`       | string  |  ◯  | 開始時刻      |
| `endTime`         | string  |  ◯  | 終了時刻      |
| `allDay`          | boolean |  ◯  | 終日フラグ     |
| `category`        | string  |  ◯  | 予定のカテゴリ   |
| `color`           | string  |  ◯  | カレンダー表示色  |
| `relatedInvoice`  | string  |  ◯  | 関連する請求書ID |
| `relatedCustomer` | string  |  ◯  | 関連する顧客ID  |
| `status`          | string  |  ◯  | ステータス     |
| `location`        | string  |  ◯  | 場所        |
| `createdAt`       | string  |  ×  | 作成日時      |
| `updatedAt`       | string  |  ×  | 更新日時      |

```ts
interface Calendar {
    _id: string;
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    allDay: boolean;
    category: string;
    color: string;
    relatedInvoice: string;
    relatedCustomer: string;
    status: string;
}
```

## Comment（コメント）
顧客や取引に関連するチャット・メモ情報を保持しています。

| プロパティ        | 型      |    型定義    | 説明       |
|:-------------|:-------|:---------:|:---------|
| `_id`        | string |     ◯     | 内部システムID |
| `userId`     | string |     ×     | ユーザID    |
| `customerId` | string |     ◯     | 顧客ID     |
| `comment`    | string |     ◯     | コメント内容   |
| `name`       | string | ◯(DBにはない) | 投稿者名     |
| `createdAt`  | string |     ◯     | 作成日時     |

```ts
interface Comment {
    _id: string;
    customerId: string;
    comment: string;
    name: string;
    createdAt: string;
}
```

## Contacts（担当者）
顧客に紐づく個別の連絡先・担当者情報を保持しています。

| プロパティ        | 型      | 型定義 | 説明       |
|:-------------|:-------|:---:|:---------|
| `_id`        | string |  ◯  | 内部システムID |
| `userId`     | string |  ×  | ユーザID    |
| `customerId` | string |  ◯  | 顧客ID     |
| `lastName`   | string |  ◯  | 姓        |
| `firstName`  | string |  ◯  | 名        |
| `email`      | string |  ◯  | メールアドレス  |
| `phone`      | string |  ◯  | 電話番号     |
| `notes`      | string |  ◯  | 備考       |
| `createdAt`  | string |  ×  | 作成日時     |

```ts
interface Contacts {
    _id: string;
    customerId: string;
    lastName: string;
    firstName: string;
    email: string;
    phone: string;
    notes: string;
}
```

## Cases（案件）
顧客との進行中の案件やプロジェクト情報を保持しています。

| プロパティ            | 型      | 型定義 | 説明       |
|:-----------------|:-------|:---:|:---------|
| `_id`            | string |  ◯  | 内部システムID |
| `userId`         | string |  ×  | ユーザID    |
| `caseName`       | string |  ◯  | 案件名      |
| `category`       | string |  ◯  | 案件カテゴリ   |
| `caseStartDate`  | string |  ◯  | 案件開始日    |
| `caseFinishDate` | string |  ◯  | 案件終了日    |
| `monthlyFee`     | number |  ◯  | 月額費用     |
| `billingCycle`   | string |  ◯  | 請求サイクル   |
| `createdAt`      | string |  ×  | 作成日時     |

```ts
interface Cases {
    _id: string;
    caseName: string;
    category: string;
    caseStartDate: string;
    caseFinishDate: string;
    monthlyFee: number;
    billingCycle: string;
}
```

## 共通・補助モデル

### SearchResult（検索結果）
グローバル検索等で使用される検索結果データ。
```ts
interface SearchResult {
    _id: string;
    customerId: string;
    invoiceId: string;
    product: string;
    amount: number;
}
```

### loginHistory（ログイン履歴）
セキュリティ管理のためのログインログ。
```ts
interface loginHistory {
    loginTime: string;
    ipAddress: string;
    device: string;
}
```