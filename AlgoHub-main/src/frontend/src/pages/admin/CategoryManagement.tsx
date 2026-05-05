import { useState, useEffect } from 'react'
import { adminApi } from '../../api/admin'
import { algorithmApi } from '../../api/algorithm'
import type { AlgorithmCategory } from '../../types'

export default function CategoryManagement() {
  const [categories, setCategories] = useState<AlgorithmCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  // 弹窗
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', parentId: '', sortOrder: '0' })

  const fetchCategories = () => {
    setLoading(true)
    algorithmApi.getCategories().then((res) => {
      if (res.data.code === 200) setCategories(res.data.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchCategories() }, [])

  const openCreate = (parentId: number | null = null) => {
    setEditingId(null)
    setForm({ name: '', parentId: parentId ? String(parentId) : '', sortOrder: '0' })
    setShowModal(true)
  }

  const openEdit = (cat: AlgorithmCategory) => {
    setEditingId(cat.id)
    setForm({
      name: cat.name,
      parentId: cat.parentId ? String(cat.parentId) : '',
      sortOrder: String(cat.sortOrder ?? 0),
    })
    setShowModal(true)
  }

  const submit = async () => {
    if (!form.name.trim()) {
      setMsg('分类名称不能为空')
      return
    }
    const data = {
      name: form.name.trim(),
      parentId: form.parentId ? Number(form.parentId) : null,
      sortOrder: Number(form.sortOrder),
    }
    try {
      const res = editingId
        ? await adminApi.updateCategory(editingId, data)
        : await adminApi.createCategory(data)
      if (res.data.code === 200) {
        setMsg(editingId ? '修改成功' : '创建成功')
        setShowModal(false)
        fetchCategories()
      } else {
        setMsg(res.data.msg)
      }
    } catch {
      setMsg('操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除该分类？')) return
    const res = await adminApi.deleteCategory(id)
    if (res.data.code === 200) {
      setMsg('删除成功')
      fetchCategories()
    } else {
      setMsg(res.data.msg)
    }
  }

  // 递归渲染分类树
  const renderTree = (cats: AlgorithmCategory[], level: number = 0): React.ReactNode[] =>
    cats.map((cat) => (
      <div key={cat.id}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px', borderBottom: '1px solid #f0f0f0',
          paddingLeft: 16 + level * 24,
        }}>
          <span style={{ fontSize: 14 }}>
            {level > 0 && <span style={{ color: '#ccc', marginRight: 8 }}>└</span>}
            {cat.name}
            <span style={{ color: '#999', fontSize: 12, marginLeft: 10 }}>ID:{cat.id} 排序:{cat.sortOrder}</span>
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={() => openCreate(cat.id)}>添加子分类</button>
            <button className="btn btn-primary btn-sm" onClick={() => openEdit(cat)}>编辑</button>
            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat.id)}>删除</button>
          </div>
        </div>
        {cat.children && cat.children.length > 0 && renderTree(cat.children, level + 1)}
      </div>
    ))

  if (loading) return <div className="loading">加载中...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600 }}>分类管理</h2>
        <button className="btn btn-primary" onClick={() => openCreate(null)}>新增顶级分类</button>
      </div>
      {msg && (
        <div style={{ padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14, background: '#d4edda', color: '#155724' }}>
          {msg}
        </div>
      )}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {categories.length === 0 ? (
          <div className="empty">暂无分类</div>
        ) : (
          renderTree(categories)
        )}
      </div>

      {/* 新建/编辑弹窗 */}
      {showModal && (
        <div className="modal-mask" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">{editingId ? '编辑分类' : '新增分类'}</h3>
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={labelStyle}>分类名称 *</label>
                <input className="form-input" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>父分类</label>
                <select className="form-input" value={form.parentId}
                  onChange={(e) => setForm({ ...form, parentId: e.target.value })}>
                  <option value="">顶级分类</option>
                  {flatten(categories).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>排序</label>
                <input className="form-input" type="number" value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
              </div>
            </div>
            <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={submit}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function flatten(cats: AlgorithmCategory[]): AlgorithmCategory[] {
  const result: AlgorithmCategory[] = []
  const walk = (list: AlgorithmCategory[], prefix: string) => {
    list.forEach((c) => {
      result.push({ ...c, name: prefix + c.name })
      if (c.children) walk(c.children, prefix + '  ')
    })
  }
  walk(cats, '')
  return result
}

const labelStyle: React.CSSProperties = { display: 'block', marginBottom: 6, fontSize: 14, color: '#555', fontWeight: 500 }
