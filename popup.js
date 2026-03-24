const KEYS = ["sort", "item_types", "status", "price_min"];

// ストレージから設定を読み込んでトグルに反映
chrome.storage.sync.get(KEYS, (stored) => {
  for (const key of KEYS) {
    const el = document.getElementById(key);
    if (!el) continue;
    // 初回（未設定）はデフォルト ON
    el.checked = stored[key] !== false;
  }
});

// トグル変更時にストレージへ保存
for (const key of KEYS) {
  const el = document.getElementById(key);
  if (!el) continue;
  el.addEventListener("change", () => {
    chrome.storage.sync.set({ [key]: el.checked });
  });
}
