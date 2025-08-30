import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const Vocabulary = () => {
  const [vocabulary, setVocabulary] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedWord, setSelectedWord] = useState(null)
  const [viewMode, setViewMode] = useState('category') // 'category', 'word', 'detail'
  const [searchKeyword, setSearchKeyword] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentAudio, setCurrentAudio] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
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
      
      const uniqueCategories = [...new Set(data.map(item => item.cat))].sort()
      setCategories(uniqueCategories)
      setLoading(false)
    } catch (error) {
      console.error('獲取分類時發生錯誤:', error)
      setLoading(false)
    }
  }

  const fetchVocabularyByCategory = async (category) => {
    try {
      setLoading(true)
      setError('')
      
      const { data, error } = await supabase
        .from('vocab')
        .select('*')
        .eq('cat', category)
        .order('word', { ascending: true })
      
      if (error) {
        throw error
      }
      
      setVocabulary(data || [])
    } catch (error) {
      console.error(`獲取分類 "${category}" 詞彙數據時發生錯誤:`, error)
      setError(`無法載入分類 "${category}" 的詞彙數據: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const searchVocabulary = async (keyword) => {
    if (!keyword.trim()) {
      if (selectedCategory) {
        fetchVocabularyByCategory(selectedCategory)
      }
      return
    }

    try {
      setLoading(true)
      setError('')
      
      let query = supabase
        .from('vocab')
        .select('*')
        .or(`word.ilike.%${keyword}%,meaning.ilike.%${keyword}%`)
        .order('word', { ascending: true })
      
      if (selectedCategory) {
        query = query.eq('cat', selectedCategory)
      }
      
      const { data, error } = await query
      
      if (error) {
        throw error
      }
      
      setVocabulary(data || [])
    } catch (error) {
      console.error(`搜索時發生錯誤:`, error)
      setError(`搜索時發生錯誤: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category)
    setSelectedWord(null)
    setSearchKeyword('')
    setViewMode('word')
    await fetchVocabularyByCategory(category)
  }

  const handleWordClick = (wordItem) => {
    setSelectedWord(wordItem)
    setViewMode('detail')
  }

  const handleBackToWords = () => {
    setSelectedWord(null)
    setViewMode('word')
  }

  const handleBackToCategories = () => {
    setSelectedCategory(null)
    setSelectedWord(null)
    setSearchKeyword('')
    setVocabulary([])
    setViewMode('category')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    searchVocabulary(searchKeyword)
  }

  const handleSearchInputChange = (e) => {
    const value = e.target.value
    setSearchKeyword(value)
    
    if (!value.trim() && selectedCategory) {
      fetchVocabularyByCategory(selectedCategory)
    }
  }

  const playAudio = (soundUrl) => {
    if (!soundUrl) {
      alert('沒有音頻文件')
      return
    }

    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      setIsPaused(false)
    }

    const audio = new Audio(soundUrl)
    
    audio.addEventListener('play', () => {
      setIsPlaying(true)
      setIsPaused(false)
    })
    audio.addEventListener('pause', () => {
      setIsPlaying(false)
      if (audio.currentTime > 0 && audio.currentTime < audio.duration) {
        setIsPaused(true)
      }
    })
    audio.addEventListener('ended', () => {
      setIsPlaying(false)
      setIsPaused(false)
      setCurrentAudio(null)
    })
    audio.addEventListener('error', (error) => {
      console.error('Error playing audio:', error)
      alert('播放音頻時發生錯誤')
      setIsPlaying(false)
      setIsPaused(false)
      setCurrentAudio(null)
    })

    setCurrentAudio(audio)
    audio.play().catch(error => {
      console.error('Error playing audio:', error)
      alert('播放音頻時發生錯誤')
      setIsPlaying(false)
      setCurrentAudio(null)
    })
  }

  const pauseAudio = () => {
    if (currentAudio && isPlaying) {
      currentAudio.pause()
      setIsPaused(true)
    }
  }

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      setIsPlaying(false)
      setIsPaused(false)
      setCurrentAudio(null)
    }
  }

  const resumeAudio = () => {
    if (currentAudio && isPaused) {
      currentAudio.play().catch(error => {
        console.error('Error resuming audio:', error)
        alert('恢復播放音頻時發生錯誤')
      })
    }
  }

  if (!user) {
    return (
      <div className="auth-required">
        <h2>需要登入</h2>
        <p>請先登入來查看詞彙</p>
      </div>
    )
  }

  // 第三層：詞彙詳情頁面
  if (viewMode === 'detail' && selectedWord) {
    return (
      <div className="vocabulary-page">
        <div className="page-header">
          <button onClick={handleBackToWords} className="back-button">
            ← 返回詞彙列表
          </button>
          <h1>詞彙詳情</h1>
        </div>
        
        <div className="vocabulary-detail">
          <div className="detail-card">
            <h2 className="word-title">{selectedWord.word}</h2>
            <p className="meaning-text">{selectedWord.meaning}</p>
            <div className="category-badge">{selectedWord.cat}</div>
            
            {selectedWord.sound && (
              <div className="audio-section">
                <div className="audio-controls">
                  {!currentAudio || (!isPlaying && !isPaused) ? (
                    <button
                      onClick={() => playAudio(selectedWord.sound)}
                      className="play-button"
                      title="播放發音"
                    >
                      🔊 播放
                    </button>
                  ) : isPlaying ? (
                    <button
                      onClick={pauseAudio}
                      className="pause-button"
                      title="暫停播放"
                    >
                      ⏸️ 暫停
                    </button>
                  ) : isPaused ? (
                    <button
                      onClick={resumeAudio}
                      className="resume-button"
                      title="從暫停位置繼續播放"
                    >
                      ▶️ 繼續
                    </button>
                  ) : null}

                  {currentAudio && (
                    <button
                      onClick={stopAudio}
                      className="stop-button"
                      title="停止播放並重置到開始位置"
                    >
                      ⏹️ 停止
                    </button>
                  )}
                </div>
                <span className="audio-info">音頻文件可用</span>
              </div>
            )}
            
            <div className="creation-date">
              創建時間: {new Date(selectedWord.created_at).toLocaleDateString('zh-TW')}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 第二層：詞彙列表頁面（只顯示 word）
  if (viewMode === 'word' && selectedCategory) {
    return (
      <div className="vocabulary-page">
        <div className="page-header">
          <button onClick={handleBackToCategories} className="back-button">
            ← 返回分類選擇
          </button>
          <h1>{selectedCategory} - 詞彙列表</h1>
        </div>
        
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <input
                type="text"
                value={searchKeyword}
                onChange={handleSearchInputChange}
                placeholder="搜索詞彙或含義..."
                className="search-input"
              />
              <button type="submit" className="search-button">
                🔍 搜索
              </button>
            </div>
          </form>
          <div className="search-info">
            在 "{selectedCategory}" 分類中搜索
          </div>
        </div>

        {loading ? (
          <div className="loading">載入中...</div>
        ) : vocabulary.length > 0 ? (
          <div className="vocabulary-list">
            {vocabulary.map((item) => (
              <div
                key={item.id}
                className="vocabulary-card word-card"
                onClick={() => handleWordClick(item)}
              >
                <div className="word-content">
                  <h3 className="word-text">{item.word}</h3>
                  <div className="word-meta">
                    <span className="category-tag">{item.cat}</span>
                    {item.sound && <span className="audio-indicator">🔊</span>}
                  </div>
                </div>
                <div className="card-arrow">→</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            {searchKeyword ? `在 "${selectedCategory}" 中沒有找到包含 "${searchKeyword}" 的結果` : `"${selectedCategory}" 分類中沒有詞彙項目`}
          </div>
        )}
      </div>
    )
  }

  // 第一層：分類選擇頁面
  return (
    <div className="vocabulary-page">
      <h1>詞彙學習</h1>
      <p>選擇一個分類開始學習詞彙</p>
      
      <div className="category-selector">
        <h3>選擇分類</h3>
        <div className="category-buttons">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className="category-button"
            >
              {category}
            </button>
          ))}
        </div>
        <div className="category-info">
          點擊分類按鈕查看該分類下的詞彙
        </div>
      </div>
    </div>
  )
}

export default Vocabulary
