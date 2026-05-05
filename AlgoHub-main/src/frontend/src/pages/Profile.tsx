import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userApi } from '../api/user'
import type { User } from '../types'

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // 编辑个人信息
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ phone: '', nickname: '', avatar: '', intro: '' })
  const [editMsg, setEditMsg] = useState('')

  // 修改密码
  const [pwdForm, setPwdForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [pwdMsg, setPwdMsg] = useState('')

  useEffect(() => {
    userApi.getProfile().then((res) => {
      if (res.data.code === 200) {
        setUser(res.data.data)
      }
    }).finally(() => setLoading(false))
  }, [])

  const startEdit = () => {
    if (!user) return
    setEditForm({
      phone: user.phone || '',
      nickname: user.nickname || '',
      avatar: user.avatar || '',
      intro: user.intro || '',
    })
    setEditing(true)
    setEditMsg('')
  }

  const cancelEdit = () => {
    setEditing(false)
    setEditMsg('')
  }

  const submitEdit = async () => {
    try {
      const res = await userApi.updateProfile(editForm)
      if (res.data.code === 200) {
        setEditMsg('保存成功')
        setEditing(false)
        // 刷新
        const profileRes = await userApi.getProfile()
        if (profileRes.data.code === 200) setUser(profileRes.data.data)
      } else {
        setEditMsg(res.data.msg)
      }
    } catch {
      setEditMsg('保存失败')
    }
  }

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdMsg('两次输入的新密码不一致')
      return
    }
    try {
      const res = await userApi.changePassword(pwdForm)
      if (res.data.code === 200) {
        setPwdMsg('密码修改成功')
        setPwdForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        setPwdMsg(res.data.msg)
      }
    } catch {
      setPwdMsg('修改失败')
    }
  }

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [loading, user, navigate])

  if (loading) return <div className="loading">加载中...</div>
  if (!user) return null

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* 个人信息卡片 */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>个人信息</h2>
          {!editing && (
            <button className="btn btn-primary btn-sm" onClick={startEdit}>编辑</button>
          )}
        </div>

        {editing ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>手机号</label>
                <input className="form-input" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>昵称</label>
                <input className="form-input" value={editForm.nickname} onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>头像地址</label>
                <input className="form-input" value={editForm.avatar} onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })} />
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>个人简介</label>
              <textarea className="form-input" rows={3} value={editForm.intro} onChange={(e) => setEditForm({ ...editForm, intro: e.target.value })} />
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
              <button className="btn btn-primary btn-sm" onClick={submitEdit}>保存</button>
              <button className="btn btn-secondary btn-sm" onClick={cancelEdit}>取消</button>
            </div>
            {editMsg && <p style={{ marginTop: 10, fontSize: 14, color: editMsg === '保存成功' ? '#2ecc71' : '#e74c3c' }}>{editMsg}</p>}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <span style={{ color: '#999', fontSize: 13 }}>用户名</span>
              <p style={{ fontSize: 16, marginTop: 4 }}>{user.username}</p>
            </div>
            <div>
              <span style={{ color: '#999', fontSize: 13 }}>手机号</span>
              <p style={{ fontSize: 16, marginTop: 4 }}>{user.phone || '未设置'}</p>
            </div>
            <div>
              <span style={{ color: '#999', fontSize: 13 }}>昵称</span>
              <p style={{ fontSize: 16, marginTop: 4 }}>{user.nickname || '未设置'}</p>
            </div>
            <div>
              <span style={{ color: '#999', fontSize: 13 }}>角色</span>
              <p style={{ fontSize: 16, marginTop: 4 }}>{user.role === 'ADMIN' ? '管理员' : '学生'}</p>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <span style={{ color: '#999', fontSize: 13 }}>个人简介</span>
              <p style={{ fontSize: 15, marginTop: 4, color: '#555' }}>{user.intro || '这个人很懒，什么都没写~'}</p>
            </div>
          </div>
        )}
      </div>

      {/* 修改密码 */}
      <div className="card">
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>修改密码</h2>
        <form onSubmit={submitPassword}>
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>旧密码</label>
              <input className="form-input" type="password" value={pwdForm.oldPassword}
                onChange={(e) => setPwdForm({ ...pwdForm, oldPassword: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>新密码</label>
              <input className="form-input" type="password" value={pwdForm.newPassword}
                onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#555' }}>确认新密码</label>
              <input className="form-input" type="password" value={pwdForm.confirmPassword}
                onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })} required />
            </div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 20 }} type="submit">修改密码</button>
          {pwdMsg && <p style={{ marginTop: 10, fontSize: 14, color: pwdMsg.includes('成功') ? '#2ecc71' : '#e74c3c' }}>{pwdMsg}</p>}
        </form>
      </div>
    </div>
  )
}
