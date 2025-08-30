# Supabase WebApp

這是一個使用 React 和 Supabase 構建的現代 web 應用程序，包含完整的用戶認證系統和數據庫連接功能。

## 🚀 功能特色

- ✅ 用戶註冊和登入系統
- ✅ 連接到 Supabase 數據庫
- ✅ 響應式設計，支持移動設備
- ✅ 現代 React 架構 (React 18 + Hooks)
- ✅ 使用 Vite 進行快速開發
- ✅ 完整的路由系統
- ✅ 美觀的 UI 設計

## 📋 前置要求

在開始之前，你需要：

1. **Node.js** (版本 16 或更高)
2. **Supabase 帳號** (免費註冊)

## 🛠️ 安裝步驟

### 1. 安裝依賴

```bash
npm install
```

### 2. 設置 Supabase

#### 2.1 創建 Supabase 項目

1. 前往 [https://supabase.com](https://supabase.com)
2. 註冊帳號並登入
3. 點擊 "New Project"
4. 選擇組織並輸入項目名稱
5. 設置數據庫密碼
6. 選擇地區（建議選擇離你最近的）
7. 等待項目創建完成

#### 2.2 獲取 API 憑證

1. 在項目儀表板中，點擊左側菜單的 "Settings" → "API"
2. 複製以下信息：
   - **Project URL** (例如: `https://your-project.supabase.co`)
   - **anon public** key

#### 2.3 創建環境變量文件

在項目根目錄創建 `.env` 文件：

```bash
# 複製 env.example 文件並重命名為 .env
cp env.example .env
```

然後編輯 `.env` 文件，填入你的 Supabase 憑證：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. 設置數據庫表（可選）

如果你想要存儲用戶資料，可以在 Supabase SQL 編輯器中運行以下 SQL：

```sql
-- 創建 profiles 表
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- 啟用 Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 創建策略：用戶只能查看自己的資料
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- 創建策略：用戶可以更新自己的資料
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 創建策略：用戶可以插入自己的資料
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## 🚀 運行項目

### 開發模式

```bash
npm run dev
```

這會在 `http://localhost:3000` 啟動開發服務器。

### 構建生產版本

```bash
npm run build
```

### 預覽生產版本

```bash
npm run preview
```

## 📁 項目結構

```
supabase-webapp/
├── src/
│   ├── components/          # React 組件
│   │   └── Navbar.jsx      # 導航欄組件
│   ├── contexts/            # React Context
│   │   └── AuthContext.jsx # 認證上下文
│   ├── lib/                 # 工具庫
│   │   └── supabase.js     # Supabase 客戶端配置
│   ├── pages/               # 頁面組件
│   │   ├── Home.jsx        # 首頁
│   │   ├── Login.jsx       # 登入頁面
│   │   └── Users.jsx       # 用戶列表頁面
│   ├── App.jsx             # 主要應用組件
│   ├── main.jsx            # 應用入口點
│   ├── App.css             # 主要樣式
│   └── index.css           # 全局樣式
├── .env                     # 環境變量（需要創建）
├── env.example             # 環境變量模板
├── index.html              # HTML 模板
├── package.json            # 項目配置
├── vite.config.js          # Vite 配置
└── README.md               # 項目說明
```

## 🔧 自定義和擴展

### 添加新頁面

1. 在 `src/pages/` 目錄創建新的頁面組件
2. 在 `src/App.jsx` 中添加新的路由
3. 在導航欄中添加鏈接

### 添加新功能

1. 在 `src/components/` 目錄創建新的組件
2. 在 `src/contexts/` 目錄創建新的上下文（如果需要狀態管理）
3. 在 `src/lib/` 目錄添加新的工具函數

### 修改樣式

- 主要樣式在 `src/App.css`
- 全局樣式在 `src/index.css`
- 可以創建組件特定的 CSS 文件

## 🐛 常見問題

### Q: 無法連接到 Supabase？
A: 檢查 `.env` 文件中的 URL 和 API key 是否正確

### Q: 用戶註冊後無法登入？
A: 檢查 Supabase 項目設置中的 "Authentication" → "Settings" → "Enable email confirmations" 是否已關閉

### Q: 無法讀取數據庫數據？
A: 檢查 Row Level Security (RLS) 設置和數據庫權限

## 📚 學習資源

- [React 官方文檔](https://react.dev/)
- [Supabase 文檔](https://supabase.com/docs)
- [Vite 文檔](https://vitejs.dev/)

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 許可證

MIT License

