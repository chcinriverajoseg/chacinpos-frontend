import { useState, useEffect } from 'react'
import { Building2, Save, CheckCircle } from 'lucide-react'
import { useStore } from '../../store/useStore'
import api from '../../api/axios'

const FORM_VACIO = {
  nombre_negocio: '',
  rut: '',
  giro: '',
  direccion: '',
  telefono: '',
  email: '',
  mensaje_boleta: '¡Gracias por su compra!',
  iva: 19,
  moneda: 'CLP',
}

export default function Configuracion() {
  const { setNegocio, user } = useStore()
  const [form, setForm]         = useState(FORM_VACIO)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado]   = useState(false)
  const [error, setError]         = useState('')
  const esAdmin = user?.rol === 'administrador'

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    try {
      const res = await api.get('/config')
      setForm({ ...FORM_VACIO, ...res.data.configuracion })
    } catch (err) {
      setError('No se pudo cargar la configuración')
    } finally {
      setCargando(false)
    }
  }

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setError('')
    try {
      const res = await api.put('/config', form)
      setForm(res.data.configuracion)
      setNegocio({
        nombre: res.data.configuracion.nombre_negocio,
        rut: res.data.configuracion.rut,
        giro: res.data.configuracion.giro,
        direccion: res.data.configuracion.direccion,
        telefono: res.data.configuracion.telefono,
        email: res.data.configuracion.email,
      })
      setGuardado(true)
      setTimeout(() => setGuardado(false), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })

  if (cargando) return (
    <div className="p-6 flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
          <Building2 size={20} className="text-green-700"/>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Configuración del negocio</h1>
          <p className="text-sm text-gray-500">Estos datos aparecen en las boletas y facturas</p>
        </div>
      </div>

      {!esAdmin && (
        <div className="mb-4 text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded-lg">
          Solo el administrador puede editar esta información.
        </div>
      )}

      <form onSubmit={guardar} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Nombre del negocio *</label>
          <input type="text" value={form.nombre_negocio || ''} onChange={cambiar('nombre_negocio')}
            disabled={!esAdmin} required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200 disabled:bg-gray-50"
            placeholder="Carnicería El Buen Corte"/>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">RUT</label>
            <input type="text" value={form.rut || ''} onChange={cambiar('rut')}
              disabled={!esAdmin}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200 disabled:bg-gray-50"
              placeholder="76.123.456-7"/>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Giro</label>
            <input type="text" value={form.giro || ''} onChange={cambiar('giro')}
              disabled={!esAdmin}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200 disabled:bg-gray-50"
              placeholder="Comercio al por menor"/>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Teléfono</label>
            <input type="text" value={form.telefono || ''} onChange={cambiar('telefono')}
              disabled={!esAdmin}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200 disabled:bg-gray-50"
              placeholder="+56 9 1234 5678"/>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
            <input type="email" value={form.email || ''} onChange={cambiar('email')}
              disabled={!esAdmin}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200 disabled:bg-gray-50"
              placeholder="negocio@correo.cl"/>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Dirección</label>
          <input type="text" value={form.direccion || ''} onChange={cambiar('direccion')}
            disabled={!esAdmin}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200 disabled:bg-gray-50"
            placeholder="Av. Principal 1234, Concón"/>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Moneda</label>
            <select value={form.moneda || 'CLP'} onChange={cambiar('moneda')}
              disabled={!esAdmin}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200 disabled:bg-gray-50">
              <option value="CLP">Peso chileno (CLP)</option>
              <option value="USD">Dólar (USD)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">IVA (%)</label>
            <input type="number" value={form.iva ?? 19} onChange={cambiar('iva')}
              disabled={!esAdmin}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200 disabled:bg-gray-50"/>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Mensaje en boleta</label>
          <input type="text" value={form.mensaje_boleta || ''} onChange={cambiar('mensaje_boleta')}
            disabled={!esAdmin}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200 disabled:bg-gray-50"
            placeholder="¡Gracias por su compra!"/>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        {esAdmin && (
          <button type="submit" disabled={guardando}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-40">
            {guardando
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
              : guardado
                ? <><CheckCircle size={16}/> Guardado</>
                : <><Save size={16}/> Guardar cambios</>
            }
          </button>
        )}
      </form>
    </div>
  )
}