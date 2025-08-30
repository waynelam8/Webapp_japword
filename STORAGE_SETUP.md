# Supabase Storage 設置指南

為了支持音頻文件上傳功能，你需要在 Supabase 中設置 Storage。

## 🚀 設置步驟

### 1. 創建 Storage Bucket

1. 登入你的 Supabase 項目
2. 在左側菜單中點擊 "Storage"
3. 點擊 "New bucket" 按鈕
4. 填寫以下信息：
   - **Name**: `vocab-audio`
   - **Public**: ✅ 勾選（這樣音頻文件可以被公開訪問）
   - **File size limit**: `10 MB`
   - **Allowed MIME types**: `audio/*`

### 2. 設置 Storage 策略

在 Storage 頁面中，點擊你剛創建的 `vocab-audio` bucket，然後：

1. 點擊 "Policies" 標籤
2. 點擊 "New Policy" 按鈕
3. 選擇 "Create a policy from scratch"
4. 填寫以下信息：

**策略名稱**: `Allow authenticated users to upload audio files`

**策略定義**:
```sql
-- 允許已認證用戶上傳音頻文件
CREATE POLICY "Allow authenticated users to upload audio files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'vocab-audio' 
  AND auth.role() = 'authenticated'
);

-- 允許所有人查看音頻文件（因為是公開的）
CREATE POLICY "Allow public access to audio files" ON storage.objects
FOR SELECT USING (bucket_id = 'vocab-audio');

-- 允許已認證用戶刪除自己的音頻文件（可選）
CREATE POLICY "Allow authenticated users to delete audio files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'vocab-audio' 
  AND auth.role() = 'authenticated'
);
```

### 3. 測試設置

設置完成後，你可以：

1. 在添加詞彙頁面上傳音頻文件
2. 系統會自動將文件存儲到 `vocab-audio` bucket
3. 生成公共URL並保存到數據庫的 `sound` 字段
4. 在詞彙列表中播放音頻

## 🔧 高級設置（可選）

### 文件類型限制

如果你想要更嚴格的文件類型控制，可以在 bucket 設置中指定具體的 MIME 類型：

```
audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/aac
```

### 文件大小限制

默認設置為 10MB，你可以根據需要調整。建議不要設置太大，以免影響上傳速度。

### 文件命名策略

系統會自動為上傳的文件生成唯一名稱：
- 格式：`{timestamp}_{randomString}.{extension}`
- 存儲路徑：`audio/{filename}`

## 🚨 注意事項

1. **公開訪問**：由於音頻文件需要被播放，bucket 必須設置為公開
2. **存儲成本**：音頻文件會佔用 Supabase 的存儲空間，注意免費計劃的限制
3. **文件安全**：雖然文件是公開的，但文件名是隨機生成的，提供了一定的安全性
4. **備份建議**：定期備份重要的音頻文件

## 🆘 常見問題

**Q: 上傳失敗怎麼辦？**
A: 檢查 bucket 名稱是否正確，策略是否設置正確，文件大小是否超限

**Q: 音頻無法播放？**
A: 確認 bucket 設置為公開，檢查 Storage 策略是否允許公開訪問

**Q: 如何刪除不需要的音頻文件？**
A: 在 Supabase Storage 頁面中手動刪除，或通過 API 調用刪除

## 📚 相關文檔

- [Supabase Storage 文檔](https://supabase.com/docs/guides/storage)
- [Storage 策略設置](https://supabase.com/docs/guides/storage/policies)
- [JavaScript 客戶端 API](https://supabase.com/docs/reference/javascript/storage-createbucket)
