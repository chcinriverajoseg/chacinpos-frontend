import { useState } from 'react'
import { Plus, Search, Edit2, Trash2, AlertTriangle, Package } from 'lucide-react'
import { useInventarioStore } from '../../store/useStore'
import { clp, estadoStock } from '../../utils/formato'

const CATEGORIAS = ['Panadería','Lácteos','Carnicería','Abarrotes','Bebidas','Verduras','Limpieza','Otro']
const TIPOS      = [{ value:'unidad', label:'Por unidad' }, { value:'kilo', label:'Por kilo' }, { value:'peso', label:'Por peso (gr)' }]

const PROD_VACIO = { nombre:'', codigo:'', categoria:'Abarrotes', tipo:'unidad', precio:'', costo:'', stock:'', stockMin:'5', emoji:'📦', activo:true }

export default function Inventario() {
  const { productos, agregarProducto, actualizarProducto, eliminarProducto } = useInventarioStore()
  const [busqueda, setBusqueda] = useState('')
  const [modal, setModal]       = useState(false)
  const [form, setForm]         = useState(PROD_VACIO)
  const [editId, setEditId]     = useState(null)

  const prods = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.codigo.includes(busqueda) ||
    p.categoria.toLowerCase().includes(busqueda.toLowerCase())
  )

  const stockBajos  = productos.filter(p => p.stock > 0 && p.stock <= p.stockMin).length
  const sinStock    = productos.filter(p => p.stock === 0 && p.activo).length

  const abrirNuevo = () => { setForm(PROD_VACIO); setEditId(null); setModal(true) }
  const abrirEditar = (p) => {
    setForm({ ...p, precio: String(p.precio), costo: String(p.costo), stock: String(p.stock), stockMin: String(p.stockMin) })
    setEditId(p.id)
    setModal(true)
  }
  const cerrar = () => { setModal(false); setEditId(null) }

  const guardar = () => {
    if (!form.nombre || !form.precio) return
    const datos = { ...form, precio: parseFloat(form.precio), costo: parseFloat(form.costo)||0, stock: parseInt(form.stock)||0, stockMin: parseInt(form.stockMin)||3 }
    if (editId) actualizarProducto(editId, datos)
    else agregarProducto(datos)
    cerrar()
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Alertas rápidas */}
      {(stockBajos > 0 || sinStock > 0) && (
        <div className="flex gap-3 mb-5">
          {sinStock > 0 && <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700"><AlertTriangle size={15}/>{sinStock} sin stock</div>}
          {stockBajos > 0 && <div className="flex items-center gap-2 px-4 py-2 bg-warn-50 border border-warn-50 rounded-xl text-sm text-warn-600"><AlertTriangle size={15}/>{stockBajos} stock bajo</div>}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} className="input pl-9" placeholder="Buscar producto, código o categoría..."/>
        </div>
        <button onClick={abrirNuevo} className="btn-primary"><Plus size={16}/> Nuevo producto</button>
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Producto</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Categoría</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Tipo</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Costo</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Precio</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Stock</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-gray-500">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {prods.map(p => {
              const est = estadoStock(p)
              return (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{p.emoji}</span>
                      <div>
                        <p className="font-medium text-gray-900">{p.nombre}</p>
                        <p className="text-xs text-gray-400">#{p.codigo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.categoria}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.tipo === 'unidad' ? 'bg-blue-50 text-blue-700' :
                      p.tipo === 'kilo'   ? 'bg-purple-50 text-purple-700' :
                                            'bg-orange-50 text-orange-700'
                    }`}>{p.tipo.toUpperCase()}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">{clp(p.costo)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{clp(p.precio)}</td>
                  <td className="px-4 py-3 text-right font-medium">{p.stock}</td>
                  <td className="px-4 py-3 text-center">
                    {est === 'sin-stock' && <span className="badge-red">Sin stock</span>}
                    {est === 'bajo'      && <span className="badge-yellow">Stock bajo</span>}
                    {est === 'ok'        && <span className="badge-green">OK</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => abrirEditar(p)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"><Edit2 size={14}/></button>
                      <button onClick={() => eliminarProducto(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {prods.length === 0 && (
          <div className="flex flex-col items-center py-16 text-gray-300">
            <Package size={36} className="mb-2 opacity-40"/>
            <p className="text-sm">No se encontraron productos</p>
          </div>
        )}
      </div>

      {/* Modal producto */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-5">{editId ? 'Editar producto' : 'Nuevo producto'}</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="label">Nombre *</label>
                  <input value={form.nombre} onChange={e => setForm(f=>({...f,nombre:e.target.value}))} className="input" placeholder="Pan amasado"/>
                </div>
                <div>
                  <label className="label">Código</label>
                  <input value={form.codigo} onChange={e => setForm(f=>({...f,codigo:e.target.value}))} className="input" placeholder="001"/>
                </div>
                <div>
                  <label className="label">Emoji</label>
                  <input value={form.emoji} onChange={e => setForm(f=>({...f,emoji:e.target.value}))} className="input" maxLength={2}/>
                </div>
                <div>
                  <label className="label">Categoría</label>
                  <select value={form.categoria} onChange={e => setForm(f=>({...f,categoria:e.target.value}))} className="input">
                    {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Tipo de venta</label>
                  <select value={form.tipo} onChange={e => setForm(f=>({...f,tipo:e.target.value}))} className="input">
                    {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Costo</label>
                  <input type="number" value={form.costo} onChange={e => setForm(f=>({...f,costo:e.target.value}))} className="input" placeholder="0"/>
                </div>
                <div>
                  <label className="label">Precio venta *</label>
                  <input type="number" value={form.precio} onChange={e => setForm(f=>({...f,precio:e.target.value}))} className="input" placeholder="0"/>
                </div>
                <div>
                  <label className="label">Stock inicial</label>
                  <input type="number" value={form.stock} onChange={e => setForm(f=>({...f,stock:e.target.value}))} className="input" placeholder="0"/>
                </div>
                <div>
                  <label className="label">Stock mínimo alerta</label>
                  <input type="number" value={form.stockMin} onChange={e => setForm(f=>({...f,stockMin:e.target.value}))} className="input" placeholder="5"/>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={cerrar} className="btn-secondary flex-1 justify-center">Cancelar</button>
              <button onClick={guardar} className="btn-primary flex-1 justify-center">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
