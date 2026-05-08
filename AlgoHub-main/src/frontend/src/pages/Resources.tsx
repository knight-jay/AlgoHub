import { useState, useEffect } from 'react'
import { resourceApi } from '../api/resource'
import type { Resource, ResourceCategory } from '../types'

export default function Resources() {
  const [categories, setCategories] = useState<ResourceCategory[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  const fetchResources = async (categoryId: number | null) => {
    setLoading(true)
    try {
      const res = categoryId
        ? await resourceApi.getByCategory(categoryId)
        : await resourceApi.search()
      if (res.data.code === 200) {
        setResources(res.data.data.list)
        setTotal(res.data.data.total)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    resourceApi.getCategories().then((res) => {
      if (res.data.code === 200) setCategories(res.data.data)
    })
    fetchResources(null)
  }, [])

  const handleCategoryClick = (id: number | null) => {
    setSelectedCategory(id)
    fetchResources(id)
  }

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>学习资源推荐</h2>

      {/* 分类筛选 */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <button
          className={`btn ${!selectedCategory ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleCategoryClick(null)}
        >
          全部资源
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`btn ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleCategoryClick(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {total > 0 && (
        <p style={{ fontSize: 14, color: '#888', marginBottom: 16 }}>共 {total} 个资源</p>
      )}

      {loading ? (
        <div className="loading">加载中...</div>
      ) : resources.length === 0 ? (
        <div className="empty">暂无学习资源</div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {resources.map((r) => {
            const cat = categories.find((c) => c.id === r.categoryId)
            return (
              <a
                key={r.id}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card"
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  transition: 'box-shadow 0.2s, transform 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontSize: 17, color: '#333', fontWeight: 600 }}>{r.title}</h3>
                  {cat && (
                    <span className="tag" style={{ fontSize: 12, flexShrink: 0 }}>{cat.name}</span>
                  )}
                </div>
                {r.description && (
                  <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, flex: 1 }}>
                    {r.description}
                  </p>
                )}
                <div style={{ fontSize: 13, color: '#667eea', wordBreak: 'break-all' }}>
                  {r.url}
                </div>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
