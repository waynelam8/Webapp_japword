import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Users from './pages/Users'
import Login from './pages/Login'
import Vocabulary from './pages/Vocabulary'
import AddVocabulary from './pages/AddVocabulary'
import DeleteVocabulary from './pages/DeleteVocabulary'
import { AuthProvider } from './contexts/AuthContext'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/users" element={<Users />} />
              <Route path="/login" element={<Login />} />
              <Route path="/vocabulary" element={<Vocabulary />} />
              <Route path="/add-vocabulary" element={<AddVocabulary />} />
              <Route path="/delete-vocabulary" element={<DeleteVocabulary />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

