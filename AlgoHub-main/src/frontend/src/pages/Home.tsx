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

export default function Home() {
  const [categories, setCategories] = useState<AlgorithmCategory[]>([])
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([])
  const [keyword, setKeyword] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)

  const fetchAlgorithms = useCallback(async (categoryId: number | null, difficulty: string) => {
    setLoading(true)
    try {
      if (categoryId) {
        const res = await algorithmApi.getByCategory(categoryId)
        if (res.data.code === 200) {
          setAlgorithms(res.data.data)
          setTotal(res.data.data.length)
        }
      } else if (difficulty) {
        const res = await algorithmApi.getByDifficulty(difficulty)
        if (res.data.code === 200) {
          setAlgorithms(res.data.data)
          setTotal(res.data.data.length)
        }
      } else {
        // 默认搜索空关键词获取全部
        const res = await algorithmApi.search('')
        if (res.data.code === 200) {
          setAlgorithms(res.data.data.list)
          setTotal(res.data.data.total)
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearch = async () => {
    if (!keyword.trim()) {
      fetchAlgorithms(null, '')
      return
    }
    setSelectedCategory(null)
    setSelectedDifficulty('')
    setLoading(true)
    try {
      const res = await algorithmApi.search(keyword.trim())
      if (res.data.code === 200) {
        setAlgorithms(res.data.data.list)
        setTotal(res.data.data.total)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = (id: number | null) => {
    setSelectedCategory(id)
    setSelectedDifficulty('')
    setKeyword('')
    fetchAlgorithms(id, '')
  }

  const handleDifficultyClick = (d: string) => {
    setSelectedDifficulty(d)
    setSelectedCategory(null)
    setKeyword('')
    fetchAlgorithms(null, d)
  }

  useEffect(() => {
    // 加载分类树
    algorithmApi.getCategories().then((res) => {
      if (res.data.code === 200) setCategories(res.data.data)
    })
    // 初始加载算法
    fetchAlgorithms(null, '')
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
            {categories.map((cat) => (
              <li key={cat.id}>
                <div
                  onClick={() => handleCategoryClick(cat.id)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 14,
                    background: selectedCategory === cat.id ? 'rgba(102,126,234,0.1)' : 'transparent',
                    color: selectedCategory === cat.id ? '#667eea' : '#555',
                    fontWeight: selectedCategory === cat.id ? 600 : 400,
                    marginBottom: 4,
                  }}
                >
                  {cat.name}
                </div>
                {cat.children?.map((child) => (
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
            ))}
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
          <p style={{ fontSize: 14, color: '#888', marginBottom: 12 }}>共 {total} 个算法</p>
        )}

        {/* 算法列表 */}
        {loading ? (
          <div className="loading">加载中...</div>
        ) : algorithms.length === 0 ? (
          <div className="empty">暂无算法数据</div>
        ) : (
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
        )}
      </section>
    </div>
  )
}
