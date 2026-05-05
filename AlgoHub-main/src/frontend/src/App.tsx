import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import AlgorithmDetail from './pages/AlgorithmDetail'
import Profile from './pages/Profile'
import UserManagement from './pages/admin/UserManagement'
import AlgorithmManagement from './pages/admin/AlgorithmManagement'
import CategoryManagement from './pages/admin/CategoryManagement'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Home />} />
        <Route path="/algorithm/:id" element={<AlgorithmDetail />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/algorithms" element={<AlgorithmManagement />} />
        <Route path="/admin/categories" element={<CategoryManagement />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
