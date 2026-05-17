import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { postApi } from '../api/post'
import type { User, Post } from '../types'

const PAGE_SIZE = 10

export default function UserProfile() {
  const { id } = useParams<{ id: string }>()
  const userId = Number(id)
  const [profile, setProfile] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [followed, setFollowed] = useState(false)

  const currentUser = JSON.parse(localStorage.getItem('userInfo') || 'null')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      postApi.getUserProfile(userId),
      postApi.getUserPosts(userId, 1, PAGE_SIZE),
    ]).then(([profileRes, postsRes]) => {
      if (profileRes.data.code === 200) {
        const p = profileRes.data.data
        setProfile(p)
        setFollowed(p.isFollowed ?? false)
      }
      if (postsRes.data.code === 200) {
        const d = postsRes.data.data
        setPosts(d.list)
        setTotal(d.total)
      }
    }).finally(() => setLoading(false))
  }, [userId])

  const goToPage = (p: number) => {
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
    if (p < 1 || p > totalPages) return
    setPage(p)
    postApi.getUserPosts(userId, p, PAGE_SIZE).then((res) => {
      if (res.data.code === 200) {
        setPosts(res.data.data.list)
        setTotal(res.data.data.total)
      }
    })
  }

  const handleFollow = async () => {
    try {
      const res = await postApi.toggleFollowUser(userId)
      if (res.data.code === 200) {
        setFollowed(res.data.data === '已关注')
      }
    } catch { /* ignore */ }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const isSelf = currentUser && String(currentUser.userId) === String(userId)

  if (loading) return <div className="loading">加载中...</div>
  if (!profile) return <div className="empty">用户不存在</div>

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <Link to="/community" style={{ fontSize: 14, color: '#667eea', marginBottom: 20, display: 'inline-block' }}>
        ← 返回社区
      </Link>

      {/* 用户信息卡片 */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>{profile.nickname || profile.username}</h2>
            <p style={{ fontSize: 14, color: '#999', marginBottom: 8 }}>@{profile.username}</p>
            <p style={{ fontSize: 14, color: '#999', marginBottom: 12 }}>
              {profile.role === 'MASTER' ? '群主' : profile.role === 'ADMIN' ? '管理员' : '学生'} · 加入于 {profile.createTime}
            </p>
            {profile.intro && (
              <p style={{ fontSize: 15, color: '#555', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{profile.intro}</p>
            )}
          </div>
          {currentUser && !isSelf && (
            <button className={`btn btn-sm ${followed ? 'btn-primary' : 'btn-secondary'}`} onClick={handleFollow}>
              {followed ? '已关注' : '+ 关注'}
            </button>
          )}
        </div>
      </div>

      {/* 用户帖子 */}
      <div className="card">
        <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 16 }}>
          {isSelf ? '我的帖子' : `${profile.nickname || profile.username} 的帖子`}
          {total > 0 && <span style={{ fontSize: 14, color: '#999', fontWeight: 400, marginLeft: 8 }}>（{total} 篇）</span>}
        </h3>

        {posts.length === 0 ? (
          <div className="empty" style={{ padding: 20, fontSize: 14 }}>暂无帖子</div>
        ) : (
          <>
            {posts.map((post) => (
              <div key={post.id} style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, paddingBottom: 16 }}>
                <Link to={`/community/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h4 style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>{post.title}</h4>
                  <p style={{ fontSize: 14, color: '#666', marginBottom: 8, lineHeight: 1.5 }}>
                    {post.content.length > 120 ? post.content.slice(0, 120) + '...' : post.content}
                  </p>
                  <div style={{ fontSize: 12, color: '#999' }}>
                    <span>{post.createTime}</span>
                    <span style={{ marginLeft: 12 }}>👍 {post.likeCount}</span>
                    <span style={{ marginLeft: 8 }}>💬 {post.commentCount}</span>
                  </div>
                </Link>
              </div>
            ))}

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
                <button className="btn btn-sm btn-secondary" disabled={page <= 1} onClick={() => goToPage(page - 1)}>上一页</button>
                <span style={{ padding: '6px 12px', fontSize: 14, color: '#666' }}>{page} / {totalPages}</span>
                <button className="btn btn-sm btn-secondary" disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>下一页</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
