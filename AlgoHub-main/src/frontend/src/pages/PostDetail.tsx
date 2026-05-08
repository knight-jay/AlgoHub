import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { postApi } from '../api/post'
import type { Post, Comment } from '../types'

export default function PostDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')
  const [msg, setMsg] = useState('')

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null')
  const postId = Number(id)

  const fetchPost = async () => {
    setLoading(true)
    try {
      const res = await postApi.getDetail(postId)
      if (res.data.code === 200) {
        setPost(res.data.data)
      } else {
        setMsg(res.data.msg)
      }
    } catch {
      setMsg('加载失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const res = await postApi.getComments(postId)
      if (res.data.code === 200) {
        setComments(res.data.data.list)
      }
    } catch { /* ignore */ }
  }

  useEffect(() => {
    fetchPost()
    fetchComments()
  }, [id])

  const handleLike = async () => {
    try {
      const res = await postApi.toggleLike(postId)
      if (res.data.code === 200) setMsg(res.data.msg)
      fetchPost()
    } catch { setMsg('操作失败') }
  }

  const handleFavorite = async () => {
    try {
      const res = await postApi.toggleFavorite(postId)
      if (res.data.code === 200) setMsg(res.data.msg)
    } catch { setMsg('操作失败') }
  }

  const handleFollowPost = async () => {
    try {
      const res = await postApi.toggleFollowPost(postId)
      if (res.data.code === 200) setMsg(res.data.msg)
    } catch { setMsg('操作失败') }
  }

  const handleReport = async () => {
    const reason = prompt('请输入举报原因：')
    if (!reason) return
    try {
      const res = await postApi.reportPost(postId, reason)
      if (res.data.code === 200) setMsg(res.data.msg)
    } catch { setMsg('举报失败') }
  }

  const handleComment = async () => {
    if (!commentText.trim()) return
    try {
      const res = await postApi.createComment(postId, { content: commentText.trim() })
      if (res.data.code === 200) {
        setCommentText('')
        fetchComments()
        fetchPost()
      } else {
        setMsg(res.data.msg)
      }
    } catch { setMsg('评论失败') }
  }

  const handleReply = async () => {
    if (!replyText.trim() || !replyTo) return
    try {
      const res = await postApi.createComment(postId, { content: replyText.trim(), parentId: replyTo })
      if (res.data.code === 200) {
        setReplyText('')
        setReplyTo(null)
        fetchComments()
        fetchPost()
      } else {
        setMsg(res.data.msg)
      }
    } catch { setMsg('回复失败') }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('确定删除此评论？')) return
    try {
      await postApi.deleteComment(commentId)
      fetchComments()
      fetchPost()
    } catch { setMsg('删除失败') }
  }

  const handleDeletePost = async () => {
    if (!confirm('确定删除此帖子？')) return
    try {
      await postApi.delete(postId)
      navigate('/community')
    } catch { setMsg('删除失败') }
  }

  // 将评论按 parentId 组织成树形结构
  const topComments = comments.filter((c) => !c.parentId)
  const replies = (parentId: number) => comments.filter((c) => c.parentId === parentId)

  if (loading) return <div className="loading">加载中...</div>
  if (!post) return <div className="empty">{msg || '帖子不存在'}</div>

  return (
    <div>
      <Link to="/community" style={{ fontSize: 14, color: '#667eea', marginBottom: 20, display: 'inline-block' }}>
        ← 返回社区
      </Link>

      {msg && (
        <div style={{ padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14, background: '#d4edda', color: '#155724' }}>
          {msg}
        </div>
      )}

      {/* 帖子内容 */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>{post.title}</h2>
        <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#999', marginBottom: 16 }}>
          <span>用户#{post.userId}</span>
          <span>{post.createTime}</span>
          {post.updateTime !== post.createTime && <span>编辑于 {post.updateTime}</span>}
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.8, color: '#333', whiteSpace: 'pre-wrap', marginBottom: 20 }}>
          {post.content}
        </div>

        {/* 操作按钮 */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
          <button className="btn btn-sm btn-primary" onClick={handleLike}>👍 点赞 {post.likeCount}</button>
          <button className="btn btn-sm btn-secondary" onClick={handleFavorite}>⭐ 收藏</button>
          <button className="btn btn-sm btn-secondary" onClick={handleFollowPost}>🔔 关注</button>
          <button className="btn btn-sm btn-secondary" onClick={handleReport}>🚩 举报</button>
          {userInfo && String(post.userId) === String(userInfo.userId || '') && (
            <>
              <button className="btn btn-sm btn-danger" onClick={handleDeletePost}>删除</button>
            </>
          )}
        </div>
      </div>

      {/* 评论区 */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 16 }}>评论 ({comments.length})</h3>

        {/* 发布评论 */}
        {userInfo ? (
          <div style={{ marginBottom: 20 }}>
            <textarea
              className="form-input"
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="写下你的评论..."
            />
            <div style={{ marginTop: 10 }}>
              <button className="btn btn-primary btn-sm" onClick={handleComment}>发表评论</button>
            </div>
          </div>
        ) : (
          <p style={{ marginBottom: 20, fontSize: 14, color: '#999' }}>
            <Link to="/login">登录</Link> 后参与评论
          </p>
        )}

        {/* 评论列表 */}
        {topComments.length === 0 ? (
          <div className="empty" style={{ padding: 20, fontSize: 14 }}>暂无评论</div>
        ) : (
          topComments.map((c) => (
            <div key={c.id} style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#667eea' }}>用户#{c.userId}</span>
                <span style={{ fontSize: 12, color: '#999' }}>{c.createTime}</span>
              </div>
              <p style={{ fontSize: 14, color: '#333', lineHeight: 1.6, marginBottom: 8, whiteSpace: 'pre-wrap' }}>{c.content}</p>
              <div style={{ display: 'flex', gap: 12 }}>
                {userInfo && (
                  <button
                    style={{ fontSize: 12, color: '#667eea', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
                  >
                    💬 回复
                  </button>
                )}
                {userInfo && String(c.userId) === String(userInfo.userId || '') && (
                  <button
                    style={{ fontSize: 12, color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    onClick={() => handleDeleteComment(c.id)}
                  >
                    删除
                  </button>
                )}
              </div>

              {/* 回复框 */}
              {replyTo === c.id && (
                <div style={{ marginTop: 12, marginLeft: 24 }}>
                  <textarea
                    className="form-input"
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="写下你的回复..."
                  />
                  <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary btn-sm" onClick={handleReply}>回复</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setReplyTo(null); setReplyText('') }}>取消</button>
                  </div>
                </div>
              )}

              {/* 子回复 */}
              {replies(c.id).map((r) => (
                <div key={r.id} style={{ marginLeft: 24, marginTop: 12, padding: 12, background: '#f8f9fa', borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: '#667eea' }}>用户#{r.userId}</span>
                    <span style={{ fontSize: 12, color: '#999' }}>{r.createTime}</span>
                  </div>
                  <p style={{ fontSize: 14, color: '#333', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{r.content}</p>
                  {userInfo && String(r.userId) === String(userInfo.userId || '') && (
                    <button
                      style={{ fontSize: 12, color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 4 }}
                      onClick={() => handleDeleteComment(r.id)}
                    >
                      删除
                    </button>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
