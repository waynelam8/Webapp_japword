import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          Supabase WebApp
        </Link>
        <div className="nav-menu">
          <Link to="/" className="nav-link">
            首頁
          </Link>
          <Link to="/users" className="nav-link">
            用戶列表
          </Link>
          <Link to="/vocabulary" className="nav-link">
            詞彙
          </Link>
                      {user && (
              <>
                <Link to="/add-vocabulary" className="nav-link">
                  ➕ 添加詞彙
                </Link>
                <Link to="/delete-vocabulary" className="nav-link">
                  🗑️ 刪除詞彙
                </Link>
              </>
            )}
          {user ? (
            <>
              <span className="nav-user">歡迎, {user.email}</span>
              <button onClick={handleSignOut} className="nav-button">
                登出
              </button>
            </>
          ) : (
            <Link to="/login" className="nav-link">
              登入
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar

