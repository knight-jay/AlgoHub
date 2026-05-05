import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { userApi } from '../api/user'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '', phone: '', nickname: '', role: 'STUDENT' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    setLoading(true)
    try {
      const res = await userApi.register(form)
      if (res.data.code === 200) {
        alert('注册成功！即将跳转到登录页')
        navigate('/login')
      } else {
        setError(res.data.msg)
      }
    } catch {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value })

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
    title: { textAlign: 'center' as const, fontSize: 26, color: '#333', marginBottom: 35, fontWeight: 600 },
    formGroup: { marginBottom: 25 },
    label: { display: 'block', marginBottom: 8, fontSize: 15, color: '#555', fontWeight: 500 },
    input: { width: '100%', height: 46, padding: '0 15px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 15, outline: 'none' },
    btn: {
      width: '100%', height: 48,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 500, cursor: 'pointer', marginTop: 10,
    },
    error: { color: '#e74c3c', fontSize: 14, marginTop: 12, textAlign: 'center' as const },
    link: { textAlign: 'center' as const, marginTop: 25, fontSize: 14, color: '#666' },
  }

  return (
    <div style={styles.body}>
      <div style={styles.card}>
        <h2 style={styles.title}>用户注册</h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>用户名</label>
            <input style={styles.input} value={form.username} onChange={update('username')} placeholder="请输入3-20位用户名" required />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>密码</label>
            <input style={styles.input} type="password" value={form.password} onChange={update('password')} placeholder="请输入6-20位密码" required />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>确认密码</label>
            <input style={styles.input} type="password" value={form.confirmPassword} onChange={update('confirmPassword')} placeholder="请再次输入密码" required />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>手机号</label>
            <input style={styles.input} value={form.phone} onChange={update('phone')} placeholder="请输入手机号" required />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>昵称</label>
            <input style={styles.input} value={form.nickname} onChange={update('nickname')} placeholder="请输入昵称" required />
          </div>
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? '注册中...' : '立即注册'}
          </button>
          {error && <p style={styles.error}>{error}</p>}
        </form>
        <div style={styles.link}>
          已有账号？<Link to="/login">去登录</Link>
        </div>
      </div>
    </div>
  )
}
