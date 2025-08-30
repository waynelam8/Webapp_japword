import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const AddVocabulary = () => {
  const [formData, setFormData] = useState({
    word: '',
    meaning: '',
    cat: '',
    sound: ''
  })
  const [audioUrl, setAudioUrl] = useState('')
  const [audioFile, setAudioFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const { user } = useAuth()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('vocab')
        .select('cat')
        .order('cat', { ascending: true })
      
      if (error) {
        console.error('獲取分類時發生錯誤:', error)
        return
      }
      
      // 去重並排序分類
      const uniqueCategories = [...new Set(data.map(item => item.cat))].sort()
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('獲取分類時發生錯誤:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // 檢查文件類型
      if (!file.type.startsWith('audio/')) {
        setMessage({
          type: 'error',
          text: '請選擇音頻文件（MP3, WAV, OGG等）'
        })
        return
      }
      
      // 檢查文件大小（限制為10MB）
      if (file.size > 10 * 1024 * 1024) {
        setMessage({
          type: 'error',
          text: '文件大小不能超過10MB'
        })
        return
      }
      
      setAudioFile(file)
      setMessage({ type: '', text: '' })
    }
  }

  const uploadAudioToStorage = async (file) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `audio/${fileName}`

      const { data, error } = await supabase.storage
        .from('vocab-audio')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        // 檢查是否是 bucket 不存在的錯誤
        if (error.message.includes('Bucket not found') || error.message.includes('bucket')) {
          throw new Error('Storage bucket 未設置，請先按照 STORAGE_SETUP.md 的說明創建 vocab-audio bucket')
        }
        throw error
      }

      // 獲取公共URL
      const { data: urlData } = supabase.storage
        .from('vocab-audio')
        .getPublicUrl(filePath)

      return urlData.publicUrl
    } catch (error) {
      console.error('上傳音頻文件時發生錯誤:', error)
      throw new Error(`上傳音頻文件失敗: ${error.message}`)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // 驗證必填字段
    if (!formData.word.trim() || !formData.meaning.trim() || !formData.cat.trim()) {
      setMessage({
        type: 'error',
        text: '請填寫詞彙、含義和分類（必填）'
      })
      return
    }

    // 驗證音頻文件
    if (!audioFile) {
      setMessage({
        type: 'error',
        text: '請選擇音頻文件'
      })
      return
    }

    setLoading(true)
    setMessage({ type: '', text: '' })
    setUploadProgress(0)

    try {
      // 上傳音頻文件到Storage
      setMessage({
        type: 'info',
        text: '正在上傳音頻文件...'
      })
      
      const uploadedUrl = await uploadAudioToStorage(audioFile)
      setUploadProgress(100)
      
      // 自動填充音頻URL到表單
      setFormData(prev => ({ ...prev, sound: uploadedUrl }))
      
      setMessage({
        type: 'success',
        text: '音頻文件上傳成功！'
      })

      // 添加詞彙到數據庫
      const { data, error } = await supabase
        .from('vocab')
        .insert([
          {
            word: formData.word.trim(),
            meaning: formData.meaning.trim(),
            cat: formData.cat.trim(),
            sound: uploadedUrl, // 使用上傳後的音頻URL
            created_at: new Date().toISOString()
          }
        ])
        .select()

      if (error) {
        console.error('添加詞彙時發生錯誤:', error)
        throw error
      }

      console.log('成功添加詞彙:', data)
      
      // 清空表單和文件
      setFormData({
        word: '',
        meaning: '',
        cat: '',
        sound: ''
      })
      setAudioFile(null)
      setUploadProgress(0)

      // 如果新分類不在列表中，重新獲取分類
      if (!categories.includes(formData.cat.trim())) {
        fetchCategories()
      }

      setMessage({
        type: 'success',
        text: `成功添加詞彙 "${formData.word.trim()}" 到分類 "${formData.cat.trim()}"${audioUrl ? '，並上傳了音頻文件' : ''}`
      })

    } catch (error) {
      console.error('添加詞彙時發生錯誤:', error)
      setMessage({
        type: 'error',
        text: `添加詞彙失敗: ${error.message}`
      })
    } finally {
      setLoading(false)
    }
  }

  const addNewCategory = () => {
    const newCategory = prompt('請輸入新的分類名稱：')
    if (newCategory && newCategory.trim()) {
      const trimmedCategory = newCategory.trim()
      setFormData(prev => ({
        ...prev,
        cat: trimmedCategory
      }))
      
      // 立即將新分類添加到分類列表中
      if (!categories.includes(trimmedCategory)) {
        setCategories(prev => [...prev, trimmedCategory].sort())
      }
    }
  }

  const clearForm = () => {
    setFormData({
      word: '',
      meaning: '',
      cat: '',
      sound: ''
    })
    setAudioFile(null)
    setAudioUrl('')
    setUploadProgress(0)
    setMessage({ type: '', text: '' })
  }

  if (!user) {
    return (
      <div className="auth-required">
        <h2>需要登入</h2>
        <p>請先登入來添加詞彙</p>
      </div>
    )
  }

  return (
    <div className="add-vocabulary-page">
      <h1>添加新詞彙</h1>
      <p>填寫以下信息來添加新的詞彙項目到數據庫</p>

      <div className="add-vocabulary-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="word">詞彙 *</label>
            <input
              type="text"
              id="word"
              name="word"
              value={formData.word}
              onChange={handleInputChange}
              placeholder="輸入詞彙..."
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="meaning">含義 *</label>
            <textarea
              id="meaning"
              name="meaning"
              value={formData.meaning}
              onChange={handleInputChange}
              placeholder="輸入詞彙的含義..."
              required
              rows="3"
              className="form-textarea"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cat">分類 *</label>
            <div className="category-input-group">
              <select
                id="cat"
                name="cat"
                value={formData.cat}
                onChange={handleInputChange}
                required
                className="form-select"
              >
                <option value="">選擇分類</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addNewCategory}
                className="add-category-button"
              >
                ➕ 新分類
              </button>
            </div>
          </div>

                     <div className="form-group">
             <label htmlFor="audio">音頻文件（可選）</label>
             <div className="audio-upload-section">
               <label htmlFor="audio" className="file-upload-label">
                 <div className="upload-placeholder">
                   <span>📁 點擊選擇音頻文件</span>
                   <small>支持 MP3, WAV, OGG 等格式，最大 10MB</small>
                   <small>或拖拽文件到此區域</small>
                 </div>
               </label>
               <input
                 type="file"
                 id="audio"
                 accept="audio/*"
                 onChange={handleFileChange}
                 className="file-input"
               />
               {audioFile && (
                 <div className="file-info">
                   <div className="selected-file">
                     <span className="file-name">📁 {audioFile.name}</span>
                     <span className="file-size">({(audioFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                     <button
                       type="button"
                       onClick={() => setAudioFile(null)}
                       className="remove-file-button"
                     >
                       ✕
                     </button>
                   </div>
                 </div>
               )}
             </div>
             {uploadProgress > 0 && uploadProgress < 100 && (
               <div className="upload-progress">
                 <div className="progress-bar">
                   <div 
                     className="progress-fill" 
                     style={{ width: `${uploadProgress}%` }}
                   ></div>
                 </div>
                 <span className="progress-text">{uploadProgress}%</span>
               </div>
             )}
           </div>

                       <div className="form-group">
              <label htmlFor="sound">音頻URL</label>
              <div className="url-display">
                {formData.sound ? (
                  <div className="url-info">
                    <span className="url-text">{formData.sound}</span>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(formData.sound)}
                      className="copy-url-button"
                      title="複製URL到剪貼板"
                    >
                      📋 複製
                    </button>
                  </div>
                ) : (
                  <div className="url-placeholder">
                    <span>上傳音頻文件後，URL將自動顯示在這裡</span>
                  </div>
                )}
              </div>
              <small className="form-help">
                音頻文件上傳成功後，系統會自動獲取並顯示音頻URL
              </small>
            </div>

          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? '添加中...' : '➕ 添加詞彙'}
            </button>
            
            <button
              type="button"
              onClick={clearForm}
              className="reset-button"
            >
              🔄 重置表單
            </button>
          </div>
        </form>
      </div>

      <div className="form-tips">
        <h3>💡 使用提示</h3>
        <ul>
          <li><strong>詞彙</strong>：輸入要學習的單詞或短語</li>
          <li><strong>含義</strong>：詳細描述詞彙的意思和用法</li>
          <li><strong>分類</strong>：選擇現有分類或創建新分類來組織詞彙</li>
          <li><strong>音頻</strong>：上傳音頻文件（MP3, WAV, OGG），系統會自動存儲並生成播放鏈接</li>
        </ul>
        <div className="storage-notice">
          <h4>⚠️ 音頻上傳注意事項</h4>
          <p>如果遇到音頻上傳錯誤，請按照 <code>STORAGE_SETUP.md</code> 文件的說明設置 Supabase Storage。</p>
        </div>
      </div>
    </div>
  )
}

export default AddVocabulary
