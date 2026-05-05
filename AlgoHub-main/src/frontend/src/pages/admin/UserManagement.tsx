import { useState, useEffect } from 'react'
import { adminApi } from '../../api/admin'
import type { User } from '../../types'

const PAGE_SIZE = 10

function roleLevel(role: string) {
  if (role === 'MASTER') return 3
  if (role === 'ADMIN') return 2
  return 1
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  const currentRole: string = userInfo.role || ''
  const currentLevel = roleLevel(currentRole)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const fetchUsers = (p: number) => {
    setLoading(true)
    adminApi.listUsers(p, PAGE_SIZE).then((res) => {
      if (res.data.code === 200) {
        const d = res.data.data
        setUsers(d.list)
        setTotal(d.total)
      }
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers(1) }, [])

  const toggleStatus = async (user: User) => {
    const newLocked = user.locked === 1 ? 0 : 1
    const res = await adminApi.toggleUserStatus(user.id, newLocked)
    if (res.data.code === 200) {
      setMsg(res.data.msg)
      fetchUsers(page)
    } else {
      setMsg(res.data.msg)
    }
  }

  const changeRole = async (user: User, newRole: string) => {
    const res = await adminApi.changeUserRole(user.id, newRole)
    if (res.data.code === 200) {
      setMsg(res.data.msg)
      fetchUsers(page)
    } else {
      setMsg(res.data.msg)
    }
  }

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return
    setPage(p)
    fetchUsers(p)
  }

  if (loading) return <div className="loading">加载中...</div>

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 20 }}>用户管理</h2>
      {msg && (
        <div style={{ padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14, background: '#d4edda', color: '#155724' }}>
          {msg}
        </div>
      )}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
              <th style={th}>ID</th>
              <th style={th}>用户名</th>
              <th style={th}>手机号</th>
              <th style={th}>角色</th>
              <th style={th}>状态</th>
              <th style={th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const targetLevel = roleLevel(u.role)
              const canToggle = targetLevel < currentLevel
              const canChangeRole = currentRole === 'MASTER' && targetLevel < currentLevel

              return (
                <tr key={u.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={td}>{u.id}</td>
                  <td style={td}>{u.username}</td>
                  <td style={td}>{u.phone}</td>
                  <td style={td}>
                    {canChangeRole ? (
                      <select value={u.role} onChange={(e) => changeRole(u, e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #e0e0e0', fontSize: 13 }}>
                        <option value="STUDENT">学生</option>
                        <option value="ADMIN">管理员</option>
                      </select>
                    ) : (
                      <span style={{ color: '#555' }}>
                        {u.role === 'MASTER' ? '群主' : u.role === 'ADMIN' ? '管理员' : '学生'}
                      </span>
                    )}
                  </td>
                  <td style={td}>
                    <span style={{ color: u.locked === 1 ? '#e74c3c' : '#2ecc71', fontWeight: 500 }}>
                      {u.locked === 1 ? '已禁用' : '正常'}
                    </span>
                  </td>
                  <td style={td}>
                    <button
                      className={`btn btn-sm ${u.locked === 1 ? 'btn-primary' : 'btn-danger'}`}
                      onClick={() => toggleStatus(u)}
                      disabled={!canToggle}
                      style={!canToggle ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                    >
                      {u.locked === 1 ? '启用' : '禁用'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => goToPage(page - 1)} disabled={page <= 1} style={{ opacity: page <= 1 ? 0.5 : 1 }}>
            上一页
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={p === page ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
              onClick={() => goToPage(p)}
              style={{ minWidth: 36 }}
            >
              {p}
            </button>
          ))}
          <button className="btn btn-secondary btn-sm" onClick={() => goToPage(page + 1)} disabled={page >= totalPages} style={{ opacity: page >= totalPages ? 0.5 : 1 }}>
            下一页
          </button>
        </div>
      )}
    </div>
  )
}

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '14px 16px',
  fontWeight: 600,
  color: '#555',
  fontSize: 13,
}
const td: React.CSSProperties = {
  padding: '12px 16px',
  color: '#333',
}
