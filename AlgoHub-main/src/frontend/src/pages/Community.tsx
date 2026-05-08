import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { postApi } from '../api/post'
import type { Post } from '../types'

const PAGE_SIZE = 10

export default function Community() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('time')
  const [keyword, setKeyword] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [msg, setMsg] = useState('')

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null')

  const fetchPosts = async (p = 1, s = sort, kw = '') => {
    setLoading(true)
    try {
      const res = kw
        ? await postApi.search(kw, p, PAGE_SIZE)
        : await postApi.list(p, PAGE_SIZE, s)
      if (res.data.code === 200) {
        setPosts(res.data.data.list)
        setTotal(res.data.data.total)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPosts() }, [])

  const handleSortChange = (s: string) => {
    setSort(s)
    setPage(1)
    setKeyword('')
    fetchPosts(1, s, '')
  }

  const handleSearch = () => {
    setPage(1)
    if (keyword.trim()) {
      fetchPosts(1, sort, keyword.trim())
    } else {
      fetchPosts(1, sort, '')
    }
  }

  const goToPage = (p: number) => {
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
    if (p < 1 || p > totalPages || p === page) return
    setPage(p)
    fetchPosts(p, sort, keyword.trim())
  }

  const handleCreate = async () => {
    if (!title.trim()) { setMsg('标题不能为空'); return }
    if (!content.trim()) { setMsg('内容不能为空'); return }
    try {
      const res = await postApi.create({ title: title.trim(), content: content.trim() })
      if (res.data.code === 200) {
        setMsg('发布成功')
        setShowCreate(false)
        setTitle('')
        setContent('')
        fetchPosts(1, sort, keyword.trim())
      } else {
        setMsg(res.data.msg)
      }
    } catch {
      setMsg('发布失败')
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 600 }}>问答社区</h2>
        {userInfo && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>发布帖子</button>
        )}
      </div>

      {msg && (
        <div style={{ padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14, background: '#d4edda', color: '#155724' }}>
          {msg}
        </div>
      )}

      {/* 搜索和排序 */}
      <div className="card" style={{ display: 'flex', gap: 12, marginBottom: 20, padding: 16, alignItems: 'center' }}>
        <input
          className="form-input"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
          placeholder="搜索帖子..."
          style={{ flex: 1 }}
        />
        <button className="btn btn-primary" onClick={handleSearch}>搜索</button>
        <div style={{ display: 'flex', gap: 8, marginLeft: 12 }}>
          <button
            className={`btn btn-sm ${sort === 'time' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleSortChange('time')}
          >
            最新
          </button>
          <button
            className={`btn btn-sm ${sort === 'hot' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleSortChange('hot')}
          >
            最热
          </button>
        </div>
      </div>

      {total > 0 && (
        <p style={{ fontSize: 14, color: '#888', marginBottom: 12 }}>共 {total} 个帖子</p>
      )}

      {/* 帖子列表 */}
      {loading ? (
        <div className="loading">加载中...</div>
      ) : posts.length === 0 ? (
        <div className="empty">暂无帖子</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/community/${post.id}`}
              className="card"
              style={{ textDecoration: 'none', color: 'inherit', padding: 20, transition: 'box-shadow 0.2s' }}
            >
              <h3 style={{ fontSize: 17, color: '#333', marginBottom: 8 }}>{post.title}</h3>
              <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 12 }}>
                {post.content.length > 150 ? post.content.slice(0, 150) + '...' : post.content}
              </p>
              <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#999' }}>
                <span>{post.user?.nickname || post.user?.username || ('用户#' + post.userId)}</span>
                <span>{post.createTime}</span>
                <span>👍 {post.likeCount}</span>
                <span>💬 {post.commentCount}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          <button className="btn btn-sm btn-secondary" onClick={() => goToPage(page - 1)} disabled={page === 1}>上一页</button>
          <span style={{ padding: '6px 12px', fontSize: 14, color: '#666' }}>{page} / {totalPages}</span>
          <button className="btn btn-sm btn-secondary" onClick={() => goToPage(page + 1)} disabled={page === totalPages}>下一页</button>
        </div>
      )}

      {/* 发布弹窗 */}
      {showCreate && (
        <div className="modal-mask" onClick={() => setShowCreate(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">发布帖子</h3>
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={labelStyle}>标题 *</label>
                <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="请输入帖子标题" />
              </div>
              <div>
                <label style={labelStyle}>内容 *</label>
                <textarea className="form-input" rows={6} value={content} onChange={(e) => setContent(e.target.value)} placeholder="请输入帖子内容" />
              </div>
            </div>
            <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleCreate}>发布</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', marginBottom: 6, fontSize: 14, color: '#555', fontWeight: 500 }
