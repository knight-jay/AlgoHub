import { useState, useEffect } from 'react'
import { adminApi } from '../../api/admin'
import { algorithmApi } from '../../api/algorithm'
import type { Algorithm, AlgorithmCategory } from '../../types'

export default function AlgorithmManagement() {
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([])
  const [categories, setCategories] = useState<AlgorithmCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  // 新建/编辑弹窗
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<Partial<Algorithm>>({
    title: '', description: '', usageIntro: '', cppTemplate: '',
    categoryId: null, difficulty: 'medium', tags: '',
  })

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      algorithmApi.search(''),
      algorithmApi.getCategories(),
    ]).then(([algRes, catRes]) => {
      if (algRes.data.code === 200) setAlgorithms(algRes.data.data.list)
      if (catRes.data.code === 200) setCategories(catRes.data.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm({ title: '', description: '', usageIntro: '', cppTemplate: '', categoryId: null, difficulty: 'medium', tags: '' })
    setShowModal(true)
  }

  const openEdit = (algo: Algorithm) => {
    setEditingId(algo.id)
    setForm({
      title: algo.title,
      description: algo.description || '',
      usageIntro: algo.usageIntro || '',
      cppTemplate: algo.cppTemplate || '',
      categoryId: algo.categoryId,
      difficulty: algo.difficulty,
      tags: algo.tags || '',
    })
    setShowModal(true)
  }

  const submit = async () => {
    if (!form.title?.trim()) {
      setMsg('标题不能为空')
      return
    }
    try {
      const res = editingId
        ? await adminApi.updateAlgorithm(editingId, form)
        : await adminApi.createAlgorithm(form)
      if (res.data.code === 200) {
        setMsg(editingId ? '修改成功' : '创建成功')
        setShowModal(false)
        fetchData()
      } else {
        setMsg(res.data.msg)
      }
    } catch {
      setMsg('操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除该算法？')) return
    const res = await adminApi.deleteAlgorithm(id)
    if (res.data.code === 200) {
      setMsg('删除成功')
      fetchData()
    } else {
      setMsg(res.data.msg)
    }
  }

  // 递归收集所有分类
  const flatCategories = (cats: AlgorithmCategory[]): AlgorithmCategory[] => {
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

  if (loading) return <div className="loading">加载中...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600 }}>算法管理</h2>
        <button className="btn btn-primary" onClick={openCreate}>新增算法</button>
      </div>
      {msg && (
        <div style={{ padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14, background: '#d4edda', color: '#155724' }}>
          {msg}
        </div>
      )}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
              <th style={th}>ID</th>
              <th style={th}>标题</th>
              <th style={th}>难度</th>
              <th style={th}>分类ID</th>
              <th style={th}>标签</th>
              <th style={th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {algorithms.map((a) => (
              <tr key={a.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={td}>{a.id}</td>
                <td style={td}>{a.title}</td>
                <td style={td}>
                  <span className={`difficulty-tag diff-${a.difficulty}`}>
                    {{ easy: '简单', medium: '中等', hard: '困难' }[a.difficulty]}
                  </span>
                </td>
                <td style={td}>{a.categoryId ?? '-'}</td>
                <td style={{ ...td, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {a.tags || '-'}
                </td>
                <td style={td}>
                  <button className="btn btn-primary btn-sm" style={{ marginRight: 8 }} onClick={() => openEdit(a)}>编辑</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id)}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 新建/编辑弹窗 */}
      {showModal && (
        <div className="modal-mask" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">{editingId ? '编辑算法' : '新增算法'}</h3>
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={labelStyle}>标题 *</label>
                <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>描述</label>
                <textarea className="form-input" rows={3} value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>用法说明</label>
                <textarea className="form-input" rows={3} value={form.usageIntro || ''}
                  onChange={(e) => setForm({ ...form, usageIntro: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>C++ 模板</label>
                <textarea className="form-input" rows={4} value={form.cppTemplate || ''}
                  onChange={(e) => setForm({ ...form, cppTemplate: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>难度</label>
                  <select className="form-input" value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                    <option value="easy">简单</option>
                    <option value="medium">中等</option>
                    <option value="hard">困难</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>分类</label>
                  <select className="form-input" value={form.categoryId || ''}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value ? Number(e.target.value) : null })}>
                    <option value="">无</option>
                    {flatCategories(categories).map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>标签（逗号分隔）</label>
                <input className="form-input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
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

const labelStyle: React.CSSProperties = { display: 'block', marginBottom: 6, fontSize: 14, color: '#555', fontWeight: 500 }
const th: React.CSSProperties = { textAlign: 'left', padding: '14px 16px', fontWeight: 600, color: '#555', fontSize: 13 }
const td: React.CSSProperties = { padding: '10px 16px', color: '#333' }
