# 🖥️ 電腦維修管理系統 (Computer Repair Shop Management System)

一個輕量、高效、視覺現代化的純前端電腦維修管理系統。支援客戶資料庫管理、維修歷史紀錄追蹤、多時段營業數據統計分析，以及一鍵列印 A4 雙聯維修單據（公司存留單 ＋ 客戶存留單）。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Technology](https://img.shields.io/badge/tech-HTML5%20%7C%20CSS3%20%7C%20JavaScript-orange.svg)

---

## ✨ 主要功能特色

### 📊 1. 營業數據與多統計時段
* **彈性時間範圍選取**：支援「今日」、「當月」、「近三個月」、「半年內」與「去年一整年」等多種統計維度。
* **關鍵數據看板**：
  * 累積總客戶數
  * 指定時段活躍客戶數
  * 指定時段維修紀錄次數
  * 指定時段營業額 (NT$) 自動統計計算

### 🔍 2. 客戶與維修歷史管理
* **快速搜尋**：支援依「姓名」或「聯絡電話」即時關鍵字過濾搜尋。
* **客戶與維修建立**：新增客戶時同步建立首筆維修紀錄，包含維修項目、預計取回日期、費用、維修狀態與備註說明。
* **動態維修歷程**：點擊客戶卡片即可開啟詳細模態視窗（Modal），即時檢視該客戶的所有歷史維修紀錄。
* **狀態即時追蹤**：支援「✅ 已完成」與「⏳ 待取件」狀態切換與標籤顯示。
* **完整 CRUD**：支援新增、編輯、刪除單筆維修紀錄或整個客戶資料。

### 🖨️ 3. A4 雙聯維修單據列印
* **一鍵排版列印**：系統內建獨立列印 CSS，列印時自動隱藏操作介面並最佳化 A4 直式列印版型。
* **雙聯式單據設計**：一頁同時印出「公司存留單」與「客戶存留單」，並標註撕剪線位置。
* **完整資訊載錄**：包含客戶基本資料、維修項目、費用明細、預計取件時間、店家資訊與公司蓋章處。

### 💾 4. 零後端開箱即用 (LocalStorage)
* 無須安裝或設定繁雜的伺服器與資料庫，資料直接儲存於瀏覽器 `localStorage` 中。
* 隨開隨用、離線可用，資料隱私安全不外流。

### 🎨 5. 現代化 RWD 視覺介面
* 採用網格背景、漸層色彩與微動畫設計，呈現流暢的科技感體驗。
* 採用 Google Fonts `Noto Sans TC` 與 `Share Tech Mono` 現代字型。
* 支援響應式佈局（Responsive Design），在行動裝置與桌機上均有良好的瀏覽體驗。

---

## 🛠️ 技術架構 (Tech Stack)

* **HTML5**：語意化結構設計、A4 列印版型佈局。
* **CSS3**：Vanilla CSS 系統設計、Flexbox/Grid 彈性佈局、Print Media Query 列印專用樣式。
* **JavaScript (ES6+)**：DOM 操作、事件監聽、localStorage 資料持久化與統計演算法。
* **Web Fonts**：Google Fonts (Noto Sans TC, Share Tech Mono)。

---

## 🚀 快速開始 (Quick Start)

1. **複製 / 下載專案**
   ```bash
   git clone https://github.com/WMT1002/computer-repair-web.git
   ```

2. **開啟系統**
   * 直接雙擊開啟 `repair-shop.html` 檔案即可於瀏覽器中開始使用系統，無需執行任何建置命令。

---

## 📂 專案檔案結構 (Project Structure)

```text
.
├── repair-shop.html     # 主系統單一檔案（包含 HTML、CSS 樣式與 JS 邏輯）
└── README.md            # 專案說明文件
```

---

## 📝 授權條款 (License)

本專案採用 [MIT License](LICENSE) 授權。