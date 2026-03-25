// メルカリ検索フィルター v2.0
// ポップアップUIで各フィルターを ON/OFF 切り替え可能

const FILTER_PARAMS = {
  sort:       { key: "sort",       value: "created_time" },
  order:      { key: "order",      value: "desc" },
  item_types: { key: "item_types", value: "mercari" },
  status:     { key: "status",     value: "sold_out" },
  price_min:  { key: "price_min",  value: "3000" },  // デフォルト値、settings で上書き
  price_max:  { key: "price_max",  value: "10000" }, // デフォルト値、settings で上書き
};

let lastUrl = "";
let extensionSetUrl = "";
let settings = {};

function getActiveFilters() {
  const active = {};
  const inactive = new Set();
  for (const [id, param] of Object.entries(FILTER_PARAMS)) {
    if (id === "order") continue; // order は sort と連動
    if (settings[id] !== false) {
      const value = id === "price_min" && settings.price_min_value != null
        ? String(settings.price_min_value)
        : id === "price_max" && settings.price_max_value != null
        ? String(settings.price_max_value)
        : param.value;
      active[param.key] = value;
      if (id === "sort") {
        active[FILTER_PARAMS.order.key] = FILTER_PARAMS.order.value;
      }
    } else {
      inactive.add(param.key);
      if (id === "sort") inactive.add(FILTER_PARAMS.order.key);
    }
  }
  return { active, inactive };
}

function applyFilters() {
  if (!location.pathname.startsWith("/search")) {
    extensionSetUrl = "";
    return;
  }

  const { active, inactive } = getActiveFilters();
  const params = new URLSearchParams(location.search);

  let needsSet = Object.entries(active).some(([key, val]) => params.get(key) !== val);
  const needsRemove = [...inactive].some((key) => params.has(key));

  // フレーズ検索：keyword を " " で囲む
  const keyword = params.get("keyword");
  let newKeyword = null;
  if (keyword) {
    const isQuoted = keyword.startsWith('"') && keyword.endsWith('"');
    if (settings.keyword_quote !== false && !isQuoted) {
      newKeyword = `"${keyword}"`;
      needsSet = true;
    } else if (settings.keyword_quote === false && isQuoted) {
      newKeyword = keyword.slice(1, -1);
      needsSet = true;
    }
  }

  if (!needsSet && !needsRemove) {
    extensionSetUrl = location.href;
    return;
  }

  const url = new URL(location.href);
  for (const [key, val] of Object.entries(active)) {
    url.searchParams.set(key, val);
  }
  for (const key of inactive) {
    url.searchParams.delete(key);
  }
  if (newKeyword !== null) {
    url.searchParams.set("keyword", newKeyword);
  }

  extensionSetUrl = url.toString();
  location.href = url.toString();
}

// ストレージから設定を読み込んで監視開始
chrome.storage.sync.get(
  ["sort", "item_types", "status", "price_min", "price_min_value", "price_max", "price_max_value", "keyword_quote"],
  (stored) => {
    settings = stored;

    setInterval(() => {
      if (location.href === lastUrl) return;
      lastUrl = location.href;
      applyFilters();
    }, 300);
  }
);

// ポップアップで設定が変わったらリアルタイムで反映
chrome.storage.onChanged.addListener((changes) => {
  for (const [key, { newValue }] of Object.entries(changes)) {
    settings[key] = newValue;
  }
  lastUrl = ""; // 次の interval で再チェックさせる
});
