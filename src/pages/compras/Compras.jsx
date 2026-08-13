import { useState, useEffect } from 'react'
import { Plus, Trash2, ShoppingBag, ChevronDown } from 'lucide-react'
import api from '../../api/axios'
import { clp } from '../../utils/formato'

export default function Compras() {
  const [compras, setCompras]         = useState([])
  const [proveedores, setProveedores] = useState([])
  const [productos, setProductos]     = useState([])
  const [modal, setModal]             = useState(false)
  const [cargando, setCargando]       = useState(true)
  const [form, setForm] = useState({
    proveedor_id: '',
    proveedor_nombre: '',
    numero_factura: '',
    observaciones: '',
  })
  const [items, setItems] = useState([])
  const [itemForm, setItemForm] = useState({ producto_id: '', cantidad: '', costo_unitario: '' })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const [comprasRes, provRes, prodRes] = await Promise.all([
        api.get('/compras'),
        api.get('/proveedores'),
        api.get('/productos'),
      ])
      setCompras(comprasRes.data.compras)
      setProveedores(provRes.data.proveedores)
      setProductos(prodRes.data.productos)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setCargando(false)
    }
  }

  const seleccionarProveedor = (id) => {
    const prov = proveedores.find(p => p.id === parseInt(id))
    setForm(f => ({ ...f, proveedor_id: id, proveedor_nombre: prov?.nombre || '' }))
  }

  const agregarItem = () => {
    if (!itemForm.producto_id || !itemForm.cantidad || !itemForm.costo_unitario) return
    const prod = productos.find(p => p.id === parseInt(itemForm.producto_id))
    setItems(prev => [...prev, {
      producto_id: parseInt(itemForm.producto_id),
      producto_nombre: prod?.nombre || '',
      emoji: prod?.emoji || '📦',
      cantidad: parseFloat(itemForm.cantidad),
      costo_unitario: parseFloat(itemForm.costo_unitario),
    }])
    setItemForm({ producto_id: '', cantidad: '', costo_unitario: '' })
  }

  const eliminarItem = (i) => setItems(prev => prev.filter((_, idx) => idx !== i))

  const totalCompra = items.reduce((s, i) => s + i.cantidad * i.costo_unitario, 0)

  const guardar = async () => {
    if (!form.proveedor_nombre || items.length === 0) return
    try {
      await api.post('/compras', { ...form, items })
      await cargarDatos()
      setModal(false)
      setItems([])
      setForm({ proveedor_id: '', proveedor_nombre: '', numero_factura: '', observaciones: '' })
    } catch (err) {
      alert('Error al registrar la compra')
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Compras a proveedores</h1>
          <p className="text-sm text-gray-400 mt-0.5">Registra entradas de mercadería — el stock se actualiza automáticamente</p>
        </div>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm transition-colors">
          <Plus size={16}/> Nueva compra
        </button>
      </div>

      {/* Lista compras */}
      {cargando ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Fecha</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Proveedor</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Factura</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Total</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500">Estado</th>
              </tr>
            </thead>
            <tbody>
              {compras.map(c => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(c.created_at).toLocaleDateString('es-CL')}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{c.proveedor_nombre}</td>
                  <td className="px-4 py-3 text-gray-500">{c.numero_factura || '-'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{clp(c.total)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      {c.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {compras.length === 0 && (
            <div className="flex flex-col items-center py-16 text-gray-300">
              <ShoppingBag size={36} className="mb-2 opacity-40"/>
              <p className="text-sm">Sin compras registradas</p>
            </div>
          )}
        </div>
      )}

      {/* Modal nueva compra */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900">Nueva compra</h2>
              <button onClick={() => { setModal(false); setItems([]) }}
                className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              {/* Datos compra */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Proveedor *</label>
                  <select value={form.proveedor_id} onChange={e => seleccionarProveedor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200">
                    <option value="">Seleccionar proveedor...</option>
                    {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">N° Factura</label>
                  <input value={form.numero_factura} onChange={e => setForm(f=>({...f,numero_factura:e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                    placeholder="001-2024"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Observaciones</label>
                  <input value={form.observaciones} onChange={e => setForm(f=>({...f,observaciones:e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                    placeholder="Opcional"/>
                </div>
              </div>

              {/* Agregar productos */}
              <div className="border border-gray-100 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Agregar productos</h3>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="col-span-1">
                    <select value={itemForm.producto_id} onChange={e => setItemForm(f=>({...f,producto_id:e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200">
                      <option value="">Producto...</option>
                      {productos.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <input type="number" value={itemForm.cantidad} onChange={e => setItemForm(f=>({...f,cantidad:e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                      placeholder="Cantidad"/>
                  </div>
                  <div>
                    <input type="number" value={itemForm.costo_unitario} onChange={e => setItemForm(f=>({...f,costo_unitario:e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                      placeholder="Costo unitario"/>
                  </div>
                </div>
                <button onClick={agregarItem}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 transition-colors">
                  <Plus size={14}/> Agregar producto
                </button>
              </div>

              {/* Lista items */}
              {items.length > 0 && (
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Producto</th>
                        <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Cantidad</th>
                        <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Costo unit.</th>
                        <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Total</th>
                        <th className="px-3 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, i) => (
                        <tr key={i} className="border-b border-gray-50">
                          <td className="px-3 py-2">{item.emoji} {item.producto_nombre}</td>
                          <td className="px-3 py-2 text-right">{item.cantidad}</td>
                          <td className="px-3 py-2 text-right">{clp(item.costo_unitario)}</td>
                          <td className="px-3 py-2 text-right font-semibold">{clp(item.cantidad * item.costo_unitario)}</td>
                          <td className="px-3 py-2">
                            <button onClick={() => eliminarItem(i)} className="text-red-400 hover:text-red-600">
                              <Trash2 size={13}/>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-3 py-2 bg-gray-50 flex justify-between items-center">
                    <span className="text-xs text-gray-500">{items.length} producto{items.length !== 1 ? 's' : ''}</span>
                    <span className="text-sm font-semibold text-gray-900">Total: {clp(totalCompra)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 pb-6 pt-3 border-t border-gray-100 flex gap-3">
              <button onClick={() => { setModal(false); setItems([]) }}
                className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={guardar} disabled={!form.proveedor_nombre || items.length === 0}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                Registrar compra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}