// 型定義は全てこの中へ(多くなればファイル分けします)
export interface Customer {
    _id: string;
    companyName: string;
    type?: string;
    category?: string;
    website?: string;
    phone?: string;
    description?: string;
}