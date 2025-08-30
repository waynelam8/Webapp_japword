import { createClient } from '@supabase/supabase-js'

// 你需要從 Supabase 項目設置中獲取這些值
// 1. 去 https://supabase.com 註冊帳號
// 2. 創建新項目
// 3. 在項目設置中找到 API 部分
// 4. 複製 URL 和 anon key

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

