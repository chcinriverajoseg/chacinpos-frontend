import { TrendingUp, ShoppingCart, Package, DollarSign, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore, useInventarioStore, useCajaStore } from '../../store/useStore'
import { clp, calcNeto, calcIVA } from '../../utils/formato'

export default function Dashboard() {
  const { user, cajaAbierta, negocio } = useStore()
  const { productos } = useInventarioStore()
  const { ventas } = useCajaStore()
  const navigate = useNavigate()

  const hoy = new Date().toDateString()
  const ventasHoy    = ventas.filter(v => new Date(v.fecha).toDateString() === hoy)
  const totalHoy     = ventasHoy.reduce((s, v) => s + v.total, 0)
  const utilidadHoy  = ventasHoy.reduce((s, v) => s + (v.utilidad || 0), 0)
  const stockBajos   = productos.filter(p => p.stock > 0 && p.stock <= p.stockMin)
  const sinStock     = productos.filter(p => p.stock === 0 && p.activo)

  const STATS = [
    { label:'Ventas hoy',     value: clp(totalHoy),        sub:`${ventasHoy.length} transacciones`, icon: TrendingUp,    color:'text-primary-600',  bg:'bg-primary-50' },
    { label:'Transacciones',  value: ventasHoy.length,      sub:'documentos emitidos',               icon: ShoppingCart,  color:'text-blue-600',     bg:'bg-blue-50'    },
    { label:'Stock bajo',     value: stockBajos.length,     sub:`${sinStock.length} sin stock`,      icon: Package,       color:'text-warn-400',     bg:'bg-warn-50'    },
    { label:'Estado caja',    value: cajaAbierta?'Abierta':'Cerrada', sub:'hoy', icon: DollarSign,  color: cajaAbierta?'text-primary-600':'text-red-600', bg: cajaAbierta?'bg-primary-50':'bg-red-50' },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Saludo */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          Buenos días, {user?.nombre?.split(' ')[0] || 'usuario'} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">{negocio.nombre} · {new Date().toLocaleDateString('es-CL', { weekday:'long', day:'numeric', month:'long' })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STATS.map(s => (
          <div key={s.label} className="card p-4">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon size={18} className={s.color} />
            </div>
            <p className="text-2xl font-semibold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            <p className="text-xs text-gray-300 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Acciones rápidas */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Acciones rápidas</h2>
          <div className="space-y-2">
            {[
              { label:'Ir al punto de venta', to:'/pos',        icon:ShoppingCart, primary:true  },
              { label:'Ver inventario',        to:'/inventario', icon:Package,      primary:false },
              { label:'Control de caja',       to:'/caja',       icon:DollarSign,   primary:false },
              { label:'Ver reportes',          to:'/reportes',   icon:TrendingUp,   primary:false },
            ].map(a => (
              <button key={a.to} onClick={() => navigate(a.to)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  a.primary
                    ? 'bg-primary-400 text-white hover:bg-primary-600'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}>
                <a.icon size={16} />
                {a.label}
                <ArrowRight size={14} className="ml-auto opacity-50" />
              </button>
            ))}
          </div>
        </div>

        {/* Alertas stock */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <AlertTriangle size={15} className="text-warn-400" />
            Alertas de stock
            {(stockBajos.length + sinStock.length) > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {stockBajos.length + sinStock.length}
              </span>
            )}
          </h2>
          {stockBajos.length === 0 && sinStock.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-primary-600">
              <CheckCircle size={16} /> Todo el stock está OK
            </div>
          ) : (
            <div className="space-y-2">
              {sinStock.slice(0,3).map(p => (
                <div key={p.id} className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg">
                  <span className="text-base">{p.emoji}</span>
                  <span className="text-sm text-red-800 flex-1 truncate">{p.nombre}</span>
                  <span className="badge-red">Sin stock</span>
                </div>
              ))}
              {stockBajos.slice(0,3).map(p => (
                <div key={p.id} className="flex items-center gap-2 px-3 py-2 bg-warn-50 rounded-lg">
                  <span className="text-base">{p.emoji}</span>
                  <span className="text-sm text-warn-600 flex-1 truncate">{p.nombre}</span>
                  <span className="badge-yellow">{p.stock} uds</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimas ventas */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Últimas ventas</h2>
          {ventasHoy.length === 0 ? (
            <p className="text-sm text-gray-400">Sin ventas registradas hoy</p>
          ) : (
            <div className="space-y-2">
              {ventasHoy.slice(-5).reverse().map(v => (
                <div key={v.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Folio #{v.folio}</p>
                    <p className="text-xs text-gray-400">{v.tipo === 'factura' ? '📄 Factura' : '🧾 Boleta'} · {new Date(v.fecha).toLocaleTimeString('es-CL', {hour:'2-digit',minute:'2-digit'})}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary-600">{clp(v.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
