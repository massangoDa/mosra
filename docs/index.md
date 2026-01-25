# MassCRM ドキュメント

このプロジェクトの設計、データ構造、およびコンポーネントに関するドキュメント一覽です。

## APIリファレンス
バックエンドAPIの仕様および開発ガイドラインです。

- [データモデル (data-models.md)](./API/data-models.md)
  - 各エンティティ（顧客、取引、請求書等）のDB構造とTypeScript型定義。
- [API実装テンプレート (api-template.md)](./API/api-template.md)
  - Controller/Routerの実装ルールとコード例。

## コンポーネント
フロントエンド（Nuxt.js）で使用されている共通コンポーネントの仕様です。

- [PageContainer (page-container.md)](components/page-container.md)
  - サイドバー、ヘッダー、コンテンツエリアを持つ標準的なページレイアウト。

## フォルダ構成
主要なディレクトリの役割です。

- `apps/api`: Express.js + MongoDB によるバックエンドサーバー。
- `apps/web`: Nuxt.js 3 によるフロントエンドアプリケーション。
- `docs`: 当ドキュメント一式。

