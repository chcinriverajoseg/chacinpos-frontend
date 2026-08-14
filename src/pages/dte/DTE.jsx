import { useState, useEffect } from 'react'
import { FileText, Building2, CheckCircle, AlertTriangle, Download } from 'lucide-react'
import api from '../../api/axios'
import { clp, fechaHora } from '../../utils/formato'

const TIPOS_DTE = {
  39: { label: 'Boleta Electrónica', color: 'bg-green-50 text-green-700', icon: '🧾' },
  33: { label: 'Factura Electrónica', color: 'bg-blue-50 text-blue-700', icon: '📄' },
}

export default function DTE() {
  const [documentos, setDocumentos] = useState([])
  const [folios, setFolios]         = useState([])
  const [cargando, setCargando]     = useState(true)
  const [tab, setTab]               = useState('documentos')

  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    try {
      const [docsRes, foliosRes] = await Promise.all([
        api.get('/dte'),
        api.get('/dte/folios'),
      ])
      setDocumentos(docsRes.data.documentos)
      setFolios(foliosRes.data.folios)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setCargando(false)
    }
  }

  const verXML = (xml) => {
    const blob = new Blob([xml], { type: 'text/xml' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText size={20} className="text-green-600"/>
            Documentos Tributarios Electrónicos
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Estructura DTE lista — falta certificado digital SII para envío real</p>
        </div>
      </div>

      {/* Banner informativo */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
        <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5"/>
        <div>
          <p className="text-sm font-medium text-amber-800">Modo de prueba — Sin envío al SII</p>
          <p className="text-sm text-amber-700 mt-1">
            El sistema genera el XML en formato DTE correcto. Para enviar al SII necesitas:
            1) Certificado digital de firma electrónica, 2) Archivos CAF del SII, 3) Certificación como emisor electrónico.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
        {['documentos', 'folios'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize
              ${tab===t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'documentos' ? `Documentos (${documentos.length})` : 'Control de folios'}
          </button>
        ))}
      </div>

      {cargando ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : tab === 'documentos' ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Folio</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Receptor</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Neto</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">IVA</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Total</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Fecha</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {documentos.map(d => {
                const tipo = TIPOS_DTE[d.tipo_dte]
                return (
                  <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tipo?.color}`}>
                        {tipo?.icon} {tipo?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-medium">N°{d.folio}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{d.rut_receptor}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{clp(d.monto_neto)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{clp(d.monto_iva)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{clp(d.monto_total)}</td>
                    <td className="px-4 py-3 text-center">
                      {d.estado === 'generado'
                        ? <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">✓ Generado</span>
                        : <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{d.estado}</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{fechaHora(d.created_at)}</td>
                    <td className="px-4 py-3">
                      {d.xml_documento && (
                        <button onClick={() => verXML(d.xml_documento)}
                          className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700">
                          <Download size={12}/> XML
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {documentos.length === 0 && (
            <div className="flex flex-col items-center py-16 text-gray-300">
              <FileText size={36} className="mb-2 opacity-40"/>
              <p className="text-sm">Sin documentos emitidos aún</p>
              <p className="text-xs mt-1">Los DTEs se generan automáticamente al cobrar</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {folios.map(f => {
            const tipo = TIPOS_DTE[f.tipo_dte]
            const usados = f.folio_actual - f.folio_desde
            const total  = f.folio_hasta - f.folio_desde + 1
            const pct    = Math.min((usados / total) * 100, 100)
            const quedan = f.folio_hasta - f.folio_actual + 1
            return (
              <div key={f.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">{tipo?.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{tipo?.label}</p>
                    <p className="text-xs text-gray-400">Tipo DTE {f.tipo_dte}</p>
                  </div>
                  {quedan < 50 && (
                    <span className="ml-auto text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                      ⚠ Pocos folios
                    </span>
                  )}
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rango</span>
                    <span className="font-medium">{f.folio_desde} — {f.folio_hasta}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Folio actual</span>
                    <span className="font-medium text-green-600">{f.folio_actual}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Disponibles</span>
                    <span className={`font-medium ${quedan < 50 ? 'text-amber-600' : 'text-gray-900'}`}>{quedan}</span>
                  </div>
                </div>
                <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className={`h-full rounded-full ${pct > 80 ? 'bg-amber-500' : 'bg-green-500'}`}
                    style={{ width: `${pct}%` }}/>
                </div>
                <p className="text-xs text-gray-400 mt-1">{usados} de {total} folios usados</p>

                {!f.caf_xml && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
                    📋 Pendiente: subir archivo CAF del SII para activar firma electrónica
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}