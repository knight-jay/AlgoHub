import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { algorithmApi } from '../api/algorithm'
import type { Algorithm } from '../types'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // fallback for older browsers
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }
  return (
    <button className="btn btn-primary btn-sm" onClick={handleCopy}>
      {copied ? '已复制' : '一键复制'}
    </button>
  )
}

export default function AlgorithmDetail() {
  const { id } = useParams<{ id: string }>()
  const [algo, setAlgo] = useState<Algorithm | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    algorithmApi.getDetail(Number(id)).then((res) => {
      if (res.data.code === 200) {
        setAlgo(res.data.data)
      }
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="loading">加载中...</div>
  if (!algo) return <div className="empty">算法不存在</div>

  return (
    <div>
      <Link to="/" style={{ fontSize: 14, color: '#667eea', marginBottom: 20, display: 'inline-block' }}>
        &larr; 返回算法列表
      </Link>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ fontSize: 24, color: '#333' }}>{algo.title}</h1>
          <span className={`difficulty-tag diff-${algo.difficulty}`} style={{ fontSize: 14, padding: '6px 16px' }}>
            {{ easy: '简单', medium: '中等', hard: '困难' }[algo.difficulty] || algo.difficulty}
          </span>
        </div>

        {algo.tags && (
          <div style={{ marginBottom: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {algo.tags.split(',').map((tag) => (
              <span key={tag} className="tag">{tag.trim()}</span>
            ))}
          </div>
        )}

        {algo.description && (
          <section style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 18, color: '#333', marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #f0f0f0' }}>
              算法描述
            </h2>
            <p style={{ fontSize: 15, color: '#555', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {algo.description}
            </p>
          </section>
        )}

        {algo.usageIntro && (
          <section style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 18, color: '#333', marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #f0f0f0' }}>
              用法说明
            </h2>
            <p style={{ fontSize: 15, color: '#555', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {algo.usageIntro}
            </p>
          </section>
        )}

        {algo.cppTemplate && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #f0f0f0' }}>
              <h2 style={{ fontSize: 18, color: '#333' }}>C++ 模板</h2>
              <CopyButton text={algo.cppTemplate} />
            </div>
            <pre style={{
              background: '#1e1e2f',
              color: '#d4d4d4',
              padding: 20,
              borderRadius: 8,
              fontSize: 14,
              lineHeight: 1.6,
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
            }}>
              {algo.cppTemplate}
            </pre>
          </section>
        )}

        <div style={{ marginTop: 28, fontSize: 13, color: '#999' }}>
          更新时间：{algo.updateTime || algo.createTime}
        </div>
      </div>
    </div>
  )
}
