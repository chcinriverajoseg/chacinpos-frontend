import { useCajaStore, useInventarioStore } from '../../store/useStore'
import { clp, calcNeto, calcIVA, fechaHora } from '../../utils/formato'
import { BarChart2, TrendingUp, Package, FileText } from 'lucide-react'

export default function Reportes() {
  const { ventas } = useCajaStore()
  const { productos } = useInventarioStore()

  const totalVentas    = ventas.reduce((s, v) => s + v.total, 0)
  const totalNeto      = ventas.reduce((s, v) => s + v.neto, 0)
  const totalIva       = ventas.reduce((s, v) => s + v.iva, 0)
  const totalUtilidad  = ventas.reduce((s, v) => s + (v.utilidad || 0), 0)

  // Productos más vendidos
  const conteoProductos = {}
  ventas.forEach(v => {
    v.items?.forEach(item => {
      conteoProductos[item.nombre] = (conteoProductos[item.nombre] || 0) + (item.tipo === 'unidad' ? item.cantidad : 1)
    })
  })
  const topProductos = Object.entries(conteoProductos).sort(([,a],[,b]) => b-a).slice(0,5)

  const sinMovimiento = productos.filter(p => !conteoProductos[p.nombre] && p.activo)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-lg font-semibold text-gray-900">Reportes</h1>

      {/* Resumen financiero */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Total ventas',   value: clp(totalVentas),   icon: TrendingUp,  color:'text-primary-600', bg:'bg-primary-50' },
          { label:'Neto (sin IVA)', value: clp(totalNeto),    icon: BarChart2,   color:'text-blue-600',    bg:'bg-blue-50'    },
          { label:'IVA 19%',        value: clp(totalIva),     icon: FileText,    color:'text-purple-600',  bg:'bg-purple-50'  },
          { label:'Utilidad bruta', value: clp(totalUtilidad),icon: TrendingUp,  color:'text-green-600',   bg:'bg-green-50'   },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center mb-2`}>
              <s.icon size={16} className={s.color}/>
            </div>
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className={`text-xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Últimas ventas */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Historial de ventas</h2>
          </div>
          {ventas.length === 0 ? (
            <div className="py-12 text-center text-gray-300 text-sm">Sin ventas registradas</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {ventas.slice().reverse().map(v => (
                <div key={v.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {v.tipo === 'factura' ? '📄' : '🧾'} Folio #{v.folio}
                    </p>
                    <p className="text-xs text-gray-400">{fechaHora(v.fecha)} · {v.cliente?.nombre}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary-600">{clp(v.total)}</p>
                    <p className="text-xs text-gray-400 capitalize">{v.tipo}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Top productos */}
          <div className="card p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <TrendingUp size={15} className="text-primary-600"/> Productos más vendidos
            </h2>
            {topProductos.length === 0 ? (
              <p className="text-sm text-gray-300">Sin datos</p>
            ) : (
              <div className="space-y-2">
                {topProductos.map(([nombre, cant], i) => (
                  <div key={nombre} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-300 w-4">{i+1}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-primary-400 h-full rounded-full" style={{ width: `${(cant / (topProductos[0][1])) * 100}%` }}/>
                    </div>
                    <span className="text-sm text-gray-700 flex-1 truncate">{nombre}</span>
                    <span className="text-xs font-semibold text-gray-500">{cant} uds</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sin movimiento */}
          <div className="card p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Package size={15} className="text-warn-400"/> Sin movimiento
            </h2>
            {sinMovimiento.length === 0 ? (
              <p className="text-sm text-gray-300">Todos los productos se han vendido</p>
            ) : (
              <div className="space-y-1">
                {sinMovimiento.slice(0,5).map(p => (
                  <div key={p.id} className="flex items-center gap-2 text-sm">
                    <span>{p.emoji}</span>
                    <span className="text-gray-700">{p.nombre}</span>
                    <span className="ml-auto badge-gray">{p.stock} uds</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
