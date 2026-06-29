import { useState, useEffect, useRef } from 'react'
import { Search, Plus, Minus, Trash2, CreditCard, X, ShoppingCart, Barcode } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { clp, totalItem, subtotalCarro, calcIVA, calcNeto, precioLabel, estadoStock } from '../../utils/formato'
import ModalCobro from './ModalCobro'
import { getProductos } from '../../api/productos'

const CATEGORIAS = ['Todos', 'Panaderia', 'Lacteos', 'Carniceria', 'Abarrotes', 'Bebidas', 'Verduras', 'Limpieza', 'otros']

export default function POS() {
  const { carro, agregarProducto, cambiarCantidad, eliminarDelCarro, limpiarCarro, cajaAbierta } = useStore()
  const [productos, setProductos] = useState([])
  const [cargando, setCargando]   = useState(true)
  const [busqueda, setBusqueda]   = useState('')
  const [categoria, setCategoria] = useState('Todos')
  const [modalCobro, setModalCobro] = useState(false)

  useEffect(() => {
    getProductos()
      .then(res => setProductos(res.data.productos))
      .catch(err => console.error('Error cargando productos:', err))
      .finally(() => setCargando(false))
  }, [])

  const prodsFiltrados = productos.filter(p => {
    if (!p.activo) return false
    const matchCat  = categoria === 'Todos' || p.categoria === categoria
    const matchBusc = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.codigo.includes(busqueda)
    return matchCat && matchBusc
  })

  const subtotal = subtotalCarro(carro)
  const iva      = calcIVA(subtotal)
  const neto     = calcNeto(subtotal)

  const handleAgregar = (prod) => {
    if (prod.stock === 0) return
    if (prod.tipo === 'kilo' || prod.tipo === 'peso') {
      const label  = prod.tipo === 'kilo' ? 'kg' : 'gramos'
      const defVal = prod.tipo === 'kilo' ? '0.5' : '250'
      const cant   = parseFloat(prompt(`Cantidad en ${label} para "${prod.nombre}":`, defVal))
      if (!cant || cant <= 0) return
      agregarProducto(prod, cant)
    } else {
      agregarProducto(prod, 1)
    }
  }

  if (cargando) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col p-4 gap-3 overflow-hidden">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o código..."
              className="w-full px-3 py-2 pl-9 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
              autoFocus />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Barcode size={18} />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 flex-shrink-0">
          {CATEGORIAS.map(cat => (
            <button key={cat} onClick={() => setCategoria(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0
                ${categoria === cat ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-700'}`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {prodsFiltrados.map(prod => {
              const estado = estadoStock(prod)
              return (
                <button key={prod.id} onClick={() => handleAgregar(prod)}
                  disabled={estado === 'sin-stock'}
                  className={`bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-left transition-all hover:shadow-md hover:border-green-200 active:scale-95 ${estado === 'sin-stock' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                  <div className="text-3xl mb-2">{prod.emoji}</div>
                  <p className="text-xs font-medium text-gray-900 leading-tight line-clamp-2 mb-1">{prod.nombre}</p>
                  <p className="text-sm font-semibold text-green-600">{precioLabel(prod)}</p>
                  <div className="mt-1.5">
                    {estado === 'sin-stock' && <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">Sin stock</span>}
                    {estado === 'bajo'      && <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium">{prod.stock} disp.</span>}
                    {estado === 'ok'        && <span className="text-xs text-gray-300">{prod.stock} disp.</span>}
                  </div>
                </button>
              )
            })}
          </div>
          {prodsFiltrados.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Search size={32} className="mb-3 opacity-40" />
              <p className="text-sm">No se encontraron productos</p>
            </div>
          )}
        </div>
      </div>

      <div className="w-80 flex flex-col bg-white border-l border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart size={16} className="text-green-600" />
            <span className="text-sm font-semibold text-gray-900">Pedido</span>
            {carro.length > 0 && (
              <span className="bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                {carro.length}
              </span>
            )}
          </div>
          {carro.length > 0 && (
            <button onClick={limpiarCarro} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
              <Trash2 size={12} /> Vaciar
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          {carro.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-300">
              <ShoppingCart size={40} className="mb-3 opacity-40" />
              <p className="text-sm">El pedido está vacío</p>
              <p className="text-xs mt-1">Toca un producto para agregar</p>
            </div>
          ) : (
            <div className="space-y-2">
              {carro.map(item => (
                <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-xl flex-shrink-0">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{item.nombre}</p>
                    <p className="text-xs text-gray-400">{clp(item.precio)}{item.tipo==='kilo'?'/kg':item.tipo==='peso'?'/100g':' c/u'}</p>
                  </div>
                  {item.tipo === 'unidad' ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => cambiarCantidad(item.id, item.cantidad - 1)}
                        className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 text-gray-600">
                        <Minus size={11} />
                      </button>
                      <span className="text-xs font-semibold w-5 text-center">{item.cantidad}</span>
                      <button onClick={() => cambiarCantidad(item.id, item.cantidad + 1)}
                        className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 text-gray-600">
                        <Plus size={11} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">{item.cantidad}{item.tipo==='kilo'?'kg':'g'}</span>
                  )}
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-semibold text-gray-900">{clp(totalItem(item))}</p>
                    <button onClick={() => eliminarDelCarro(item.id)} className="text-red-400 hover:text-red-600 mt-0.5">
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 px-4 py-3">
          <div className="space-y-1.5 mb-3">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Neto</span><span>{clp(neto)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>IVA 19%</span><span>{clp(iva)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold text-gray-900 pt-1.5 border-t border-gray-100">
              <span>Total</span><span className="text-green-600">{clp(subtotal)}</span>
            </div>
          </div>
          {!cajaAbierta && (
            <p className="text-xs text-red-500 mb-2 text-center">⚠ Debes abrir la caja primero</p>
          )}
          <button onClick={() => setModalCobro(true)} disabled={carro.length === 0 || !cajaAbierta}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
            <CreditCard size={16} />
            Cobrar {carro.length > 0 && clp(subtotal)}
          </button>
        </div>
      </div>

      {modalCobro && (
        <ModalCobro carro={carro} subtotal={subtotal}
          onClose={() => setModalCobro(false)}
          onConfirm={() => { setModalCobro(false); limpiarCarro() }} />
      )}
    </div>
  )
}