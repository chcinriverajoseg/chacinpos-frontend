import { useState, useEffect } from 'react'
import { BarChart2, TrendingUp, FileText } from 'lucide-react'
import api from '../../api/axios'
import { clp, fechaHora } from '../../utils/formato'

export default function Reportes() {
  const [resumen, setResumen]           = useState(null)
  const [ventas, setVentas]             = useState([])
  const [topProductos, setTopProductos] = useState([])
  const [cargando, setCargando]         = useState(true)

  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    try {
      const [reporteRes, ventasRes] = await Promise.all([
        api.get('/ventas/reporte'),
        api.get('/ventas'),
      ])
      setResumen(reporteRes.data.resumen)
      setTopProductos(reporteRes.data.top_productos || [])
      setVentas(ventasRes.data.ventas)
    } catch (err) {
      console.error('Error cargando reportes:', err)
    } finally {
      setCargando(false)
    }
  }

  if (cargando) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  const totalVentas   = parseFloat(resumen?.total || 0)
  const totalNeto     = parseFloat(resumen?.neto || 0)
  const totalIva      = totalVentas - totalNeto
  const transacciones = parseInt(resumen?.transacciones || 0)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Reportes del día</h1>
        <button onClick={cargarDatos}
          className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Total ventas',   value: clp(totalVentas),  icon: TrendingUp, color:'text-green-600',  bg:'bg-green-50'  },
          { label:'Neto (sin IVA)', value: clp(totalNeto),    icon: BarChart2,  color:'text-blue-600',   bg:'bg-blue-50'   },
          { label:'IVA 19%',        value: clp(totalIva),     icon: FileText,   color:'text-purple-600', bg:'bg-purple-50' },
          { label:'Transacciones',  value: transacciones,     icon: TrendingUp, color:'text-green-600',  bg:'bg-green-50'  },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center mb-2`}>
              <s.icon size={16} className={s.color}/>
            </div>
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className={`text-xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Historial de ventas</h2>
          </div>
          {ventas.length === 0 ? (
            <div className="py-12 text-center text-gray-300 text-sm">Sin ventas registradas</div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
              {ventas.map(v => (
                <div key={v.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {v.tipo === 'factura' ? '📄' : '🧾'} Folio #{v.folio}
                    </p>
                    <p className="text-xs text-gray-400">
                      {fechaHora(v.created_at)} · {v.cliente_nombre || 'Consumidor final'}
                    </p>
                    <p className="text-xs text-gray-400">{v.cajero || 'Cajero'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">{clp(v.total)}</p>
                    <p className="text-xs text-gray-400 capitalize">{v.tipo}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <TrendingUp size={15} className="text-green-600"/> Productos más vendidos hoy
          </h2>
          {topProductos.length === 0 ? (
            <p className="text-sm text-gray-300">Sin ventas hoy todavía</p>
          ) : (
            <div className="space-y-3">
              {topProductos.map((p, i) => (
                <div key={p.nombre} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-300 w-4">{i+1}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full"
                      style={{ width: `${(parseFloat(p.vendido) / parseFloat(topProductos[0]?.vendido)) * 100}%` }}/>
                  </div>
                  <span className="text-sm text-gray-700 flex-1 truncate">{p.nombre}</span>
                  <span className="text-xs font-semibold text-gray-500">{p.vendido} uds</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}