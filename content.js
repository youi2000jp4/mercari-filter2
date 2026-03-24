// メルカリ検索を「新しい順・個人出品・売切表示・3000円以上」に自動設定 v1.71
// SPA対応：URLの変化を監視してリダイレクト
// ユーザーが手動で外したフィルターは再適用しない

const DEFAULTS = {
  sort: "created_time",
  order: "desc",
  item_types: "mercari",
  status: "sold_out",
  price_min: "3000",
};

let lastUrl = "";
let extensionSetUrl = "";
let userOverrides = new Set(); // ユーザーが手動で変更したパラメータ

setInterval(() => {
  if (location.href === lastUrl) return;
  lastUrl = location.href;

  if (!location.pathname.startsWith("/search")) {
    userOverrides.clear();
    extensionSetUrl = "";
    return;
  }

  const params = new URLSearchParams(location.search);

  // エクステンションが設定したURLからユーザーが変更した場合、何を外したか検出
  if (extensionSetUrl && location.href !== extensionSetUrl) {
    const prevParams = new URLSearchParams(new URL(extensionSetUrl).search);
    for (const [key, defaultVal] of Object.entries(DEFAULTS)) {
      if (prevParams.get(key) === defaultVal && params.get(key) !== defaultVal) {
        userOverrides.add(key);
      }
    }
  }

  // ユーザーオーバーライドを除いて、適用が必要なパラメータをチェック
  const needsRedirect = Object.entries(DEFAULTS).some(
    ([key, val]) => !userOverrides.has(key) && params.get(key) !== val
  );
  if (!needsRedirect) {
    // 現在のURLを記録しておく（後でユーザーの変更を検出するため）
    extensionSetUrl = location.href;
    return;
  }

  const url = new URL(location.href);
  for (const [key, val] of Object.entries(DEFAULTS)) {
    if (!userOverrides.has(key)) {
      url.searchParams.set(key, val);
    }
  }

  extensionSetUrl = url.toString();
  location.href = url.toString();
}, 300);
