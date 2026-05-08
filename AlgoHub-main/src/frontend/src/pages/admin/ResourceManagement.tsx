import { useState, useEffect } from 'react'
import { resourceApi } from '../../api/resource'
import { adminResourceApi } from '../../api/post'
import type { Resource, ResourceCategory } from '../../types'

export default function ResourceManagement() {
  const [resources, setResources] = useState<Resource[]>([])
  const [categories, setCategories] = useState<ResourceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [tab, setTab] = useState<'resources' | 'categories'>('resources')

  // 新建/编辑弹窗
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ title: '', description: '', url: '', categoryId: '', sortOrder: '0' })

  // 分类弹窗
  const [showCatModal, setShowCatModal] = useState(false)
  const [editingCatId, setEditingCatId] = useState<number | null>(null)
  const [catForm, setCatForm] = useState({ name: '', sortOrder: '0' })

  const fetchResources = () => {
    setLoading(true)
    resourceApi.search().then((res) => {
      if (res.data.code === 200) setResources(res.data.data.list)
    }).finally(() => setLoading(false))
  }

  const fetchCategories = () => {
    resourceApi.getCategories().then((res) => {
      if (res.data.code === 200) setCategories(res.data.data)
    })
  }

  useEffect(() => {
    fetchResources()
    fetchCategories()
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm({ title: '', description: '', url: '', categoryId: '', sortOrder: '0' })
    setShowModal(true)
  }

  const openEdit = (r: Resource) => {
    setEditingId(r.id)
    setForm({
      title: r.title,
      description: r.description || '',
      url: r.url,
      categoryId: r.categoryId ? String(r.categoryId) : '',
      sortOrder: String(r.sortOrder ?? 0),
    })
    setShowModal(true)
  }

  const submitResource = async () => {
    if (!form.title.trim() || !form.url.trim()) {
      setMsg('名称和链接不能为空')
      return
    }
    const data = {
      title: form.title.trim(),
      description: form.description.trim(),
      url: form.url.trim(),
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      sortOrder: Number(form.sortOrder),
    }
    try {
      const res = editingId
        ? await adminResourceApi.updateResource(editingId, data)
        : await adminResourceApi.createResource(data)
      if (res.data.code === 200) {
        setMsg(editingId ? '修改成功' : '创建成功')
        setShowModal(false)
        fetchResources()
      } else {
        setMsg(res.data.msg)
      }
    } catch {
      setMsg('操作失败')
    }
  }

  const deleteResource = async (id: number) => {
    if (!confirm('确定删除此资源？')) return
    await adminResourceApi.deleteResource(id)
    setMsg('删除成功')
    fetchResources()
  }

  // 分类操作
  const openCreateCat = () => {
    setEditingCatId(null)
    setCatForm({ name: '', sortOrder: '0' })
    setShowCatModal(true)
  }

  const openEditCat = (cat: ResourceCategory) => {
    setEditingCatId(cat.id)
    setCatForm({ name: cat.name, sortOrder: String(cat.sortOrder ?? 0) })
    setShowCatModal(true)
  }

  const submitCategory = async () => {
    if (!catForm.name.trim()) { setMsg('分类名称不能为空'); return }
    const data = { name: catForm.name.trim(), sortOrder: Number(catForm.sortOrder) }
    try {
      const res = editingCatId
        ? await adminResourceApi.updateCategory(editingCatId, data)
        : await adminResourceApi.createCategory(data)
      if (res.data.code === 200) {
        setMsg(editingCatId ? '修改成功' : '创建成功')
        setShowCatModal(false)
        fetchCategories()
      } else {
        setMsg(res.data.msg)
      }
    } catch {
      setMsg('操作失败')
    }
  }

  const deleteCategory = async (id: number) => {
    if (!confirm('确定删除此分类？')) return
    await adminResourceApi.deleteCategory(id)
    setMsg('删除成功')
    fetchCategories()
  }

  if (loading) return <div className="loading">加载中...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className={`btn btn-sm ${tab === 'resources' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('resources')}>资源管理</button>
          <button className={`btn btn-sm ${tab === 'categories' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('categories')}>分类管理</button>
        </div>
        <button className="btn btn-primary" onClick={tab === 'resources' ? openCreate : openCreateCat}>
          {tab === 'resources' ? '新增资源' : '新增分类'}
        </button>
      </div>

      {msg && (
        <div style={{ padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14, background: '#d4edda', color: '#155724' }}>
          {msg}
        </div>
      )}

      {tab === 'resources' ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                <th style={th}>ID</th>
                <th style={th}>名称</th>
                <th style={th}>描述</th>
                <th style={th}>链接</th>
                <th style={th}>分类</th>
                <th style={th}>操作</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={td}>{r.id}</td>
                  <td style={td}>{r.title}</td>
                  <td style={{ ...td, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description || '-'}</td>
                  <td style={{ ...td, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.url}</td>
                  <td style={td}>{categories.find((c) => c.id === r.categoryId)?.name || '-'}</td>
                  <td style={td}>
                    <button className="btn btn-primary btn-sm" style={{ marginRight: 8 }} onClick={() => openEdit(r)}>编辑</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteResource(r.id)}>删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {resources.length === 0 && <div className="empty">暂无资源</div>}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                <th style={th}>ID</th>
                <th style={th}>名称</th>
                <th style={th}>排序</th>
                <th style={th}>操作</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={td}>{c.id}</td>
                  <td style={td}>{c.name}</td>
                  <td style={td}>{c.sortOrder}</td>
                  <td style={td}>
                    <button className="btn btn-primary btn-sm" style={{ marginRight: 8 }} onClick={() => openEditCat(c)}>编辑</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteCategory(c.id)}>删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && <div className="empty">暂无分类</div>}
        </div>
      )}

      {/* 资源弹窗 */}
      {showModal && (
        <div className="modal-mask" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">{editingId ? '编辑资源' : '新增资源'}</h3>
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={labelStyle}>名称 *</label>
                <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>描述</label>
                <textarea className="form-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>链接 *</label>
                <input className="form-input" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>分类</label>
                  <select className="form-input" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                    <option value="">无</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>排序</label>
                  <input className="form-input" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
                </div>
              </div>
            </div>
            <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={submitResource}>保存</button>
            </div>
          </div>
        </div>
      )}

      {/* 分类弹窗 */}
      {showCatModal && (
        <div className="modal-mask" onClick={() => setShowCatModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">{editingCatId ? '编辑分类' : '新增分类'}</h3>
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={labelStyle}>名称 *</label>
                <input className="form-input" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>排序</label>
                <input className="form-input" type="number" value={catForm.sortOrder} onChange={(e) => setCatForm({ ...catForm, sortOrder: e.target.value })} />
              </div>
            </div>
            <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowCatModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={submitCategory}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', marginBottom: 6, fontSize: 14, color: '#555', fontWeight: 500 }
const th: React.CSSProperties = { textAlign: 'left', padding: '14px 16px', fontWeight: 600, color: '#555', fontSize: 13 }
const td: React.CSSProperties = { padding: '10px 16px', color: '#333' }
