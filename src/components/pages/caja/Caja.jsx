import { useState } from 'react'
import { DollarSign, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import { useStore, useCajaStore } from '../../store/useStore'
import { clp, labelDenom } from '../../utils/formato'

const BILLETES = [50000, 20000, 10000, 5000, 2000, 1000, 500, 100]

export default function Caja() {
  const { cajaAbierta, abrirCaja, cerrarCaja, fondoInicial } = useStore()
  const { billetes, movimientos, ventas, resetCaja } = useCajaStore()
  const [fondoForm, setFondoForm] = useState({})
  const [tab, setTab] = useState('billetes')

  const fondoTotal = BILLETES.reduce((s, d) => s + d * (parseInt(fondoForm[d]) || 0), 0)

  const handleAbrirCaja = () => {
    if (fondoTotal <= 0) return alert('Ingresa el fondo inicial')
    abrirCaja(fondoTotal, Date.now())
  }

  const handleCerrarCaja = () => {
    if (!confirm('¿Cerrar caja? Se guardará el arqueo.')) return
    resetCaja()
    cerrarCaja()
    setFondoForm({})
  }

  // Cálculos caja
  const totalEntradas = BILLETES.reduce((s, d) => s + d * (billetes[d]?.entrada || 0), 0)
  const totalSalidas  = BILLETES.reduce((s, d) => s + d * (billetes[d]?.salida  || 0), 0)
  const efectivoActual = fondoInicial + totalEntradas - totalSalidas

  const totalVentas   = ventas.reduce((s, v) => s + v.total, 0)

  // Detectar discrepancias
  const discrepancias = BILLETES.filter(d => (billetes[d]?.salida || 0) > (billetes[d]?.entrada || 0))

  if (!cajaAbierta) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-lg font-semibold text-gray-900 mb-6">Apertura de caja</h1>
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-4">Registra el fondo inicial por denominación de billete</p>
          <div className="space-y-3">
            {BILLETES.map(d => (
              <div key={d} className="flex items-center gap-4">
                <span className="w-24 text-sm font-medium text-gray-700">{labelDenom(d)}</span>
                <input type="number" min="0" value={fondoForm[d] || ''}
                  onChange={e => setFondoForm(f => ({...f,[d]:e.target.value}))}
                  className="input w-24 text-center" placeholder="0"/>
                <span className="text-sm text-gray-400">
                  = {clp(d * (parseInt(fondoForm[d]) || 0))}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-400">Total fondo inicial</p>
              <p className="text-2xl font-bold text-primary-600">{clp(fondoTotal)}</p>
            </div>
            <button onClick={handleAbrirCaja} className="btn-primary px-6">
              <DollarSign size={16}/> Abrir caja
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-gray-900">Control de caja</h1>
        <button onClick={handleCerrarCaja} className="btn-danger text-sm">Cerrar caja</button>
      </div>

      {/* Alerta discrepancias */}
      {discrepancias.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-5 text-red-700 text-sm">
          <AlertTriangle size={18}/>
          <span>Alerta: los billetes de {discrepancias.map(d => labelDenom(d)).join(', ')} tienen más salidas que entradas. Verificar caja.</span>
        </div>
      )}

      {/* Resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label:'Fondo inicial',    value: clp(fondoInicial),    sub: 'al abrir caja',     color: 'text-gray-600' },
          { label:'Ventas del día',   value: clp(totalVentas),     sub: `${ventas.length} transacciones`, color: 'text-primary-600' },
          { label:'Entradas',         value: clp(totalEntradas),   sub: 'efectivo recibido', color: 'text-green-600' },
          { label:'Efectivo en caja', value: clp(efectivoActual),  sub: 'estimado actual',   color: 'text-primary-700' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-300 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl w-fit">
        {['billetes','movimientos'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize
              ${tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'billetes' ? 'Conteo de billetes' : 'Movimientos'}
          </button>
        ))}
      </div>

      {tab === 'billetes' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BILLETES.map(d => {
            const entrada = billetes[d]?.entrada || 0
            const salida  = billetes[d]?.salida  || 0
            const neto    = entrada - salida
            const hay     = neto + (parseInt(fondoForm[d]) || 0)
            const alerta  = salida > entrada
            return (
              <div key={d} className={`card p-4 ${alerta ? 'border-red-200 bg-red-50' : ''}`}>
                <p className="text-sm font-semibold text-gray-900 mb-3">{labelDenom(d)}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1 text-gray-400"><TrendingDown size={11}/> Entrada</span>
                    <span className="font-medium text-green-600">{entrada} bill.</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1 text-gray-400"><TrendingUp size={11}/> Salida</span>
                    <span className="font-medium text-red-500">{salida} bill.</span>
                  </div>
                  <div className="pt-2 border-t border-gray-100 flex justify-between text-xs">
                    <span className="text-gray-500">En caja</span>
                    <span className={`font-semibold ${alerta ? 'text-red-600' : 'text-gray-900'}`}>
                      {neto} = {clp(d * neto)}
                    </span>
                  </div>
                </div>
                {alerta && <p className="text-xs text-red-600 mt-2 flex items-center gap-1"><AlertTriangle size={10}/> Discrepancia</p>}
              </div>
            )
          })}
        </div>
      )}

      {tab === 'movimientos' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Hora</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Billete</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500">Cantidad</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Venta</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.slice().reverse().map((m, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-gray-500 text-xs">{m.hora}</td>
                  <td className="px-4 py-2.5">
                    {m.tipo === 'entrada'
                      ? <span className="badge-green">↓ Entrada</span>
                      : <span className="badge-red">↑ Salida</span>}
                  </td>
                  <td className="px-4 py-2.5 font-medium">{labelDenom(m.denominacion)}</td>
                  <td className="px-4 py-2.5 text-center">{m.cantidad}</td>
                  <td className="px-4 py-2.5 text-right text-gray-600">{typeof m.venta === 'number' ? clp(m.venta) : m.venta}</td>
                </tr>
              ))}
              {movimientos.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-gray-300 text-sm">Sin movimientos registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
