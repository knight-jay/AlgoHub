import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useMemo } from 'react'

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()

  // 每次路由变化都重新读取，解决登录后导航栏不刷新的问题
  const userInfo = useMemo(() => {
    const stored = localStorage.getItem('userInfo')
    return stored ? JSON.parse(stored) : null
  }, [location.pathname])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        padding: '0 32px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <Link to="/" style={{ color: '#fff', fontSize: 20, fontWeight: 700, textDecoration: 'none' }}>
            AlgoHub
          </Link>
          <nav style={{ display: 'flex', gap: 20 }}>
            <Link to="/" style={{ color: '#fff', fontSize: 15, textDecoration: 'none', opacity: 0.9 }}>
              算法知识库
            </Link>
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {userInfo ? (
            <>
              {userInfo.role === 'ADMIN' && (
                <Link to="/admin/users" style={{ color: '#ffd700', fontSize: 14, textDecoration: 'none' }}>
                  管理后台
                </Link>
              )}
              <Link to="/profile" style={{ color: '#fff', fontSize: 14, textDecoration: 'none' }}>
                {userInfo.username}
              </Link>
              <button onClick={handleLogout} style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                padding: '6px 16px',
                borderRadius: 6,
                fontSize: 14,
              }}>
                退出
              </button>
            </>
          ) : (
            <Link to="/login" style={{
              background: 'rgba(255,255,255,0.2)',
              color: '#fff',
              padding: '6px 20px',
              borderRadius: 6,
              fontSize: 14,
              textDecoration: 'none',
            }}>
              登录
            </Link>
          )}
        </div>
      </header>
      <main style={{ flex: 1, padding: '24px 32px', maxWidth: 1200, width: '100%', margin: '0 auto' }}>
        <Outlet />
      </main>
    </div>
  )
}
