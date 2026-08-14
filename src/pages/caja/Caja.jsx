import { useState, useEffect } from 'react'
import { DollarSign, AlertTriangle, TrendingUp, TrendingDown, CheckCircle, XCircle } from 'lucide-react'
import { useStore, useCajaStore } from '../../store/useStore'
import { clp, labelDenom } from '../../utils/formato'
import api from '../../api/axios'

const BILLETES = [50000, 20000, 10000, 5000, 2000, 1000, 500, 100]

export default function Caja() {
  const { cajaAbierta, abrirCaja, cerrarCaja, fondoInicial } = useStore()
  const { billetes, movimientos, ventas, resetCaja } = useCajaStore()
  const [fondoForm, setFondoForm]   = useState({})
  const [conteoReal, setConteoReal] = useState({})
  const [tab, setTab]               = useState('billetes')
  const [turnoId, setTurnoId]       = useState(null)
  const [observaciones, setObservaciones] = useState('')
  const [arqueo, setArqueo]         = useState(null)
  const [cargando, setCargando]     = useState(false)

  const fondoTotal = BILLETES.reduce((s, d) => s + d * (parseInt(fondoForm[d]) || 0), 0)
  const totalReal  = BILLETES.reduce((s, d) => s + d * (parseInt(conteoReal[d]) || 0), 0)

  const totalEntradas  = BILLETES.reduce((s, d) => s + d * (billetes[d]?.entrada || 0), 0)
  const totalSalidas   = BILLETES.reduce((s, d) => s + d * (billetes[d]?.salida  || 0), 0)
  const efectivoEsperado = fondoInicial + totalEntradas - totalSalidas
  const totalVentas    = ventas.reduce((s, v) => s + v.total, 0)
  const discrepancias  = BILLETES.filter(d => (billetes[d]?.salida || 0) > (billetes[d]?.entrada || 0))

  const handleAbrirCaja = async () => {
    if (fondoTotal <= 0) return alert('Ingresa el fondo inicial')
    setCargando(true)
    try {
      const res = await api.post('/turnos/abrir', {
        fondo_inicial: fondoTotal,
        detalle_billetes: fondoForm
      })
      setTurnoId(res.data.turno.id)
      abrirCaja(fondoTotal, res.data.turno.id)
    } catch (err) {
      alert(err.response?.data?.error || 'Error al abrir caja')
    }
    setCargando(false)
  }

  const handleCerrarCaja = async () => {
    if (!confirm('¿Cerrar caja? Se guardará el arqueo del turno.')) return
    if (totalReal <= 0) return alert('Cuenta el efectivo real antes de cerrar')
    setCargando(true)
    try {
      const res = await api.post('/turnos/cerrar', {
        turno_id: turnoId,
        total_real: totalReal,
        detalle_real: conteoReal,
        observaciones
      })
      setArqueo(res.data)
      resetCaja()
      cerrarCaja()
      setFondoForm({})
      setConteoReal({})
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cerrar caja')
    }
    setCargando(false)
  }

  if (arqueo) {
    const diff = parseFloat(arqueo.diferencia)
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-lg font-semibold text-gray-900 mb-6">Resumen del turno</h1>
        <div className={`rounded-xl p-6 mb-6 border ${diff === 0 ? 'bg-green-50 border-green-200' : diff > 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            {diff === 0
              ? <CheckCircle size={24} className="text-green-600"/>
              : diff > 0
                ? <TrendingUp size={24} className="text-blue-600"/>
                : <XCircle size={24} className="text-red-600"/>
            }
            <h2 className={`text-lg font-semibold ${diff === 0 ? 'text-green-800' : diff > 0 ? 'text-blue-800' : 'text-red-800'}`}>
              {diff === 0 ? 'Caja cuadrada ✓' : diff > 0 ? `Sobrante: ${clp(Math.abs(diff))}` : `Faltante: ${clp(Math.abs(diff))}`}
            </h2>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Fondo inicial</span><span className="font-medium">{clp(fondoInicial)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Total ventas</span><span className="font-medium text-green-600">{clp(arqueo.total_ventas)}</span></div>
            <div className="flex justify-between border-t border-gray-200 pt-2"><span className="text-gray-600">Esperado en caja</span><span className="font-medium">{clp(arqueo.total_esperado)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Contado real</span><span className="font-medium">{clp(arqueo.turno.total_real)}</span></div>
            <div className={`flex justify-between font-semibold text-base border-t border-gray-200 pt-2 ${diff < 0 ? 'text-red-700' : diff > 0 ? 'text-blue-700' : 'text-green-700'}`}>
              <span>Diferencia</span><span>{clp(diff)}</span>
            </div>
          </div>
        </div>
        <button onClick={() => setArqueo(null)}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2.5 rounded-lg transition-colors">
          Volver al inicio
        </button>
      </div>
    )
  }

  if (!cajaAbierta) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-lg font-semibold text-gray-900 mb-6">Apertura de caja</h1>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-4">Registra el fondo inicial por denominación</p>
          <div className="space-y-3">
            {BILLETES.map(d => (
              <div key={d} className="flex items-center gap-4">
                <span className="w-24 text-sm font-medium text-gray-700">{labelDenom(d)}</span>
                <input type="number" min="0" value={fondoForm[d] || ''}
                  onChange={e => setFondoForm(f => ({...f,[d]:e.target.value}))}
                  className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-200"
                  placeholder="0"/>
                <span className="text-sm text-gray-400">= {clp(d * (parseInt(fondoForm[d]) || 0))}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-400">Total fondo inicial</p>
              <p className="text-2xl font-bold text-green-600">{clp(fondoTotal)}</p>
            </div>
            <button onClick={handleAbrirCaja} disabled={cargando}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-40">
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
        <button onClick={() => setTab('cierre')}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm transition-colors">
          Cerrar caja
        </button>
      </div>

      {discrepancias.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-5 text-red-700 text-sm">
          <AlertTriangle size={18}/>
          <span>Alerta: billetes de {discrepancias.map(d => labelDenom(d)).join(', ')} tienen más salidas que entradas.</span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label:'Fondo inicial',    value: clp(fondoInicial),     color:'text-gray-600'  },
          { label:'Ventas del día',   value: clp(totalVentas),      color:'text-green-600' },
          { label:'Efectivo esperado',value: clp(efectivoEsperado), color:'text-green-700' },
          { label:'Movimientos',      value: movimientos.length,    color:'text-blue-600'  },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl w-fit">
        {['billetes','movimientos','cierre'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize
              ${tab===t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'billetes' ? 'Conteo' : t === 'movimientos' ? 'Movimientos' : 'Cierre de caja'}
          </button>
        ))}
      </div>

      {tab === 'billetes' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BILLETES.map(d => {
            const entrada = billetes[d]?.entrada || 0
            const salida  = billetes[d]?.salida  || 0
            const neto    = entrada - salida
            const alerta  = salida > entrada
            return (
              <div key={d} className={`bg-white rounded-xl border shadow-sm p-4 ${alerta ? 'border-red-200 bg-red-50' : 'border-gray-100'}`}>
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
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
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
                      ? <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">↓ Entrada</span>
                      : <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">↑ Salida</span>}
                  </td>
                  <td className="px-4 py-2.5 font-medium">{labelDenom(m.denominacion)}</td>
                  <td className="px-4 py-2.5 text-center">{m.cantidad}</td>
                  <td className="px-4 py-2.5 text-right text-gray-600">
                    {typeof m.venta === 'number' ? clp(m.venta) : m.venta}
                  </td>
                </tr>
              ))}
              {movimientos.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-gray-300 text-sm">Sin movimientos registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'cierre' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-2xl">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Arqueo de cierre — cuenta el efectivo real</h2>
          <div className="space-y-3 mb-5">
            {BILLETES.map(d => (
              <div key={d} className="flex items-center gap-4">
                <span className="w-24 text-sm font-medium text-gray-700">{labelDenom(d)}</span>
                <input type="number" min="0" value={conteoReal[d] || ''}
                  onChange={e => setConteoReal(f => ({...f,[d]:e.target.value}))}
                  className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-200"
                  placeholder="0"/>
                <span className="text-sm text-gray-400">= {clp(d * (parseInt(conteoReal[d]) || 0))}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 mb-4">
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-500">Efectivo esperado</span>
              <span className="font-semibold">{clp(efectivoEsperado)}</span>
            </div>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-500">Contado real</span>
              <span className="font-semibold text-green-600">{clp(totalReal)}</span>
            </div>
            {totalReal > 0 && (
              <div className={`flex justify-between text-base font-bold border-t border-gray-100 pt-2 ${
                totalReal - efectivoEsperado < 0 ? 'text-red-600' : totalReal - efectivoEsperado > 0 ? 'text-blue-600' : 'text-green-600'
              }`}>
                <span>Diferencia</span>
                <span>{clp(totalReal - efectivoEsperado)}</span>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 mb-1">Observaciones</label>
            <input value={observaciones} onChange={e => setObservaciones(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
              placeholder="Opcional — notas del turno"/>
          </div>

          <button onClick={handleCerrarCaja} disabled={cargando || totalReal <= 0}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {cargando ? 'Cerrando...' : 'Confirmar cierre de caja'}
          </button>
        </div>
      )}
    </div>
  )
}