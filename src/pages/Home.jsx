import React from 'react'
import { useAuth } from '../contexts/AuthContext'

const Home = () => {
  const { user } = useAuth()

  return (
    <div className="home">
      <h1>歡迎來到 Supabase WebApp</h1>
      <p>這是一個使用 React 和 Supabase 構建的現代 web 應用</p>
      
      {user ? (
        <div className="user-info">
          <h2>你已登入</h2>
          <p>用戶郵箱: {user.email}</p>
          <p>用戶 ID: {user.id}</p>
        </div>
      ) : (
        <div className="login-prompt">
          <h2>請先登入</h2>
          <p>點擊右上角的"登入"按鈕來開始使用應用</p>
        </div>
      )}

      <div className="features">
        <h2>功能特色</h2>
        <ul>
          <li>✅ 用戶認證系統</li>
          <li>✅ 連接到 Supabase 數據庫</li>
          <li>✅ 響應式設計</li>
          <li>✅ 現代 React 架構</li>
        </ul>
      </div>
    </div>
  )
}

export default Home

