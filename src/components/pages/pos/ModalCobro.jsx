import { useState } from 'react'
import { X, FileText, Building2, Check } from 'lucide-react'
import { useStore, useInventarioStore, useCajaStore } from '../../store/useStore'
import { clp, calcIVA, calcNeto, desgloseVuelto, labelDenom, totalItem } from '../../utils/formato'

const BILLETES_RAPIDOS = [50000, 20000, 10000, 5000, 2000, 1000, 500]

export default function ModalCobro({ carro, subtotal, onClose, onConfirm }) {
  const { negocio } = useStore()
  const { descontarStock } = useInventarioStore()
  const { registrarPago, folioActual } = useCajaStore()

  const [tipoDoc, setTipoDoc]         = useState('boleta')
  const [cliNombre, setCliNombre]     = useState('')
  const [cliRut, setCliRut]           = useState('')
  const [cliGiro, setCliGiro]         = useState('')
  const [cliDir, setCliDir]           = useState('')
  const [montoRecibido, setMontoRecibido] = useState('')
  const [billetesSelec, setBilletesSelec] = useState([])
  const [paso, setPaso]               = useState('cobro') // cobro | documento

  const iva    = calcIVA(subtotal)
  const neto   = calcNeto(subtotal)
  const recibido = parseFloat(montoRecibido) || 0
  const vuelto   = recibido - subtotal
  const desgloseVueltoBilletes = vuelto > 0 ? desgloseVuelto(vuelto) : []

  const agregarBillete = (denom) => {
    setBilletesSelec(prev => [...prev, denom])
    const nuevo = billetesSelec.concat(denom).reduce((s, d) => s + d, 0)
    setMontoRecibido(String(nuevo))
  }

  const limpiarMonto = () => { setBilletesSelec([]); setMontoRecibido('') }

  const puedeEmitir = recibido >= subtotal && subtotal > 0 &&
    (tipoDoc === 'boleta' || (tipoDoc === 'factura' && cliRut && cliGiro))

  const handleEmitir = () => {
    // Contar billetes recibidos
    const conteoEntrada = {}
    billetesSelec.forEach(d => { conteoEntrada[d] = (conteoEntrada[d] || 0) + 1 })
    const billetesRecibidos = Object.entries(conteoEntrada).map(([d, c]) => ({ denominacion: parseInt(d), cantidad: c }))

    // Descontar stock
    carro.forEach(item => {
      descontarStock(item.id, item.tipo === 'unidad' ? item.cantidad : 1)
    })

    // Registrar en caja
    const venta = {
      tipo: tipoDoc,
      items: carro,
      total: subtotal,
      neto,
      iva,
      recibido,
      vuelto: Math.max(0, vuelto),
      utilidad: carro.reduce((s, i) => s + (i.precio - (i.costo || 0)) * i.cantidad, 0),
      cliente: { nombre: cliNombre || 'Consumidor final', rut: cliRut, giro: cliGiro, direccion: cliDir },
    }
    registrarPago(billetesRecibidos, desgloseVueltoBilletes, venta)
    setPaso('documento')
  }

  if (paso === 'documento') {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">
              {tipoDoc === 'factura' ? 'Factura electrónica' : 'Boleta electrónica'}
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18}/></button>
          </div>

          {/* Documento preview */}
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="border border-gray-200 rounded-xl p-5 font-mono text-xs">
              {/* Cabecera */}
              <div className="text-center mb-4 border-b border-dashed border-gray-200 pb-4">
                <p className="font-bold text-base font-sans">{negocio.nombre}</p>
                <p className="text-gray-500 font-sans">RUT: {negocio.rut}</p>
                <p className="text-gray-500 font-sans text-xs">{negocio.giro}</p>
                <p className="font-bold text-lg mt-2 font-sans">
                  {tipoDoc === 'factura' ? 'FACTURA ELECTRÓNICA' : 'BOLETA ELECTRÓNICA'}
                </p>
                <p className="text-gray-400">N° {String(folioActual).padStart(6,'0')}</p>
                <div className="inline-flex items-center gap-1 mt-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-sans">
                  <Check size={10} /> SII Chile
                </div>
              </div>

              {tipoDoc === 'factura' && (
                <div className="mb-3 border-b border-dashed border-gray-200 pb-3 font-sans">
                  <p><span className="text-gray-400">Cliente:</span> {cliNombre}</p>
                  <p><span className="text-gray-400">RUT:</span> {cliRut}</p>
                  <p><span className="text-gray-400">Giro:</span> {cliGiro}</p>
                  <p><span className="text-gray-400">Dir:</span> {cliDir}</p>
                </div>
              )}

              {/* Items */}
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

              {/* Totales */}
              <div className="border-t border-dashed border-gray-200 pt-2 space-y-0.5 text-right">
                <p><span className="text-gray-400">Neto:</span> {clp(neto)}</p>
                <p><span className="text-gray-400">IVA 19%:</span> {clp(iva)}</p>
                <p className="font-bold text-base font-sans">Total: {clp(subtotal)}</p>
                {recibido > 0 && <p className="text-gray-400">Recibido: {clp(recibido)}</p>}
                {vuelto > 0  && <p className="text-primary-600 font-sans font-medium">Vuelto: {clp(vuelto)}</p>}
              </div>

              <div className="text-center mt-4 text-gray-400 border-t border-dashed border-gray-200 pt-3">
                <p>{new Date().toLocaleString('es-CL')}</p>
                <p className="font-sans mt-1">▓▓▓▓▓▓▓▓▓▓▓▓ Timbre SII ▓▓▓▓▓▓▓▓▓▓▓▓</p>
              </div>
            </div>

            {/* Vuelto destacado */}
            {vuelto > 0 && (
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                <p className="text-xs font-medium text-primary-800 mb-1">Entregar vuelto</p>
                <p className="text-2xl font-bold text-primary-700">{clp(vuelto)}</p>
                {desgloseVueltoBilletes.length > 0 && (
                  <p className="text-xs text-primary-600 mt-1">
                    {desgloseVueltoBilletes.map(({ denominacion, cantidad }) =>
                      `${cantidad}x ${labelDenom(denominacion)}`
                    ).join(' + ')}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="px-6 pb-6">
            <button onClick={onConfirm} className="btn-primary w-full justify-center">
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
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">Cobrar venta</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18}/></button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Tipo documento */}
          <div className="flex gap-2">
            {['boleta', 'factura'].map(t => (
              <button key={t} onClick={() => setTipoDoc(t)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-colors
                  ${tipoDoc === t
                    ? 'bg-primary-50 border-primary-400 text-primary-800'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                {t === 'boleta' ? <FileText size={15}/> : <Building2 size={15}/>}
                {t === 'boleta' ? 'Boleta' : 'Factura'}
              </button>
            ))}
          </div>

          {/* Datos cliente */}
          <div className="space-y-3">
            <input value={cliNombre} onChange={e => setCliNombre(e.target.value)}
              className="input" placeholder="Nombre cliente (opcional)" />
            {tipoDoc === 'factura' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <input value={cliRut} onChange={e => setCliRut(e.target.value)} className="input" placeholder="RUT empresa *" />
                  <input value={cliGiro} onChange={e => setCliGiro(e.target.value)} className="input" placeholder="Giro *" />
                </div>
                <input value={cliDir} onChange={e => setCliDir(e.target.value)} className="input" placeholder="Dirección" />
              </>
            )}
          </div>

          {/* Total */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Neto</span><span>{clp(neto)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>IVA 19%</span><span>{clp(iva)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900">
              <span>Total</span><span className="text-primary-600">{clp(subtotal)}</span>
            </div>
          </div>

          {/* Billetes rápidos */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Pago con billete</p>
            <div className="flex flex-wrap gap-2">
              {BILLETES_RAPIDOS.map(d => (
                <button key={d} onClick={() => agregarBillete(d)}
                  className="px-3 py-1.5 bg-warn-50 text-warn-600 rounded-lg text-xs font-medium border border-warn-50 hover:border-warn-400 transition-colors">
                  {labelDenom(d)}
                </button>
              ))}
            </div>
          </div>

          {/* Monto recibido */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="label">Monto recibido</label>
              <input type="number" value={montoRecibido}
                onChange={e => { setMontoRecibido(e.target.value); setBilletesSelec([]) }}
                className="input text-lg font-semibold" placeholder="0" />
            </div>
            <button onClick={limpiarMonto} className="btn-secondary py-2">
              <X size={14}/> Limpiar
            </button>
          </div>

          {/* Vuelto */}
          {recibido > 0 && (
            <div className={`rounded-xl p-4 border ${
              vuelto >= 0
                ? 'bg-primary-50 border-primary-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <p className={`text-xs font-medium mb-1 ${vuelto >= 0 ? 'text-primary-800' : 'text-red-700'}`}>
                {vuelto >= 0 ? (vuelto === 0 ? 'Pago exacto' : 'Vuelto a entregar') : 'Falta por cobrar'}
              </p>
              <p className={`text-2xl font-bold ${vuelto >= 0 ? 'text-primary-700' : 'text-red-700'}`}>
                {clp(Math.abs(vuelto))}
              </p>
              {vuelto > 0 && desgloseVueltoBilletes.length > 0 && (
                <p className="text-xs text-primary-600 mt-1">
                  {desgloseVueltoBilletes.map(({denominacion, cantidad}) => `${cantidad}x ${labelDenom(denominacion)}`).join(' + ')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancelar</button>
          <button onClick={handleEmitir} disabled={!puedeEmitir} className="btn-primary flex-1 justify-center">
            <FileText size={15}/> Emitir {tipoDoc}
          </button>
        </div>
      </div>
    </div>
  )
}
