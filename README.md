# Breaking News Aggregator

一個現代化的國際新聞聚合網頁，具備 Notion 風格設計。**完全免費，支援 Google Apps Script 部署，無需伺服器維護費！**

## 🌟 特色功能

- **100% 免費**：利用 Google Apps Script 作為後端，GitHub Pages 作為前端。
- **免代碼設定**：前端介面提供設定按鈕，直接貼上 API 網址即可運行。
- **RSS 聚合**：自動抓取 13 家國際頂尖媒體的頭條新聞。
- **智慧分析**：內建關鍵字匹配分類、影響力評級與趨勢分析。
- **自動去重**：確保同一事件不重複出現。

## 🚀 部署步驟 (完全免費方案)

這是一個「無伺服器」部署方式，適合個人使用。

### 第一步：準備 Google Sheet 與 後端
1. 建立一個新的 **Google Sheet**。
2. 點擊選單：**擴充功能 > Apps Script**。
3. 將本專案 `api/google_apps_script.js` 中的代碼全部貼上。
4. 點擊 **部署 > 新部署**：
   - 類型：**網頁應用程式**。
   - 誰有權存取：**所有人 (Anyone)**。
5. 點擊「部署」並授權，最後**複製「網頁應用程式網址」**。

### 第二步：部署前端
1. 將 `public` 資料夾中的所有檔案上傳到 **GitHub 倉庫**。
2. 開啟 **GitHub Pages** 功能（Settings > Pages）。
3. 訪問您的 GitHub Pages 網址。

### 第三步：連結前端與後端
1. 在您的 GitHub Pages 網頁右上方點擊 **⚙️ 設定圖示**。
2. 貼上您在第一步複製的 **Google Apps Script 網址**。
3. 點擊「儲存並重新載入」，大功告成！

## 📂 檔案結構

```
breaking-news/
├── public/             # 前端檔案（上傳至 GitHub Pages）
│   ├── index.html      # 主頁面
│   ├── styles.css      # 樣式
│   └── script.js       # 邏輯（含 localStorage 儲存設定）
├── api/
│   ├── google_apps_script.js  # 後端代碼（貼到 Google Apps Script）
│   └── ... (其他為 Node.js 備用代碼)
└── README.md
```

## 📊 分析引擎規則

- **Conflict**：涉及 war, military, attack 等關鍵字。
- **Tech**：涉及 AI, chip, semiconductor 等關鍵字。
- **Impact**：高影響 (🔴) 涉及戰爭或重大危機；中影響 (🟡) 涉及產業或地緣政治。

## 📰 支援的來源
Reuters, AP News, AFP, BBC, Bloomberg, CNN, The Guardian, DW, NYT, WSJ, FT, The Economist, WashPost.

## 📝 License
MIT
