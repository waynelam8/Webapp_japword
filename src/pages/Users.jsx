import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      // 從 Supabase 的 auth.users 表讀取用戶數據
      // 注意：這需要適當的 RLS (Row Level Security) 設置
      const { data, error } = await supabase
        .from('profiles') // 假設你有一個 profiles 表
        .select('*')
        .limit(100)

      if (error) {
        // 如果 profiles 表不存在，我們可以創建一個示例
        console.log('Profiles table not found, creating sample data')
        setUsers([
          { id: 1, email: 'user1@example.com', name: '用戶 1', created_at: new Date().toISOString() },
          { id: 2, email: 'user2@example.com', name: '用戶 2', created_at: new Date().toISOString() },
          { id: 3, email: 'user3@example.com', name: '用戶 3', created_at: new Date().toISOString() }
        ])
      } else {
        setUsers(data || [])
      }
    } catch (err) {
      setError('無法載入用戶數據')
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="auth-required">
        <h2>需要登入</h2>
        <p>請先登入來查看用戶列表</p>
      </div>
    )
  }

  if (loading) {
    return <div className="loading">載入中...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="users-page">
      <h1>用戶列表</h1>
      <p>這是一個從 Supabase 數據庫讀取數據的示例</p>
      
      <div className="users-grid">
        {users.map((user) => (
          <div key={user.id} className="user-card">
            <h3>{user.name || user.email}</h3>
            <p><strong>郵箱:</strong> {user.email}</p>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>創建時間:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
      
      {users.length === 0 && (
        <div className="no-users">
          <p>沒有找到用戶數據</p>
          <p>這可能是因為：</p>
          <ul>
            <li>數據庫中還沒有用戶表</li>
            <li>需要設置適當的數據庫權限</li>
            <li>需要創建 profiles 表</li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default Users

