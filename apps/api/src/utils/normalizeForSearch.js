// 正規化関数
export function normalizeForSearch(str) {
    if (!str) return '';

    return str
        // カタカナをひらがなに変換
        .replace(/[\u30a1-\u30f6]/g, (match) => {
            const chr = match.charCodeAt(0) - 0x60;
            return String.fromCharCode(chr);
        })
        // 長音記号を削除
        .replace(/ー/g, '')
        // 全角英数を半角に
        .normalize('NFKC')
        // 小文字に統一
        .toLowerCase()
        // スペースを削除
        .replace(/\s+/g, '')
        .trim();
}