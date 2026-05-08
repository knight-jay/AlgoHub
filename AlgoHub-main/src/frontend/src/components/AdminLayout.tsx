import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

const menuItems = [
  { path: '/admin/users', label: '用户管理' },
  { path: '/admin/algorithms', label: '算法管理' },
  { path: '/admin/categories', label: '分类管理' },
  { path: '/admin/resources', label: '资源管理' },
  { path: '/admin/reports', label: '举报管理' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')

  useEffect(() => {
    if (userInfo.role !== 'ADMIN' && userInfo.role !== 'MASTER') {
      navigate('/login')
    }
  }, [navigate, userInfo.role])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* 左侧菜单 */}
      <aside style={{
        width: 220,
        background: '#1e1e2f',
        color: '#ccc',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          padding: '20px 24px',
          fontSize: 18,
          fontWeight: 700,
          color: '#fff',
          borderBottom: '1px solid #2d2d3f',
        }}>
          AlgoHub 管理
        </div>
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'block',
                padding: '12px 24px',
                color: location.pathname === item.path ? '#fff' : '#aaa',
                background: location.pathname === item.path ? 'rgba(102,126,234,0.25)' : 'transparent',
                textDecoration: 'none',
                fontSize: 15,
                borderLeft: location.pathname === item.path ? '3px solid #667eea' : '3px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ padding: '16px 24px', borderTop: '1px solid #2d2d3f' }}>
          <Link to="/" style={{ color: '#aaa', fontSize: 14, textDecoration: 'none', display: 'block', marginBottom: 8 }}>
            ← 返回前台
          </Link>
          <button onClick={handleLogout} style={{
            background: 'transparent',
            color: '#e74c3c',
            fontSize: 14,
            padding: 0,
          }}>
            退出登录
          </button>
        </div>
      </aside>

      {/* 右侧内容 */}
      <main style={{ flex: 1, padding: '24px 32px', background: '#f5f6fa', overflow: 'auto' }}>
        <Outlet />
      </main>
    </div>
  )
}
