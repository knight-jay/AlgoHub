import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { userApi } from '../api/user'
import { postApi } from '../api/post'
import type { User, Post } from '../types'

type TabKey = 'posts' | 'favorites' | 'following'

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // 编辑个人信息
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ phone: '', nickname: '', intro: '' })
  const [editMsg, setEditMsg] = useState('')

  // 修改密码
  const [pwdForm, setPwdForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [pwdMsg, setPwdMsg] = useState('')

  // Tab 切换
  const [tab, setTab] = useState<TabKey>('posts')

  // 我的帖子
  const [posts, setPosts] = useState<Post[]>([])
  const [postsTotal, setPostsTotal] = useState(0)
  const [postsPage, setPostsPage] = useState(1)
  const [postsLoading, setPostsLoading] = useState(true)

  // 我的收藏
  const [favPosts, setFavPosts] = useState<Post[]>([])
  const [favTotal, setFavTotal] = useState(0)
  const [favPage, setFavPage] = useState(1)
  const [favLoading, setFavLoading] = useState(true)

  // 关注的人
  const [following, setFollowing] = useState<User[]>([])
  const [followingTotal, setFollowingTotal] = useState(0)
  const [followingPage, setFollowingPage] = useState(1)
  const [followingLoading, setFollowingLoading] = useState(true)

  const [msg, setMsg] = useState('')

  // 编辑帖子弹窗
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  const PAGE_SIZE = 5

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

  const fetchMyPosts = async (p = 1) => {
    setPostsLoading(true)
    try {
      const res = await postApi.myPosts(p, PAGE_SIZE)
      if (res.data.code === 200) {
        setPosts(res.data.data.list)
        setPostsTotal(res.data.data.total)
      }
    } catch { /* ignore */ } finally {
      setPostsLoading(false)
    }
  }

  const fetchFavorites = async (p = 1) => {
    setFavLoading(true)
    try {
      const res = await postApi.myFavorites(p, PAGE_SIZE)
      if (res.data.code === 200) {
        setFavPosts(res.data.data.list)
        setFavTotal(res.data.data.total)
      }
    } catch { /* ignore */ } finally {
      setFavLoading(false)
    }
  }

  const fetchFollowing = async (p = 1) => {
    setFollowingLoading(true)
    try {
      const res = await postApi.getFollowedUsers(p, PAGE_SIZE)
      if (res.data.code === 200) {
        setFollowing(res.data.data.list)
        setFollowingTotal(res.data.data.total)
      }
    } catch { /* ignore */ } finally {
      setFollowingLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchMyPosts()
      fetchFavorites()
      fetchFollowing()
    }
  }, [user])

  const switchTab = (t: TabKey) => {
    setTab(t)
    setMsg('')
  }

  const handleDeletePost = async (postId: number) => {
    if (!confirm('确定删除此帖子？')) return
    try {
      await postApi.delete(postId)
      setMsg('删除成功')
      fetchMyPosts(postsPage)
    } catch { setMsg('删除失败') }
  }

  const startEditPost = (post: Post) => {
    setEditingPost(post)
    setEditTitle(post.title)
    setEditContent(post.content)
    setMsg('')
  }

  const submitEditPost = async () => {
    if (!editingPost) return
    if (!editTitle.trim()) { setMsg('标题不能为空'); return }
    if (!editContent.trim()) { setMsg('内容不能为空'); return }
    try {
      const res = await postApi.update(editingPost.id, { title: editTitle.trim(), content: editContent.trim() })
      if (res.data.code === 200) {
        setMsg('编辑成功')
        setEditingPost(null)
        fetchMyPosts(postsPage)
      } else {
        setMsg(res.data.msg)
      }
    } catch { setMsg('编辑失败') }
  }

  const postsTotalPages = Math.max(1, Math.ceil(postsTotal / PAGE_SIZE))
  const favTotalPages = Math.max(1, Math.ceil(favTotal / PAGE_SIZE))
  const followingTotalPages = Math.max(1, Math.ceil(followingTotal / PAGE_SIZE))

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [loading, user, navigate])

  if (loading) return <div className="loading">加载中...</div>
  if (!user) return null

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'posts', label: '我的帖子' },
    { key: 'favorites', label: '我的收藏' },
    { key: 'following', label: '关注的人' },
  ]

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
              <p style={{ fontSize: 16, marginTop: 4 }}>{user.role === 'ADMIN' ? '管理员' : user.role === 'MASTER' ? '群主' : '学生'}</p>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <span style={{ color: '#999', fontSize: 13 }}>个人简介</span>
              <p style={{ fontSize: 15, marginTop: 4, color: '#555' }}>{user.intro || '这个人很懒，什么都没写~'}</p>
            </div>
          </div>
        )}
      </div>

      {/* 修改密码 */}
      <div className="card" style={{ marginBottom: 24 }}>
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

      {/* Tab 切换 */}
      <div className="card">
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '2px solid #f0f0f0', paddingBottom: 12 }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`btn btn-sm ${tab === t.key ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => switchTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {msg && (
          <div style={{ padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14, background: msg.includes('成功') ? '#d4edda' : '#f8d7da', color: msg.includes('成功') ? '#155724' : '#721c24' }}>
            {msg}
          </div>
        )}

        {/* 我的帖子 */}
        {tab === 'posts' && (
          postsLoading ? <div className="loading">加载中...</div> :
          posts.length === 0 ? <div className="empty">暂无帖子</div> :
          <>
            {posts.map((post) => (
              <div key={post.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: 16, paddingBottom: 16 }}>
                <Link to={`/community/${post.id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 500, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</h4>
                  <div style={{ fontSize: 12, color: '#999' }}>
                    <span>{post.createTime}</span>
                    <span style={{ marginLeft: 12 }}>👍 {post.likeCount}</span>
                    <span style={{ marginLeft: 8 }}>💬 {post.commentCount}</span>
                  </div>
                </Link>
                <div style={{ display: 'flex', gap: 8, marginLeft: 16, flexShrink: 0 }}>
                  <button className="btn btn-sm btn-secondary" onClick={() => startEditPost(post)}>编辑</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDeletePost(post.id)}>删除</button>
                </div>
              </div>
            ))}
            {postsTotalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
                <button className="btn btn-sm btn-secondary" disabled={postsPage === 1} onClick={() => { setPostsPage(postsPage - 1); fetchMyPosts(postsPage - 1) }}>上一页</button>
                <span style={{ padding: '6px 12px', fontSize: 14, color: '#666' }}>{postsPage} / {postsTotalPages}</span>
                <button className="btn btn-sm btn-secondary" disabled={postsPage === postsTotalPages} onClick={() => { setPostsPage(postsPage + 1); fetchMyPosts(postsPage + 1) }}>下一页</button>
              </div>
            )}
          </>
        )}

        {/* 我的收藏 */}
        {tab === 'favorites' && (
          favLoading ? <div className="loading">加载中...</div> :
          favPosts.length === 0 ? <div className="empty">暂无收藏</div> :
          <>
            {favPosts.map((post) => (
              <div key={post.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: 16, paddingBottom: 16 }}>
                <Link to={`/community/${post.id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>{post.title}</h4>
                  <div style={{ fontSize: 12, color: '#999' }}>
                    <Link to={`/user/${post.userId}`} style={{ color: '#667eea', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{post.user?.nickname || post.user?.username || ('用户#' + post.userId)}</Link>
                    <span style={{ marginLeft: 12 }}>{post.createTime}</span>
                    <span style={{ marginLeft: 12 }}>👍 {post.likeCount}</span>
                    <span style={{ marginLeft: 8 }}>💬 {post.commentCount}</span>
                  </div>
                </Link>
                <button className="btn btn-sm btn-danger" style={{ marginLeft: 12, flexShrink: 0 }} onClick={async () => {
                  if (!confirm('确定取消收藏？')) return
                  try {
                    await postApi.toggleFavorite(post.id)
                    setMsg('已取消收藏')
                    fetchFavorites(favPage)
                  } catch { setMsg('操作失败') }
                }}>取消收藏</button>
              </div>
            ))}
            {favTotalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
                <button className="btn btn-sm btn-secondary" disabled={favPage === 1} onClick={() => { setFavPage(favPage - 1); fetchFavorites(favPage - 1) }}>上一页</button>
                <span style={{ padding: '6px 12px', fontSize: 14, color: '#666' }}>{favPage} / {favTotalPages}</span>
                <button className="btn btn-sm btn-secondary" disabled={favPage === favTotalPages} onClick={() => { setFavPage(favPage + 1); fetchFavorites(favPage + 1) }}>下一页</button>
              </div>
            )}
          </>
        )}

        {/* 关注的人 */}
        {tab === 'following' && (
          followingLoading ? <div className="loading">加载中...</div> :
          following.length === 0 ? <div className="empty">暂无关注</div> :
          <>
            {following.map((u) => (
              <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: 16, paddingBottom: 16 }}>
                <Link to={`/user/${u.id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 15, fontWeight: 500, color: '#667eea' }}>{u.nickname || u.username}</span>
                  <span style={{ marginLeft: 12, fontSize: 13, color: '#999' }}>@{u.username}</span>
                  <span style={{ marginLeft: 12, fontSize: 13, color: '#999' }}>{u.role === 'ADMIN' ? '管理员' : u.role === 'MASTER' ? '群主' : '学生'}</span>
                  {u.intro && <span style={{ marginLeft: 16, fontSize: 13, color: '#666' }}>{u.intro}</span>}
                </Link>
                <button className="btn btn-sm btn-secondary" style={{ marginLeft: 12, flexShrink: 0 }} onClick={async () => {
                  if (!confirm('确定取消关注？')) return
                  try {
                    await postApi.toggleFollowUser(u.id)
                    setMsg('已取消关注')
                    fetchFollowing(followingPage)
                  } catch { setMsg('操作失败') }
                }}>取消关注</button>
              </div>
            ))}
            {followingTotalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
                <button className="btn btn-sm btn-secondary" disabled={followingPage === 1} onClick={() => { setFollowingPage(followingPage - 1); fetchFollowing(followingPage - 1) }}>上一页</button>
                <span style={{ padding: '6px 12px', fontSize: 14, color: '#666' }}>{followingPage} / {followingTotalPages}</span>
                <button className="btn btn-sm btn-secondary" disabled={followingPage === followingTotalPages} onClick={() => { setFollowingPage(followingPage + 1); fetchFollowing(followingPage + 1) }}>下一页</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 编辑帖子弹窗 */}
      {editingPost && (
        <div className="modal-mask" onClick={() => setEditingPost(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">编辑帖子</h3>
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={labelStyle}>标题 *</label>
                <input className="form-input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="请输入帖子标题" />
              </div>
              <div>
                <label style={labelStyle}>内容 *</label>
                <textarea className="form-input" rows={6} value={editContent} onChange={(e) => setEditContent(e.target.value)} placeholder="请输入帖子内容" />
              </div>
            </div>
            <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setEditingPost(null)}>取消</button>
              <button className="btn btn-primary" onClick={submitEditPost}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', marginBottom: 6, fontSize: 14, color: '#555', fontWeight: 500 }
