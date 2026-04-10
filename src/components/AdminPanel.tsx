import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
type Category = {
  id: number
  name: string
}

type Product = {
  id: number
  name: string
  price: number
  description: string | null
  stock: number
  categoryId: number | null
}


type Order = {
  id: string
  date: string
  total: number
  user: { username: string; email: string }
  items: { name: string; quantity: number; price: number }[]
}

type AdminPanelProps = {
  apiBaseUrl: string
  token: string | null
}

export function AdminPanel({ apiBaseUrl, token }: AdminPanelProps) {
  const navigate = useNavigate()
  const onClose = () => navigate('/')

  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'warehouse' | 'reports'>('products')
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [reports, setReports] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)

  const [newCategory, setNewCategory] = useState('')
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 0,
    description: '',
    stock: 0,
    categoryId: ''
  })


  useEffect(() => {
    if (token) {
      fetchData()
    }
  }, [activeTab, token])


  const fetchData = async () => {
    setLoading(true)
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      if (activeTab === 'categories' || activeTab === 'products' || activeTab === 'warehouse') {
        const catRes = await fetch(`${apiBaseUrl}/admin/categories`, { headers })
        setCategories(await catRes.json())
      }

      if (activeTab === 'products' || activeTab === 'warehouse') {
        const prodRes = await fetch(`${apiBaseUrl}/admin/products`, { headers })
        setProducts(await prodRes.json())
      }

      if (activeTab === 'reports') {
        const repRes = await fetch(`${apiBaseUrl}/admin/reports/orders`, { headers })
        setReports(await repRes.json())
      }
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch(`${apiBaseUrl}/admin/categories`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory })
      })
      setNewCategory('')
      fetchData()
    } catch (err) {}
  }

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('CONFIRM_DELETION?')) return
    try {
      await fetch(`${apiBaseUrl}/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      fetchData()
    } catch (err) {}
  }

  const handleRenameCategory = async (id: number, currentName: string) => {
    const name = prompt('ENTER_NEW_CATEGORY_NAME:', currentName)
    if (!name) return
    try {
      await fetch(`${apiBaseUrl}/admin/categories/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      fetchData()
    } catch (err) {}
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch(`${apiBaseUrl}/admin/products`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProduct,
          price: Number(newProduct.price),
          stock: Number(newProduct.stock),
          categoryId: newProduct.categoryId ? Number(newProduct.categoryId) : null
        })
      })
      setNewProduct({ name: '', price: 0, description: '', stock: 0, categoryId: '' })
      fetchData()
    } catch (err) {}
  }


  const handleDeleteProduct = async (id: number) => {
    if (!confirm('CONFIRM_DELETION?')) return
    try {
      await fetch(`${apiBaseUrl}/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      fetchData()
    } catch (err) {}
  }

  const handleUpdateStock = async (id: number, newStock: number) => {
    try {
      await fetch(`${apiBaseUrl}/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      })
      fetchData()
    } catch (err) {}
  }

  return (
    <div className="flex flex-col h-full bg-hacker-bg border-4 border-hacker-glow shadow-[0_0_100px_var(--color-hacker-glow)] overflow-hidden">

        
        {/* HEADER */}
        <div className="p-6 border-b-2 border-hacker-glow flex justify-between items-center bg-hacker-bg/50">
          <div>
            <h2 className="text-3xl font-bold glow-text animate-glitch uppercase tracking-widest">{`[ ADMIN_TERMINAL_v1.0 ]`}</h2>
            <p className="text-[10px] opacity-70 font-mono mt-1">SENSITIVE_DATA_ACCESS // AUTHORIZED_PERSONNEL_ONLY</p>
          </div>
          <button onClick={onClose} className="text-red-600 hover:glow-text text-2xl font-bold transition-all hover:scale-110">[X]</button>
        </div>

        {/* TABS */}
        <div className="flex bg-hacker-glow/5 border-b border-hacker-glow">
          {(['products', 'categories', 'warehouse', 'reports'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === tab 
                ? 'bg-hacker-glow text-hacker-bg shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]' 
                : 'text-hacker-glow hover:bg-hacker-glow/20'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-16 h-16 border-4 border-hacker-glow border-t-transparent rounded-full animate-spin"></div>
              <p className="glow-text animate-pulse font-mono uppercase">SYNCHRONIZING_DATA...</p>
            </div>
          )}

          {!loading && activeTab === 'categories' && (
            <div className="space-y-8 animate-fadeIn">
              <section className="hacker-border p-6 bg-hacker-bg/30">
                <h3 className="text-xl font-bold glow-text mb-4 uppercase">Register_New_Category</h3>
                <form onSubmit={handleCreateCategory} className="flex gap-4">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    placeholder="CATEGORY_NAME"
                    className="flex-1 bg-hacker-terminal/20 border border-hacker-glow/50 p-3 text-hacker-green focus:border-hacker-glow focus:outline-none focus:shadow-[0_0_15px_var(--color-hacker-glow)] font-mono uppercase"
                  />
                  <button type="submit" className="border-2 border-hacker-glow px-8 transition-all hover:bg-hacker-glow hover:text-hacker-bg font-bold uppercase">EXEC_CREATE</button>
                </form>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categories.map(cat => (
                  <div key={cat.id} className="hacker-border p-4 bg-hacker-glow/5 flex justify-between items-center group gap-3">
                    <div className="min-w-0">
                      <span className="font-mono block truncate">{cat.name.toUpperCase()}</span>
                      <span className="text-[10px] opacity-30">ID: {cat.id}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleRenameCategory(cat.id, cat.name)}
                        className="text-hacker-glow hover:glow-text uppercase font-bold text-xs"
                      >
                        [ EDIT ]
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="text-red-600 hover:glow-text uppercase font-bold text-xs"
                      >
                        [ DEL ]
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && activeTab === 'products' && (
            <div className="space-y-8 animate-fadeIn">
              <section className="hacker-border p-6 bg-hacker-bg/30">
                <h3 className="text-xl font-bold glow-text mb-4 uppercase">Upload_Resource_Definition</h3>
                <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <input
                      required
                      type="text"
                      placeholder="NAME"
                      className="w-full bg-hacker-terminal/20 border border-hacker-glow/50 p-2 text-hacker-green focus:border-hacker-glow focus:outline-none font-mono"
                      value={newProduct.name}
                      onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    />
                    <input
                      required
                      type="number"
                      placeholder="PRICE (PLN)"
                      className="w-full bg-hacker-terminal/20 border border-hacker-glow/50 p-2 text-hacker-green focus:border-hacker-glow focus:outline-none font-mono"
                      value={newProduct.price}
                      onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                    />
                    <input
                      required
                      type="number"
                      min={0}
                      placeholder="STOCK"
                      className="w-full bg-hacker-terminal/20 border border-hacker-glow/50 p-2 text-hacker-green focus:border-hacker-glow focus:outline-none font-mono"
                      value={newProduct.stock}
                      onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                    />
                    <select
                      className="w-full bg-hacker-terminal/20 border border-hacker-glow/50 p-2 text-hacker-green focus:border-hacker-glow focus:outline-none font-mono"
                      value={newProduct.categoryId}
                      onChange={e => setNewProduct({...newProduct, categoryId: e.target.value})}
                    >
                      <option value="">-- SELECT_CATEGORY --</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-4">
                    <textarea
                      placeholder="DESCRIPTION"
                      className="w-full h-24 bg-hacker-terminal/20 border border-hacker-glow/50 p-2 text-hacker-green focus:border-hacker-glow focus:outline-none font-mono"
                      value={newProduct.description}
                      onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                    />
                  </div>


                  <div className="md:col-span-2">
                    <button type="submit" className="w-full py-3 border-2 border-hacker-glow text-hacker-green font-bold uppercase transition-all hover:bg-hacker-glow hover:text-hacker-bg hover:shadow-[0_0_20px_var(--color-hacker-glow)]">COMMIT_CHANGES</button>
                  </div>
                </form>
              </section>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-sm">
                  <thead>
                    <tr className="border-b-2 border-hacker-glow text-hacker-glow uppercase">
                      <th className="py-2 px-4">ID</th>
                      <th className="py-2 px-4">NAME</th>
                      <th className="py-2 px-4">PRICE</th>
                      <th className="py-2 px-4">CATEGORY</th>
                      <th className="py-2 px-4">STOCK</th>
                      <th className="py-2 px-4">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className="border-b border-hacker-glow/20 hover:bg-hacker-glow/5 group">
                        <td className="py-3 px-4 opacity-50">{p.id}</td>
                        <td className="py-3 px-4 font-bold">{p.name}</td>
                        <td className="py-3 px-4 text-hacker-green">{p.price.toFixed(2)} zł</td>
                        <td className="py-3 px-4 uppercase text-xs">{(p as any).category?.name || '---'}</td>
                        <td className="py-3 px-4">{p.stock}</td>
                        <td className="py-3 px-4">
                          <button onClick={() => handleDeleteProduct(p.id)} className="text-red-600 hover:glow-text uppercase font-bold text-xs">[ DEL ]</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!loading && activeTab === 'warehouse' && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-xl font-bold glow-text uppercase mb-6">Inventory_Adjustment_Console</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(p => (
                  <div key={p.id} className="hacker-border p-6 bg-hacker-bg/40 flex flex-col gap-4 relative group">
                    <div className="absolute top-2 right-2 flex gap-1">
                      <div className={`w-2 h-2 rounded-full ${p.stock > 10 ? 'bg-green-500' : p.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`}></div>
                    </div>
                    <p className="font-bold border-b border-hacker-glow/30 pb-2">{p.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs opacity-60">CURRENT_LEVEL:</span>
                      <span className={`text-xl font-bold ${p.stock === 0 ? 'text-red-500' : 'text-hacker-green'}`}>{p.stock}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleUpdateStock(p.id, Math.max(0, p.stock - 1))} className="flex-1 border border-hacker-glow py-1 hover:bg-hacker-glow/20">-1</button>
                      <button onClick={() => handleUpdateStock(p.id, p.stock + 1)} className="flex-1 border border-hacker-glow py-1 hover:bg-hacker-glow/20">+1</button>
                      <button onClick={() => {
                        const n = prompt('ENTER_EXACT_QUANTITY:', p.stock.toString())
                        if (n !== null) handleUpdateStock(p.id, Number(n))
                      }} className="flex-1 border border-hacker-glow py-1 hover:bg-hacker-glow/20">SET</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && activeTab === 'reports' && (
            <div className="animate-fadeIn">
              <h3 className="text-xl font-bold glow-text uppercase mb-6">Historical_Resource_Transfers</h3>
              <div className="space-y-4">
                {reports.map(rep => (
                  <div key={rep.id} className="hacker-border p-6 bg-hacker-bg/40 space-y-4">
                    <div className="flex justify-between items-start border-b border-hacker-glow/30 pb-4">
                      <div>
                        <p className="text-hacker-glow font-bold">ORDER_ID: {rep.id}</p>
                        <p className="text-[10px] opacity-60 uppercase">{new Date(rep.date).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase">ENTITY: <span className="text-hacker-green">{rep.user.username}</span></p>
                        <p className="text-[10px] opacity-60">{rep.user.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                        {rep.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm py-1 border-b border-white/5 last:border-0 font-mono">
                            <span>{item.quantity}x {item.name}</span>
                            <span>{(item.quantity * item.price).toFixed(2)} zł</span>
                          </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-hacker-glow/30">
                      <span className="font-bold glow-text">TOTAL_RECOVERY:</span>
                      <span className="text-xl font-bold text-hacker-green">{rep.total.toFixed(2)} zł</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <footer className="p-4 bg-hacker-glow/5 border-t border-hacker-glow text-[10px] opacity-50 font-mono flex justify-between uppercase">
          <span>Connection: STABLE</span>
          <span>Security_Level: OMEGA</span>
        </footer>
    </div>
  )
}



