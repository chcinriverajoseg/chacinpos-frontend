import { useState } from 'react'
import { X, FileText, Building2, Check } from 'lucide-react'
import { useStore, useCajaStore } from '../../store/useStore'
import { clp, calcIVA, calcNeto, desgloseVuelto, labelDenom, totalItem } from '../../utils/formato'
import api from '../../api/axios'

const BILLETES_RAPIDOS = [50000, 20000, 10000, 5000, 2000, 1000, 500]

export default function ModalCobro({ carro, subtotal, onClose, onConfirm }) {
  const { negocio } = useStore()
  const { registrarPago, folioActual } = useCajaStore()

  const [tipoDoc, setTipoDoc]             = useState('boleta')
  const [cliNombre, setCliNombre]         = useState('')
  const [cliRut, setCliRut]               = useState('')
  const [cliGiro, setCliGiro]             = useState('')
  const [cliDir, setCliDir]               = useState('')
  const [montoRecibido, setMontoRecibido] = useState('')
  const [billetesSelec, setBilletesSelec] = useState([])
  const [paso, setPaso]                   = useState('cobro')
  const [loading, setLoading]             = useState(false)
  const [ventaData, setVentaData]         = useState(null)

  const iva      = calcIVA(subtotal)
  const neto     = calcNeto(subtotal)
  const recibido = parseFloat(montoRecibido) || 0
  const vuelto   = recibido - subtotal
  const desgloseVueltoBilletes = vuelto > 0 ? desgloseVuelto(vuelto) : []

  const agregarBillete = (denom) => {
    const nuevos = [...billetesSelec, denom]
    setBilletesSelec(nuevos)
    setMontoRecibido(String(nuevos.reduce((s, d) => s + d, 0)))
  }

  const limpiarMonto = () => { setBilletesSelec([]); setMontoRecibido('') }

  const puedeEmitir = recibido >= subtotal && subtotal > 0 &&
    (tipoDoc === 'boleta' || (tipoDoc === 'factura' && cliRut && cliGiro))

  const handleEmitir = async () => {
    setLoading(true)
    const conteoEntrada = {}
    billetesSelec.forEach(d => { conteoEntrada[d] = (conteoEntrada[d] || 0) + 1 })
    const billetesRecibidos = Object.entries(conteoEntrada).map(([d, c]) => ({ denominacion: parseInt(d), cantidad: c }))

    try {
      const res = await api.post('/ventas', {
        tipo: tipoDoc,
        items: carro,
        total: subtotal,
        neto,
        iva,
        recibido,
        vuelto: Math.max(0, vuelto),
        cliente: { nombre: cliNombre || 'Consumidor final', rut: cliRut, giro: cliGiro, direccion: cliDir },
        billetes_recibidos: billetesRecibidos,
        billetes_vuelto: desgloseVueltoBilletes,
      })

      // Registrar en store local también
      registrarPago(billetesRecibidos, desgloseVueltoBilletes, {
        ...res.data.venta,
        tipo: tipoDoc,
        items: carro,
        total: subtotal,
        neto,
        iva,
        recibido,
        vuelto: Math.max(0, vuelto),
        cliente: { nombre: cliNombre || 'Consumidor final' },
      })

      setVentaData({ ...res.data.venta, folio: res.data.folio })
      setPaso('documento')
    } catch (err) {
      console.error('Error registrando venta:', err)
      alert('Error al registrar la venta. Intenta de nuevo.')
    }
    setLoading(false)
  }

  if (paso === 'documento') {
    const folio = ventaData?.folio || folioActual
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">
              {tipoDoc === 'factura' ? 'Factura electrónica' : 'Boleta electrónica'}
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18}/></button>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div className="border border-gray-200 rounded-xl p-5 font-mono text-xs">
              <div className="text-center mb-4 border-b border-dashed border-gray-200 pb-4">
                <p className="font-bold text-base font-sans">{negocio.nombre}</p>
                <p className="text-gray-500 font-sans">RUT: {negocio.rut}</p>
                <p className="font-bold text-lg mt-2 font-sans">
                  {tipoDoc === 'factura' ? 'FACTURA ELECTRONICA' : 'BOLETA ELECTRONICA'}
                </p>
                <p className="text-gray-400">N° {String(folio).padStart(6,'0')}</p>
                <div className="inline-flex items-center gap-1 mt-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-sans">
                  <Check size={10} /> SII Chile
                </div>
              </div>

              {tipoDoc === 'factura' && (
                <div className="mb-3 border-b border-dashed border-gray-200 pb-3 font-sans text-xs">
                  <p><span className="text-gray-400">Cliente:</span> {cliNombre}</p>
                  <p><span className="text-gray-400">RUT:</span> {cliRut}</p>
                  <p><span className="text-gray-400">Giro:</span> {cliGiro}</p>
                  <p><span className="text-gray-400">Dir:</span> {cliDir}</p>
                </div>
              )}

              <table className="w-full mb-3">
                <thead>
                  <tr className="border-b border-dashed border-gray-200">
                    <th className="text-left pb-1 text-gray-400 font-normal">Producto</th>
                    <th className="text-right pb-1 text-gray-400 font-normal">Cant</th>
                    <th className="text-right pb-1 text-gray-400 font-normal">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {carro.map(item => (
                    <tr key={item.id}>
                      <td className="py-0.5">{item.emoji} {item.nombre}</td>
                      <td className="text-right">{item.cantidad}{item.tipo==='kilo'?'kg':item.tipo==='peso'?'g':''}</td>
                      <td className="text-right">{clp(totalItem(item))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-dashed border-gray-200 pt-2 space-y-0.5 text-right">
                <p><span className="text-gray-400">Neto:</span> {clp(neto)}</p>
                <p><span className="text-gray-400">IVA 19%:</span> {clp(iva)}</p>
                <p className="font-bold text-base font-sans">Total: {clp(subtotal)}</p>
                {recibido > 0 && <p className="text-gray-400">Recibido: {clp(recibido)}</p>}
                {vuelto > 0  && <p className="text-green-600 font-sans font-medium">Vuelto: {clp(vuelto)}</p>}
              </div>

              <div className="text-center mt-4 text-gray-400 border-t border-dashed border-gray-200 pt-3 font-sans">
                <p>{new Date().toLocaleString('es-CL')}</p>
                <p className="mt-1">Timbre SII</p>
              </div>
            </div>

            {vuelto > 0 && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-xs font-medium text-green-800 mb-1">Entregar vuelto</p>
                <p className="text-2xl font-bold text-green-700">{clp(vuelto)}</p>
                {desgloseVueltoBilletes.length > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    {desgloseVueltoBilletes.map(({ denominacion, cantidad }) => `${cantidad}x ${labelDenom(denominacion)}`).join(' + ')}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="px-6 pb-6">
            <button onClick={onConfirm} className="w-full bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
              <Check size={16} /> Listo — nueva venta
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">Cobrar venta</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18}/></button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <div className="flex gap-2">
            {['boleta','factura'].map(t => (
              <button key={t} onClick={() => setTipoDoc(t)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-colors
                  ${tipoDoc === t ? 'bg-green-50 border-green-500 text-green-800' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                {t === 'boleta' ? <FileText size={15}/> : <Building2 size={15}/>}
                {t === 'boleta' ? 'Boleta' : 'Factura'}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <input value={cliNombre} onChange={e => setCliNombre(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
              placeholder="Nombre cliente (opcional)" />
            {tipoDoc === 'factura' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <input value={cliRut} onChange={e => setCliRut(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                    placeholder="RUT empresa *" />
                  <input value={cliGiro} onChange={e => setCliGiro(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                    placeholder="Giro *" />
                </div>
                <input value={cliDir} onChange={e => setCliDir(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                  placeholder="Dirección" />
              </>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Neto</span><span>{clp(neto)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>IVA 19%</span><span>{clp(iva)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900">
              <span>Total</span><span className="text-green-600">{clp(subtotal)}</span>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Pago con billete</p>
            <div className="flex flex-wrap gap-2">
              {BILLETES_RAPIDOS.map(d => (
                <button key={d} onClick={() => agregarBillete(d)}
                  className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium border border-amber-100 hover:border-amber-400 transition-colors">
                  {labelDenom(d)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Monto recibido</label>
              <input type="number" value={montoRecibido}
                onChange={e => { setMontoRecibido(e.target.value); setBilletesSelec([]) }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-green-200"
                placeholder="0" />
            </div>
            <button onClick={limpiarMonto}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              <X size={14}/> Limpiar
            </button>
          </div>

          {recibido > 0 && (
            <div className={`rounded-xl p-4 border ${vuelto >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <p className={`text-xs font-medium mb-1 ${vuelto >= 0 ? 'text-green-800' : 'text-red-700'}`}>
                {vuelto >= 0 ? (vuelto === 0 ? 'Pago exacto' : 'Vuelto a entregar') : 'Falta por cobrar'}
              </p>
              <p className={`text-2xl font-bold ${vuelto >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {clp(Math.abs(vuelto))}
              </p>
              {vuelto > 0 && desgloseVueltoBilletes.length > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  {desgloseVueltoBilletes.map(({denominacion, cantidad}) => `${cantidad}x ${labelDenom(denominacion)}`).join(' + ')}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={handleEmitir} disabled={!puedeEmitir || loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
            {loading
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
              : <><FileText size={15}/> Emitir {tipoDoc}</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}