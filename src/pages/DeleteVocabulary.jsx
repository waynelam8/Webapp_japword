import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const DeleteVocabulary = () => {
  const [vocabulary, setVocabulary] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    fetchCategories()
    fetchAllVocabulary()
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

  const fetchAllVocabulary = async () => {
    try {
      setLoading(true)
      setError('')
      
      let query = supabase
        .from('vocab')
        .select('*')
        .order('created_at', { ascending: false })
      
      // 如果選擇了分類，則過濾
      if (selectedCategory) {
        query = query.eq('cat', selectedCategory)
      }
      
      // 如果有搜索關鍵字，則搜索
      if (searchKeyword.trim()) {
        query = query.or(`word.ilike.%${searchKeyword}%,meaning.ilike.%${searchKeyword}%`)
      }
      
      const { data, error } = await query
      
      if (error) {
        console.error('獲取詞彙數據時發生錯誤:', error)
        throw error
      }
      
      setVocabulary(data || [])
    } catch (error) {
      console.error('獲取詞彙數據時發生錯誤:', error)
      setError(`無法載入詞彙數據: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchAllVocabulary()
  }

  const handleSearchInputChange = (e) => {
    setSearchKeyword(e.target.value)
  }

  const handleDeleteClick = (item) => {
    setDeleteConfirm(item)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return

    try {
      setDeleting(true)
      
      console.log('開始刪除詞彙項目:', deleteConfirm.id)
      
      const { data, error } = await supabase
        .from('vocab')
        .delete()
        .eq('id', deleteConfirm.id)
        .select()
      
      if (error) {
        console.error('Supabase 刪除錯誤:', error)
        throw error
      }
      
      console.log('刪除結果:', data)
      
      // 刪除成功，從列表中移除該項目
      setVocabulary(prev => prev.filter(item => item.id !== deleteConfirm.id))
      setDeleteConfirm(null)
      
      // 顯示成功消息
      alert(`成功刪除詞彙 "${deleteConfirm.word}"`)
      
      // 驗證刪除是否真的成功（可選）
      setTimeout(async () => {
        try {
          const { data: verifyData, error: verifyError } = await supabase
            .from('vocab')
            .select('id')
            .eq('id', deleteConfirm.id)
          
          if (verifyError) {
            console.error('驗證刪除時發生錯誤:', verifyError)
          } else if (verifyData && verifyData.length > 0) {
            console.warn('警告：項目可能沒有真正從數據庫中刪除')
            alert('警告：項目可能沒有真正從數據庫中刪除，請檢查 RLS 策略')
          } else {
            console.log('刪除驗證成功：項目已從數據庫中移除')
          }
        } catch (verifyError) {
          console.error('驗證刪除時發生錯誤:', verifyError)
        }
      }, 1000)
      
    } catch (error) {
      console.error('刪除詞彙時發生錯誤:', error)
      
      // 更詳細的錯誤信息
      let errorMessage = '刪除詞彙失敗'
      if (error.message) {
        errorMessage += `: ${error.message}`
      }
      if (error.details) {
        errorMessage += `\n詳細信息: ${error.details}`
      }
      if (error.hint) {
        errorMessage += `\n提示: ${error.hint}`
      }
      
      alert(errorMessage)
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteConfirm(null)
  }

  const clearFilters = () => {
    setSelectedCategory('')
    setSearchKeyword('')
    fetchAllVocabulary()
  }

  if (!user) {
    return (
      <div className="auth-required">
        <h2>需要登入</h2>
        <p>請先登入來管理詞彙</p>
      </div>
    )
  }

  return (
    <div className="delete-vocabulary-page">
      <h1>🗑️ 刪除詞彙項目</h1>
      <p className="warning-text">⚠️ 注意：刪除操作無法撤銷，請謹慎操作！</p>
      
      {/* 過濾和搜索區域 */}
      <div className="filters-section">
        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="category-filter">分類過濾：</label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="filter-select"
            >
              <option value="">所有分類</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <input
                type="text"
                placeholder="搜索詞彙或含義..."
                value={searchKeyword}
                onChange={handleSearchInputChange}
                className="search-input"
              />
              <button type="submit" className="search-button">
                🔍 搜索
              </button>
            </div>
          </form>
          
          <button onClick={clearFilters} className="clear-filters-button">
            🗂️ 清除過濾
          </button>
        </div>
        
        <button onClick={fetchAllVocabulary} className="refresh-button">
          🔄 刷新數據
        </button>
      </div>

      {/* 詞彙列表 */}
      <div className="vocabulary-list-section">
        {loading ? (
          <div className="loading">載入中...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : vocabulary.length === 0 ? (
          <div className="no-vocabulary">
            <p>沒有找到符合條件的詞彙項目</p>
            <p>請嘗試調整過濾條件或搜索關鍵字</p>
          </div>
        ) : (
          <>
            <div className="vocabulary-stats">
              <p>找到 <strong>{vocabulary.length}</strong> 個詞彙項目</p>
              {selectedCategory && <p>分類：<strong>{selectedCategory}</strong></p>}
              {searchKeyword && <p>搜索關鍵字：<strong>"{searchKeyword}"</strong></p>}
            </div>
            
            <div className="vocabulary-table">
              <table>
                <thead>
                  <tr>
                    <th>詞彙</th>
                    <th>含義</th>
                    <th>分類</th>
                    <th>音頻</th>
                    <th>創建時間</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {vocabulary.map((item) => (
                    <tr key={item.id} className="vocabulary-row">
                      <td className="word-cell">
                        <strong>{item.word}</strong>
                        <small className="item-id">ID: {item.id}</small>
                      </td>
                      <td className="meaning-cell">{item.meaning}</td>
                      <td className="category-cell">
                        <span className="category-badge">{item.cat}</span>
                      </td>
                      <td className="audio-cell">
                        {item.sound ? (
                          <span className="audio-available">✅ 有音頻</span>
                        ) : (
                          <span className="no-audio">❌ 無音頻</span>
                        )}
                      </td>
                      <td className="date-cell">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="actions-cell">
                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="delete-button"
                          title="刪除此詞彙項目"
                        >
                          🗑️ 刪除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* 刪除確認對話框 */}
      {deleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <h3>⚠️ 確認刪除</h3>
            <div className="confirm-content">
              <p>你確定要刪除以下詞彙項目嗎？</p>
              <div className="item-details">
                <p><strong>詞彙：</strong>{deleteConfirm.word}</p>
                <p><strong>含義：</strong>{deleteConfirm.meaning}</p>
                <p><strong>分類：</strong>{deleteConfirm.cat}</p>
                <p><strong>ID：</strong>{deleteConfirm.id}</p>
              </div>
              <p className="warning-text">⚠️ 此操作無法撤銷！</p>
            </div>
            <div className="confirm-actions">
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="confirm-delete-button"
              >
                {deleting ? '刪除中...' : '🗑️ 確認刪除'}
              </button>
              <button
                onClick={handleDeleteCancel}
                disabled={deleting}
                className="cancel-button"
              >
                ❌ 取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DeleteVocabulary
