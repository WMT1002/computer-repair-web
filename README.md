# 🖥️ 電腦維修管理系統 (Computer Repair Shop Management System)

一個基於 **React + TypeScript + Vite + Tailwind CSS + Supabase** 打造的現代化全功能電腦維修管理系統。支援客戶與維修紀錄管理、價目表管理、維修單 A4 雙聯列印、多維度營業數據分析、雲端即時同步與 Supabase 權限認證。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.0.7-646C9A?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-06B6D4?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)

---

## ✨ 核心功能特色

### 🔐 1. 使用者認證與角色權限體系
* **Supabase Auth 認證**：支援帳號密碼註冊、登入與狀態維持。
* **三級角色權限管理**：
  * 👑 **系統管理員 (Super Admin)**：完整資料讀寫、價目表編輯、成員權限調配與角色升降級。
  * 🛠️ **一般工程師 (Engineer)**：客戶與維修紀錄之建立、維修進度更新與維修單列印。
  * 👔 **維修主管 / 門市經理 (Manager)**：營業數據統計、維修單檢視與報表匯出。

### 📊 2. 營業數據看板與多時段分析
* **彈性時間篩選**：支援「今日」、「當月」、「近三個月」、「半年內」與「去年一整年」等多維度統計。
* **關鍵營運指標 (KPI)**：
  * 累積總客戶數
  * 指定時段活躍客戶數
  * 指定時段維修完成次數
  * 指定時段營業額 (NT$) 自動計算與彙整

### 🔍 3. 客戶資料庫與維修歷史追蹤
* **即時快速搜尋**：支援透過「姓名」或「聯絡電話」快速過濾客戶。
* **完整歷程記錄**：記錄客戶所有維修歷程、項目說明、費用、預計取件日與內部備註。
* **維修狀態管理**：清楚標記「⏳ 處理中」、「✅ 已完成」與「📦 待取件」狀態。

### 🏷️ 4. 服務項目與公定價目表管理
* 支援建立常用維修項目與標準定價（例如：系統重灌、硬碟更換、清潔保養、資料救援等）。
* 新增維修紀錄時可直接一鍵帶入價目表項目與預設金額。

### 🖨️ 5. A4 雙聯維修單據列印
* **一鍵精美排版**：內建專屬列印樣式，自動最佳化 A4 直式列印。
* **雙聯設計**：一頁同時印出「公司存留聯」與「客戶存留聯」，附帶撕剪線與店家資訊欄。

### ☁️ 6. 雲端同步 ＋ 本地備份雙軌機制
* 整合 Supabase PostgreSQL 雲端資料庫，跨裝置即時同步。
* 本地 LocalStorage 快取機制，確保載入快速流暢。

---

## 🛠️ 技術架構 (Tech Stack)

| 領域 | 技術 / 套件 | 說明 |
| :--- | :--- | :--- |
| **前端核心** | React 18, TypeScript, Vite | 快速熱重載與強型別開發 |
| **UI 與樣式** | Tailwind CSS, Lucide Icons | 現代科技風深淺色主題切換與圖示 |
| **後端 / 資料庫** | Supabase (PostgreSQL, Auth, RLS) | 雲端資料庫、行級安全策略 (RLS)、使用者管理 |
| **雲端部署** | Vercel | 高效能邊緣全球 CDN 託管、自動 CI/CD |

---

## 🚀 本地開發與啟動 (Local Development)

### 1. 複製專案
```bash
git clone https://github.com/WMT1002/computer-repair-web.git
cd computer-repair-web
```

### 2. 安裝依賴套件
```bash
npm install
```

### 3. 啟動開發伺服器
```bash
npm run dev
```
瀏覽器開啟 `http://localhost:3000` 即可預覽。

### 4. 專案打包構建
```bash
npm run build
```

---

## 📂 專案檔案結構 (Project Structure)

```text
.
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 自動部署腳本
├── src/
│   ├── components/             # React 組件（模態視窗、列表、表單、認證）
│   │   ├── auth/               # 登入與註冊頁面
│   │   ├── Header.tsx          # 頂部導覽與使用者資訊
│   │   ├── CustomerList.tsx    # 客戶清單與搜尋
│   │   ├── StatsPanel.tsx      # 營業額與統計看板
│   │   ├── PrintReceiptModal.tsx # A4 維修單列印
│   │   └── ...
│   ├── config/                 # 權限與常數設定
│   ├── contexts/               # React 狀態 Context (如 AuthContext)
│   ├── styles/                 # Tailwind 與全域樣式
│   ├── types/                  # TypeScript 型別定義
│   ├── utils/                  # Storage 與 Supabase 客戶端
│   ├── App.tsx                 # 應用程式主進入點
│   └── main.tsx                # ReactDOM 渲染點
├── supabase_auth_setup.sql     # Supabase 資料表與權限初始化 SQL
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 📝 授權條款 (License)

本專案採用 [MIT License](LICENSE) 授權。