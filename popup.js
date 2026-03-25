const KEYS = ["sort", "item_types", "status", "price_min", "price_max", "keyword_quote"];

// ストレージから設定を読み込んでトグルに反映
chrome.storage.sync.get([...KEYS, "price_min_value", "price_max_value"], (stored) => {
  for (const key of KEYS) {
    const el = document.getElementById(key);
    if (!el) continue;
    // 初回（未設定）は price_max のみデフォルト OFF、それ以外は ON
    el.checked = key === "price_max" ? stored[key] === true : stored[key] !== false;
  }
  // 価格の初期値
  const priceMinInput = document.getElementById("price_min_value");
  if (stored.price_min_value != null) priceMinInput.value = stored.price_min_value;
  const priceMaxInput = document.getElementById("price_max_value");
  if (stored.price_max_value != null) priceMaxInput.value = stored.price_max_value;
  updatePriceArea();
  updateMaster();
});

// 価格入力エリアの表示/非表示
function updatePriceArea() {
  document.getElementById("price-input-area").classList.toggle("hidden", !document.getElementById("price_min").checked);
  document.getElementById("price-max-input-area").classList.toggle("hidden", !document.getElementById("price_max").checked);
}

// マスタースイッチの状態を個別トグルから算出
function updateMaster() {
  const master = document.getElementById("master");
  const allOn = KEYS.every(key => document.getElementById(key)?.checked);
  master.checked = allOn;
}

// マスタースイッチ：全トグルを一括オン/オフ
document.getElementById("master").addEventListener("change", (e) => {
  const val = e.target.checked;
  const updates = {};
  for (const key of KEYS) {
    const el = document.getElementById(key);
    if (!el) continue;
    el.checked = val;
    updates[key] = val;
  }
  chrome.storage.sync.set(updates);
});

// 個別トグル変更時にストレージへ保存 & マスター更新
for (const key of KEYS) {
  const el = document.getElementById(key);
  if (!el) continue;
  el.addEventListener("change", () => {
    chrome.storage.sync.set({ [key]: el.checked });
    if (key === "price_min" || key === "price_max") updatePriceArea();
    updateMaster();
  });
}

// 価格入力変更時にストレージへ保存
const priceMinInput = document.getElementById("price_min_value");
priceMinInput.addEventListener("change", () => {
  chrome.storage.sync.set({ price_min_value: priceMinInput.value });
});

const priceMaxInput = document.getElementById("price_max_value");
priceMaxInput.addEventListener("change", () => {
  chrome.storage.sync.set({ price_max_value: priceMaxInput.value });
});
