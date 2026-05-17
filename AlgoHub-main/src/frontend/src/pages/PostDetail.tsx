import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { postApi } from '../api/post'
import type { Post, Comment } from '../types'

// 递归评论组件，支持嵌套回复和评论举报
function CommentItem({
  comment,
  allComments,
  depth,
  userInfo,
  isPostAuthor,
  replyTo,
  onToggleReply,
  replyText,
  onReplyTextChange,
  onSubmitReply,
  onDeleteComment,
  onReportComment,
}: {
  comment: Comment
  allComments: Comment[]
  depth: number
  userInfo: { userId: number; username: string; role: string } | null
  replyTo: number | null
  onToggleReply: (id: number) => void
  replyText: string
  onReplyTextChange: (v: string) => void
  onSubmitReply: () => void
  onDeleteComment: (id: number) => void
  onReportComment: (id: number) => void
}) {
  const children = allComments.filter((c) => c.parentId === comment.id)
  const isOwn = userInfo && String(comment.userId) === String(userInfo.userId)
  const parentComment = comment.parentId ? allComments.find((c) => c.id === comment.parentId) : null
  const parentName = parentComment ? (parentComment.user?.nickname || parentComment.user?.username || ('用户#' + parentComment.userId)) : null
  const displayName = comment.user?.nickname || comment.user?.username || ('用户#' + comment.userId)

  return (
    <div style={{ marginLeft: depth > 0 ? 24 : 0, marginTop: depth > 0 ? 12 : 0 }}>
      {depth > 0 && (
        <div style={{ padding: 12, background: '#f8f9fa', borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 13, color: '#667eea' }}>
              {displayName}
              {parentName && <span style={{ color: '#999', marginLeft: 6 }}>回复 @{parentName}</span>}
            </span>
            <span style={{ fontSize: 12, color: '#999' }}>{comment.createTime}</span>
          </div>
          <p style={{ fontSize: 14, color: '#333', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: 8 }}>{comment.content}</p>
          {/* 按钮组 */}
          <div style={{ display: 'flex', gap: 12 }}>
            {userInfo && (
              <button style={btnLink} onClick={() => onToggleReply(comment.id)}>💬 回复</button>
            )}
            {userInfo && !isOwn && (
              <button style={{ ...btnLink, color: '#e67e22' }} onClick={() => onReportComment(comment.id)}>🚩 举报</button>
            )}
            {isOwn && (
              <button style={{ ...btnLink, color: '#e74c3c' }} onClick={() => onDeleteComment(comment.id)}>删除</button>
            )}
          </div>
          {/* 回复框 */}
          {replyTo === comment.id && (
            <div style={{ marginTop: 12 }}>
              <textarea className="form-input" rows={2} value={replyText}
                onChange={(e) => onReplyTextChange(e.target.value)}
                placeholder={`回复 @${displayName}`}
              />
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={onSubmitReply}>回复</button>
                <button className="btn btn-secondary btn-sm" onClick={() => onToggleReply(-1)}>取消</button>
              </div>
            </div>
          )}
        </div>
      )}
      {depth === 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: '#667eea' }}>{displayName}</span>
            <span style={{ fontSize: 12, color: '#999' }}>{comment.createTime}</span>
          </div>
          <p style={{ fontSize: 14, color: '#333', lineHeight: 1.6, marginBottom: 8, whiteSpace: 'pre-wrap' }}>{comment.content}</p>
          {/* 按钮组 */}
          <div style={{ display: 'flex', gap: 12 }}>
            {userInfo && (
              <button style={btnLink} onClick={() => onToggleReply(comment.id)}>💬 回复</button>
            )}
            {userInfo && !isOwn && (
              <button style={{ ...btnLink, color: '#e67e22' }} onClick={() => onReportComment(comment.id)}>🚩 举报</button>
            )}
            {isOwn && (
              <button style={{ ...btnLink, color: '#e74c3c' }} onClick={() => onDeleteComment(comment.id)}>删除</button>
            )}
          </div>
          {/* 回复框 */}
          {replyTo === comment.id && (
            <div style={{ marginTop: 12, marginLeft: 24 }}>
              <textarea className="form-input" rows={2} value={replyText}
                onChange={(e) => onReplyTextChange(e.target.value)}
                placeholder={`回复 @${displayName}`}
              />
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={onSubmitReply}>回复</button>
                <button className="btn btn-secondary btn-sm" onClick={() => onToggleReply(-1)}>取消</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* 递归渲染子回复 */}
      {children.map((child) => (
        <CommentItem
          key={child.id}
          comment={child}
          allComments={allComments}
          depth={depth + 1}
          userInfo={userInfo}
          isPostAuthor={isPostAuthor}
          replyTo={replyTo}
          onToggleReply={onToggleReply}
          replyText={replyText}
          onReplyTextChange={onReplyTextChange}
          onSubmitReply={onSubmitReply}
          onDeleteComment={onDeleteComment}
          onReportComment={onReportComment}
        />
      ))}
    </div>
  )
}

const btnLink: React.CSSProperties = { fontSize: 12, color: '#667eea', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }

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

  // 编辑帖子
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  // 点赞/收藏/关注用户状态
  const [liked, setLiked] = useState(false)
  const [favorited, setFavorited] = useState(false)
  const [userFollowed, setUserFollowed] = useState(false)

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null')
  const postId = Number(id)

  const fetchPost = async () => {
    setLoading(true)
    try {
      const res = await postApi.getDetail(postId)
      if (res.data.code === 200) {
        const p = res.data.data
        setPost(p)
        setLiked(p.isLiked ?? false)
        setFavorited(p.isFavorited ?? false)
        setUserFollowed(p.isAuthorFollowed ?? false)
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
      if (res.data.code === 200) {
        setMsg(res.data.data)
        setLiked(res.data.data === '已点赞')
        fetchPost()
      }
    } catch { setMsg('操作失败') }
  }

  const handleFavorite = async () => {
    try {
      const res = await postApi.toggleFavorite(postId)
      if (res.data.code === 200) {
        setMsg(res.data.msg)
        fetchPost()
      }
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

  const handleFollowUser = async () => {
    if (!post) return
    try {
      const res = await postApi.toggleFollowUser(post.userId)
      if (res.data.code === 200) {
        setMsg(res.data.msg)
        fetchPost()
      }
    } catch { setMsg('操作失败') }
  }

  const handleReportComment = async (commentId: number) => {
    const reason = prompt('请输入举报原因：')
    if (!reason) return
    try {
      const res = await postApi.reportComment(commentId, reason)
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

  const toggleReply = (commentId: number) => {
    if (replyTo === commentId) {
      setReplyTo(null)
      setReplyText('')
    } else {
      setReplyTo(commentId)
      setReplyText('')
    }
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

  const startEdit = () => {
    if (!post) return
    setEditTitle(post.title)
    setEditContent(post.content)
    setEditing(true)
    setMsg('')
  }

  const submitEdit = async () => {
    if (!editTitle.trim()) { setMsg('标题不能为空'); return }
    if (!editContent.trim()) { setMsg('内容不能为空'); return }
    try {
      const res = await postApi.update(postId, { title: editTitle.trim(), content: editContent.trim() })
      if (res.data.code === 200) {
        setMsg('编辑成功')
        setEditing(false)
        fetchPost()
      } else {
        setMsg(res.data.msg)
      }
    } catch { setMsg('编辑失败') }
  }

  const topComments = comments.filter((c) => !c.parentId)

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
        <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#999', marginBottom: 16, alignItems: 'center' }}>
          <Link to={`/user/${post.userId}`} style={{ color: '#667eea', textDecoration: 'none' }}>{post.user?.nickname || post.user?.username || ('用户#' + post.userId)}</Link>
          <span>{post.createTime}</span>
          {post.updateTime !== post.createTime && <span>编辑于 {post.updateTime}</span>}
          {userInfo && String(post.userId) !== String(userInfo.userId) && (
            <button className={`btn btn-sm ${userFollowed ? 'btn-primary' : 'btn-secondary'}`} onClick={handleFollowUser}>
              {userFollowed ? '已关注' : '+ 关注'}
            </button>
          )}
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.8, color: '#333', whiteSpace: 'pre-wrap', marginBottom: 20 }}>
          {post.content}
        </div>

        {/* 操作按钮 */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
          <button className={`btn btn-sm ${liked ? 'btn-primary' : 'btn-secondary'}`} onClick={handleLike}>👍 {liked ? '已点赞' : '点赞'} {post.likeCount}</button>
          <button className={`btn btn-sm ${favorited ? 'btn-primary' : 'btn-secondary'}`} onClick={handleFavorite}>⭐ {favorited ? '已收藏' : '收藏'}</button>
          {userInfo && String(post.userId) !== String(userInfo.userId) && (
            <button className="btn btn-sm btn-secondary" onClick={handleReport}>🚩 举报</button>
          )}
          {userInfo && String(post.userId) === String(userInfo.userId) && (
            <>
              <button className="btn btn-sm btn-secondary" onClick={startEdit}>编辑</button>
              <button className="btn btn-sm btn-danger" onClick={handleDeletePost}>删除</button>
            </>
          )}
        </div>
      </div>

      {/* 评论区 */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 16 }}>评论 ({comments.length})</h3>

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

        {topComments.length === 0 ? (
          <div className="empty" style={{ padding: 20, fontSize: 14 }}>暂无评论</div>
        ) : (
          topComments.map((c) => (
            <div key={c.id} style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, marginBottom: 16 }}>
              <CommentItem
                comment={c}
                allComments={comments}
                depth={0}
                userInfo={userInfo}
                replyTo={replyTo}
                onToggleReply={toggleReply}
                replyText={replyText}
                onReplyTextChange={setReplyText}
                onSubmitReply={handleReply}
                onDeleteComment={handleDeleteComment}
                onReportComment={handleReportComment}
              />
            </div>
          ))
        )}
      </div>

      {/* 编辑帖子弹窗 */}
      {editing && (
        <div className="modal-mask" onClick={() => setEditing(false)}>
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
              <button className="btn btn-secondary" onClick={() => setEditing(false)}>取消</button>
              <button className="btn btn-primary" onClick={submitEdit}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', marginBottom: 6, fontSize: 14, color: '#555', fontWeight: 500 }
