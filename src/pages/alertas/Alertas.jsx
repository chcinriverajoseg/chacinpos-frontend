import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, Info, XCircle, Bell, BellOff } from 'lucide-react'
import api from '../../api/axios'
import { fechaHora } from '../../utils/formato'

const NIVEL_CONFIG = {
  critico:     { icon: XCircle,       color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200',    label: 'Crítico'     },
  advertencia: { icon: AlertTriangle, color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200',  label: 'Advertencia' },
  info:        { icon: Info,          color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',   label: 'Info'        },
}

const TIPO_LABEL = {
  arqueo_diferencia: '💰 Diferencia en caja',
  stock_critico:     '📦 Stock crítico',
  venta_alta:        '🔔 Venta alto valor',
}

export default function Alertas() {
  const [alertas, setAlertas]     = useState([])
  const [cargando, setCargando]   = useState(true)
  const [verificando, setVerificando] = useState(false)
  const [filtro, setFiltro]       = useState('todas')

  useEffect(() => { cargarAlertas() }, [])

  const cargarAlertas = async () => {
    try {
      const res = await api.get('/alertas')
      setAlertas(res.data.alertas)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setCargando(false)
    }
  }

  const verificarAlertas = async () => {
    setVerificando(true)
    try {
      const res = await api.post('/alertas/verificar')
      await cargarAlertas()
      alert(`✅ ${res.data.mensaje}`)
    } catch (err) {
      alert('Error al verificar alertas')
    } finally {
      setVerificando(false)
    }
  }

  const marcarLeida = async (id) => {
    await api.put(`/alertas/${id}/leer`)
    setAlertas(prev => prev.map(a => a.id === id ? { ...a, leida: true } : a))
  }

  const marcarTodasLeidas = async () => {
    await api.put('/alertas/leer-todas')
    setAlertas(prev => prev.map(a => ({ ...a, leida: true })))
  }

  const alertasFiltradas = alertas.filter(a => {
    if (filtro === 'todas') return true
    if (filtro === 'noLeidas') return !a.leida
    return a.nivel === filtro
  })

  const noLeidas = alertas.filter(a => !a.leida).length

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bell size={20} className="text-green-600"/>
            Auditoría y alertas
            {noLeidas > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-medium">
                {noLeidas} nuevas
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Monitoreo de actividad sospechosa y alertas del sistema</p>
        </div>
        <div className="flex gap-2">
          {noLeidas > 0 && (
            <button onClick={marcarTodasLeidas}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              <BellOff size={14}/> Marcar todas leídas
            </button>
          )}
          <button onClick={verificarAlertas} disabled={verificando}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-40">
            {verificando ? 'Verificando...' : '🔍 Verificar ahora'}
          </button>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label:'Total', value: alertas.length, color:'text-gray-600', bg:'bg-gray-50' },
          { label:'Críticas', value: alertas.filter(a => a.nivel === 'critico').length, color:'text-red-600', bg:'bg-red-50' },
          { label:'Advertencias', value: alertas.filter(a => a.nivel === 'advertencia').length, color:'text-amber-600', bg:'bg-amber-50' },
          { label:'Sin leer', value: noLeidas, color:'text-blue-600', bg:'bg-blue-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key:'todas', label:'Todas' },
          { key:'noLeidas', label:'Sin leer' },
          { key:'critico', label:'Críticas' },
          { key:'advertencia', label:'Advertencias' },
          { key:'info', label:'Info' },
        ].map(f => (
          <button key={f.key} onClick={() => setFiltro(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
              ${filtro===f.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista alertas */}
      {cargando ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : alertasFiltradas.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-gray-300">
          <CheckCircle size={40} className="mb-3 opacity-40"/>
          <p className="text-sm">No hay alertas {filtro !== 'todas' ? 'en esta categoría' : ''}</p>
          <p className="text-xs mt-1">El sistema está funcionando correctamente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alertasFiltradas.map(alerta => {
            const config = NIVEL_CONFIG[alerta.nivel] || NIVEL_CONFIG.info
            const Icon = config.icon
            return (
              <div key={alerta.id}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${config.bg} ${config.border} ${alerta.leida ? 'opacity-60' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${alerta.leida ? 'bg-gray-100' : config.bg}`}>
                  <Icon size={16} className={alerta.leida ? 'text-gray-400' : config.color}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-500">
                      {TIPO_LABEL[alerta.tipo] || alerta.tipo}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.bg} ${config.color}`}>
                      {config.label}
                    </span>
                    {!alerta.leida && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"/>
                    )}
                  </div>
                  <p className="text-sm text-gray-900">{alerta.mensaje}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-gray-400">{fechaHora(alerta.created_at)}</p>
                    {alerta.usuario_nombre && (
                      <p className="text-xs text-gray-400">· {alerta.usuario_nombre}</p>
                    )}
                  </div>
                </div>
                {!alerta.leida && (
                  <button onClick={() => marcarLeida(alerta.id)}
                    className="flex-shrink-0 text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-white transition-colors">
                    Marcar leída
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}