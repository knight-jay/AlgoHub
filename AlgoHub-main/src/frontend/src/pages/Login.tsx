import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { userApi } from '../api/user'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('STUDENT')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotPhone, setForgotPhone] = useState('')
  const [forgotNewPwd, setForgotNewPwd] = useState('')
  const [forgotConfirmPwd, setForgotConfirmPwd] = useState('')

  useEffect(() => {
    const savedUsername = localStorage.getItem('username')
    const savedRole = localStorage.getItem('role')
    if (savedUsername) {
      setUsername(savedUsername)
      setRememberMe(true)
      if (savedRole) setRole(savedRole)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await userApi.login({ username, password, rememberMe, role })
      if (res.data.code === 200) {
        const { token, userInfo } = res.data.data
        localStorage.setItem('token', token)
        localStorage.setItem('userInfo', JSON.stringify(userInfo))

        if (rememberMe) {
          localStorage.setItem('username', username)
          localStorage.setItem('role', userInfo.role)
        } else {
          localStorage.removeItem('username')
          localStorage.removeItem('role')
        }
        const from = (location.state as { from?: { pathname: string } })?.from?.pathname
        navigate(from || '/')
      } else {
        setError(res.data.msg)
      }
    } catch {
      setError('网络异常，请检查后端是否启动')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (forgotNewPwd !== forgotConfirmPwd) {
      setError('两次输入的密码不一致')
      return
    }

    setLoading(true)
    try {
      const res = await userApi.forgotPassword({ phone: forgotPhone, newPassword: forgotNewPwd, confirmPassword: forgotConfirmPwd })
      if (res.data.code === 200) {
        alert('密码重置成功！请使用新密码登录')
        setForgotMode(false)
        setForgotPhone('')
        setForgotNewPwd('')
        setForgotConfirmPwd('')
      } else {
        setError(res.data.msg)
      }
    } catch {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const styles = {
    body: {
      fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    card: {
      background: '#fff',
      width: '100%',
      maxWidth: 450,
      borderRadius: 16,
      boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
      padding: '40px 35px',
    },
    title: {
      textAlign: 'center' as const,
      fontSize: 26,
      color: '#333',
      marginBottom: 35,
      fontWeight: 600,
    },
    formGroup: { marginBottom: 25 },
    label: { display: 'block', marginBottom: 8, fontSize: 15, color: '#555', fontWeight: 500 },
    input: {
      width: '100%',
      height: 46,
      padding: '0 15px',
      border: '1px solid #e0e0e0',
      borderRadius: 8,
      fontSize: 15,
      outline: 'none',
    },
    optionGroup: { display: 'flex', alignItems: 'center', gap: 20, padding: '5px 0', marginBottom: 20 },
    optionItem: { display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 15, color: '#555' },
    btn: {
      width: '100%',
      height: 48,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: 8,
      fontSize: 16,
      fontWeight: 500,
      cursor: 'pointer',
      marginTop: 10,
    },
    error: { color: '#e74c3c', fontSize: 14, marginTop: 12, textAlign: 'center' as const },
    link: { textAlign: 'center' as const, marginTop: 25, fontSize: 14, color: '#666' },
  }

  if (forgotMode) {
    return (
      <div style={styles.body}>
        <div style={styles.card}>
          <h2 style={styles.title}>找回密码</h2>
          <form onSubmit={handleForgotPassword}>
            <div style={styles.formGroup}>
              <label style={styles.label}>注册手机号</label>
              <input
                style={styles.input}
                value={forgotPhone}
                onChange={(e) => setForgotPhone(e.target.value)}
                placeholder="请输入注册时使用的手机号"
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>新密码</label>
              <input
                style={styles.input}
                type="password"
                value={forgotNewPwd}
                onChange={(e) => setForgotNewPwd(e.target.value)}
                placeholder="请输入6-20位新密码"
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>确认新密码</label>
              <input
                style={styles.input}
                type="password"
                value={forgotConfirmPwd}
                onChange={(e) => setForgotConfirmPwd(e.target.value)}
                placeholder="请再次输入新密码"
                required
              />
            </div>
            <button style={styles.btn} type="submit" disabled={loading}>
              {loading ? '重置中...' : '重置密码'}
            </button>
            {error && <p style={styles.error}>{error}</p>}
          </form>
          <div style={styles.link}>
            <span style={{ cursor: 'pointer', color: '#667eea' }} onClick={() => { setForgotMode(false); setError('') }}>返回登录</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.body}>
      <div style={styles.card}>
        <h2 style={styles.title}>用户登录</h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>用户名</label>
            <input
              style={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入您的用户名"
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>密码</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>登录角色</label>
            <div style={styles.optionGroup}>
              <label style={styles.optionItem}>
                <input type="radio" name="role" value="STUDENT" checked={role === 'STUDENT'} onChange={() => setRole('STUDENT')} />
                学生
              </label>
              <label style={styles.optionItem}>
                <input type="radio" name="role" value="ADMIN" checked={role === 'ADMIN'} onChange={() => setRole('ADMIN')} />
                管理员
              </label>
              <label style={styles.optionItem}>
                <input type="radio" name="role" value="MASTER" checked={role === 'MASTER'} onChange={() => setRole('MASTER')} />
                群主
              </label>
            </div>
          </div>
          <div style={styles.optionGroup}>
            <label style={styles.optionItem}>
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              记住账号密码
            </label>
          </div>
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? '登录中...' : '立即登录'}
          </button>
          {error && <p style={styles.error}>{error}</p>}
        </form>
        <div style={styles.link}>
          还没有账号？<Link to="/register">立即注册</Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: 10, fontSize: 14, color: '#666' }}>
          <span style={{ cursor: 'pointer', color: '#667eea' }} onClick={() => setForgotMode(true)}>忘记密码？</span>
        </div>
      </div>
    </div>
  )
}
