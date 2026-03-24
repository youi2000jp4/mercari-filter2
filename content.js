// メルカリ検索フィルター v2.0
// ポップアップUIで各フィルターを ON/OFF 切り替え可能

const FILTER_PARAMS = {
  sort:       { key: "sort",       value: "created_time" },
  order:      { key: "order",      value: "desc" },
  item_types: { key: "item_types", value: "mercari" },
  status:     { key: "status",     value: "sold_out" },
  price_min:  { key: "price_min",  value: "3000" },
};

let lastUrl = "";
let extensionSetUrl = "";
let settings = {};

function getActiveFilters() {
  const active = {};
  for (const [id, param] of Object.entries(FILTER_PARAMS)) {
    if (id === "order") continue; // order は sort と連動
    if (settings[id] !== false) {
      active[param.key] = param.value;
      if (id === "sort") {
        active[FILTER_PARAMS.order.key] = FILTER_PARAMS.order.value;
      }
    }
  }
  return active;
}

function applyFilters() {
  if (!location.pathname.startsWith("/search")) {
    extensionSetUrl = "";
    return;
  }

  const active = getActiveFilters();
  const params = new URLSearchParams(location.search);

  const needsRedirect = Object.entries(active).some(
    ([key, val]) => params.get(key) !== val
  );

  if (!needsRedirect) {
    extensionSetUrl = location.href;
    return;
  }

  const url = new URL(location.href);
  for (const [key, val] of Object.entries(active)) {
    url.searchParams.set(key, val);
  }

  extensionSetUrl = url.toString();
  location.href = url.toString();
}

// ストレージから設定を読み込んで監視開始
chrome.storage.sync.get(
  ["sort", "item_types", "status", "price_min"],
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
