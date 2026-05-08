import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminPostApi } from '../../api/post'
import type { PostReport } from '../../types'

const PAGE_SIZE = 10

export default function ReportManagement() {
  const navigate = useNavigate()
  const [reports, setReports] = useState<PostReport[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'post' | 'comment'>('all')
  const [msg, setMsg] = useState('')

  const fetchReports = async (p = 1, status = statusFilter) => {
    setLoading(true)
    try {
      const res = await adminPostApi.getReports(p, PAGE_SIZE, status || undefined)
      if (res.data.code === 200) {
        setReports(res.data.data.list)
        setTotal(res.data.data.total)
      }
    } catch { setMsg('加载失败') } finally { setLoading(false) }
  }

  useEffect(() => { fetchReports() }, [])

  const handleDismiss = async (id: number) => {
    if (!confirm('确定驳回此举报？')) return
    try {
      const res = await adminPostApi.dismissReport(id)
      if (res.data.code === 200) {
        setMsg('举报已驳回')
        fetchReports()
      } else {
        setMsg(res.data.msg)
      }
    } catch { setMsg('操作失败') }
  }

  const handleDeletePost = async (id: number) => {
    if (!confirm('确定直接删除此帖子？')) return
    try {
      const res = await adminPostApi.deletePost(id)
      if (res.data.code === 200) {
        setMsg('帖子已删除')
        fetchReports()
      }
    } catch { setMsg('操作失败') }
  }

  const handleDeleteComment = async (id: number) => {
    if (!confirm('确定直接删除此评论？')) return
    try {
      const res = await adminPostApi.deleteComment(id)
      if (res.data.code === 200) {
        setMsg('评论已删除')
        fetchReports()
      }
    } catch { setMsg('操作失败') }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const statusLabel = (s: string) => ({ PENDING: '待处理', RESOLVED: '已处理', DISMISSED: '已驳回' }[s] || s)
  const statusColor = (s: string) => {
    if (s === 'PENDING') return '#e67e22'
    if (s === 'RESOLVED') return '#2ecc71'
    return '#999'
  }

  const getReportType = (r: PostReport): 'post' | 'comment' => r.commentId ? 'comment' : 'post'

  const filteredReports = typeFilter === 'all'
    ? reports
    : reports.filter((r) => getReportType(r) === typeFilter)

  if (loading) return <div className="loading">加载中...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600 }}>举报管理</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['', 'PENDING', 'RESOLVED', 'DISMISSED'].map((s) => (
            <button
              key={s}
              className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setStatusFilter(s); setPage(1); fetchReports(1, s) }}
            >
              {s ? statusLabel(s) : '全部状态'}
            </button>
          ))}
        </div>
      </div>

      {/* 类型筛选 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { key: 'all', label: '全部类型' },
          { key: 'post', label: '帖子举报' },
          { key: 'comment', label: '评论举报' },
        ].map((t) => (
          <button
            key={t.key}
            className={`btn btn-sm ${typeFilter === t.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTypeFilter(t.key as typeof typeFilter)}
          >
            {t.label}
          </button>
        ))}
      </div>

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
              <th style={th}>举报人</th>
              <th style={th}>类型</th>
              <th style={th}>帖子ID</th>
              <th style={th}>评论ID</th>
              <th style={th}>原因</th>
              <th style={th}>状态</th>
              <th style={th}>时间</th>
              <th style={th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={td}>{r.id}</td>
                <td style={td}>{r.reporter?.nickname || r.reporter?.username || ('#' + r.reporterId)}</td>
                <td style={td}>
                  <span style={{
                    color: getReportType(r) === 'post' ? '#667eea' : '#e67e22',
                    fontWeight: 500,
                    fontSize: 13,
                  }}>
                    {getReportType(r) === 'post' ? '帖子举报' : '评论举报'}
                  </span>
                </td>
                <td style={td}>{r.postId ? <button style={{ ...linkBtn }} onClick={() => navigate(`/community/${r.postId}`)}>{r.postId}</button> : '-'}</td>
                <td style={td}>{r.commentId || '-'}</td>
                <td style={{ ...td, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.reason || '-'}</td>
                <td style={td}>
                  <span style={{ color: statusColor(r.status), fontWeight: 500, fontSize: 13 }}>{statusLabel(r.status)}</span>
                </td>
                <td style={td}>{r.createTime}</td>
                <td style={td}>
                  {r.status === 'PENDING' && (
                    <>
                      {r.postId && (
                        <>
                          <button className="btn btn-primary btn-sm" style={{ marginRight: 8 }} onClick={() => navigate(`/community/${r.postId}`)}>查看</button>
                          <button className="btn btn-danger btn-sm" style={{ marginRight: 8 }} onClick={() => handleDeletePost(r.postId!)}>删帖</button>
                        </>
                      )}
                      {r.commentId && (
                        <button className="btn btn-danger btn-sm" style={{ marginRight: 8 }} onClick={() => handleDeleteComment(r.commentId!)}>删评</button>
                      )}
                      <button className="btn btn-secondary btn-sm" onClick={() => handleDismiss(r.id)}>驳回</button>
                    </>
                  )}
                  {r.status !== 'PENDING' && (
                    <>
                      {r.postId && (
                        <button className="btn btn-primary btn-sm" style={{ marginRight: 8 }} onClick={() => navigate(`/community/${r.postId}`)}>查看</button>
                      )}
                      <span style={{ fontSize: 12, color: '#999' }}>已{r.status === 'RESOLVED' ? '处理' : '驳回'}</span>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredReports.length === 0 && <div className="empty">{typeFilter !== 'all' ? '暂无该类型举报' : '暂无举报'}</div>}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          <button className="btn btn-sm btn-secondary" onClick={() => { setPage(page - 1); fetchReports(page - 1) }} disabled={page === 1}>上一页</button>
          <span style={{ padding: '6px 12px', fontSize: 14, color: '#666' }}>{page} / {totalPages}</span>
          <button className="btn btn-sm btn-secondary" onClick={() => { setPage(page + 1); fetchReports(page + 1) }} disabled={page === totalPages}>下一页</button>
        </div>
      )}
    </div>
  )
}

const th: React.CSSProperties = { textAlign: 'left', padding: '14px 16px', fontWeight: 600, color: '#555', fontSize: 13 }
const td: React.CSSProperties = { padding: '10px 16px', color: '#333' }
const linkBtn: React.CSSProperties = { color: '#667eea', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 14, textDecoration: 'underline' }
