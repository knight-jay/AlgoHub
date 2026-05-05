import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { algorithmApi } from '../api/algorithm'
import type { Algorithm, AlgorithmCategory } from '../types'

const DIFFICULTIES = [
  { value: '', label: '全部难度' },
  { value: 'easy', label: '简单' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '困难' },
]

const PAGE_SIZE = 10

export default function Home() {
  const [categories, setCategories] = useState<AlgorithmCategory[]>([])
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([])
  const [keyword, setKeyword] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const fetchAlgorithms = useCallback(async (categoryId: number | null, difficulty: string, p: number) => {
    setLoading(true)
    setError('')
    try {
      if (categoryId) {
        const res = await algorithmApi.getByCategory(categoryId, p, PAGE_SIZE)
        if (res.data.code === 200) {
          const d = res.data.data
          setAlgorithms(d.list)
          setTotal(d.total)
        } else {
          setError(res.data.msg || '获取算法失败')
        }
      } else if (difficulty) {
        const res = await algorithmApi.getByDifficulty(difficulty, p, PAGE_SIZE)
        if (res.data.code === 200) {
          const d = res.data.data
          setAlgorithms(d.list)
          setTotal(d.total)
        } else {
          setError(res.data.msg || '获取算法失败')
        }
      } else {
        const res = await algorithmApi.search('', p, PAGE_SIZE)
        if (res.data.code === 200) {
          const d = res.data.data
          setAlgorithms(d.list)
          setTotal(d.total)
        } else {
          setError(res.data.msg || '搜索失败')
        }
      }
    } catch (err) {
      console.error('API请求失败:', err)
      setError('网络请求失败，请确认后端服务已启动')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearch = async () => {
    if (!keyword.trim()) {
      setPage(1)
      fetchAlgorithms(null, '', 1)
      return
    }
    setSelectedCategory(null)
    setSelectedDifficulty('')
    setPage(1)
    setLoading(true)
    setError('')
    try {
      const res = await algorithmApi.search(keyword.trim(), 1, PAGE_SIZE)
      if (res.data.code === 200) {
        const d = res.data.data
        setAlgorithms(d.list)
        setTotal(d.total)
      } else {
        setError(res.data.msg || '搜索失败')
      }
    } catch (err) {
      console.error('搜索请求失败:', err)
      setError('网络请求失败，请确认后端服务已启动')
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = (id: number | null) => {
    setSelectedCategory(id)
    setSelectedDifficulty('')
    setKeyword('')
    setPage(1)
    fetchAlgorithms(id, '', 1)
  }

  const handleDifficultyClick = (d: string) => {
    setSelectedDifficulty(d)
    setSelectedCategory(null)
    setKeyword('')
    setPage(1)
    fetchAlgorithms(null, d, 1)
  }

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return
    setPage(p)
    if (keyword.trim()) {
      setLoading(true)
      setError('')
      algorithmApi.search(keyword.trim(), p, PAGE_SIZE).then((res) => {
        if (res.data.code === 200) {
          setAlgorithms(res.data.data.list)
          setTotal(res.data.data.total)
        }
      }).catch(() => setError('网络请求失败')).finally(() => setLoading(false))
    } else {
      fetchAlgorithms(selectedCategory, selectedDifficulty, p)
    }
  }

  useEffect(() => {
    algorithmApi.getCategories().then((res) => {
      if (res.data.code === 200) setCategories(res.data.data)
    }).catch((err) => {
      console.error('获取分类失败:', err)
    })
    fetchAlgorithms(null, '', 1)
  }, [fetchAlgorithms])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      {/* 左侧筛选栏 */}
      <aside style={{ width: 220, flexShrink: 0 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 17, marginBottom: 16, color: '#333' }}>算法分类</h3>
          <ul style={{ listStyle: 'none' }}>
            <li
              onClick={() => handleCategoryClick(null)}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 14,
                background: !selectedCategory ? 'rgba(102,126,234,0.1)' : 'transparent',
                color: !selectedCategory ? '#667eea' : '#555',
                fontWeight: !selectedCategory ? 600 : 400,
                marginBottom: 4,
              }}
            >
              全部分类
            </li>
            {categories.map((cat) => {
              const hasChildren = cat.children && cat.children.length > 0
              const isExpanded = expandedIds.has(cat.id)
              return (
                <li key={cat.id}>
                  <div
                    onClick={() => {
                      if (hasChildren) {
                        toggleExpand(cat.id)
                      } else {
                        handleCategoryClick(cat.id)
                      }
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 14,
                      background: !hasChildren && selectedCategory === cat.id ? 'rgba(102,126,234,0.1)' : 'transparent',
                      color: !hasChildren && selectedCategory === cat.id ? '#667eea' : '#555',
                      fontWeight: !hasChildren && selectedCategory === cat.id ? 600 : 400,
                      marginBottom: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      userSelect: 'none',
                    }}
                  >
                    <span>{cat.name}</span>
                    {hasChildren && (
                      <span style={{ fontSize: 12, color: '#999', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                        ▶
                      </span>
                    )}
                  </div>
                  {hasChildren && isExpanded && cat.children!.map((child) => (
                    <div
                      key={child.id}
                      onClick={() => handleCategoryClick(child.id)}
                      style={{
                        padding: '6px 12px 6px 28px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 13,
                        background: selectedCategory === child.id ? 'rgba(102,126,234,0.1)' : 'transparent',
                        color: selectedCategory === child.id ? '#667eea' : '#777',
                        fontWeight: selectedCategory === child.id ? 600 : 400,
                        marginBottom: 2,
                      }}
                    >
                      {child.name}
                    </div>
                  ))}
                </li>
              )
            })}
          </ul>
        </div>

        <div className="card" style={{ padding: 20, marginTop: 16 }}>
          <h3 style={{ fontSize: 17, marginBottom: 16, color: '#333' }}>难度筛选</h3>
          {DIFFICULTIES.map((d) => (
            <div
              key={d.value}
              onClick={() => handleDifficultyClick(d.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 14,
                background: selectedDifficulty === d.value ? 'rgba(102,126,234,0.1)' : 'transparent',
                color: selectedDifficulty === d.value ? '#667eea' : '#555',
                fontWeight: selectedDifficulty === d.value ? 600 : 400,
                marginBottom: 4,
              }}
            >
              {d.label}
            </div>
          ))}
        </div>
      </aside>

      {/* 右侧列表 */}
      <section style={{ flex: 1 }}>
        {/* 搜索栏 */}
        <div className="card" style={{ display: 'flex', gap: 12, marginBottom: 20, padding: 16 }}>
          <input
            className="form-input"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="搜索算法名称、描述、标签..."
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary" onClick={handleSearch}>搜索</button>
        </div>

        {/* 结果统计 */}
        {total > 0 && (
          <p style={{ fontSize: 14, color: '#888', marginBottom: 12 }}>
            共 {total} 个算法，第 {page}/{totalPages} 页
          </p>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="empty" style={{ color: '#e74c3c' }}>{error}</div>
        )}

        {/* 算法列表 */}
        {!error && (
          loading ? (
            <div className="loading">加载中...</div>
          ) : algorithms.length === 0 ? (
            <div className="empty">暂无算法数据，请先导入数据库初始化脚本</div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {algorithms.map((algo) => (
                  <Link
                    key={algo.id}
                    to={`/algorithm/${algo.id}`}
                    className="card"
                    style={{ textDecoration: 'none', color: 'inherit', padding: 20, transition: 'box-shadow 0.2s' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <h3 style={{ fontSize: 17, color: '#333' }}>{algo.title}</h3>
                      <span className={`difficulty-tag diff-${algo.difficulty}`}>
                        {{ easy: '简单', medium: '中等', hard: '困难' }[algo.difficulty] || algo.difficulty}
                      </span>
                    </div>
                    {algo.description && (
                      <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>
                        {algo.description.length > 120 ? algo.description.slice(0, 120) + '...' : algo.description}
                      </p>
                    )}
                    {algo.tags && (
                      <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {algo.tags.split(',').map((tag) => (
                          <span key={tag} className="tag">{tag.trim()}</span>
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </div>

              {/* 分页控件 */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24 }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => goToPage(page - 1)}
                    disabled={page <= 1}
                    style={{ opacity: page <= 1 ? 0.5 : 1 }}
                  >
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
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= totalPages}
                    style={{ opacity: page >= totalPages ? 0.5 : 1 }}
                  >
                    下一页
                  </button>
                </div>
              )}
            </>
          )
        )}
      </section>
    </div>
  )
}
