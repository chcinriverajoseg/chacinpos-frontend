import { useState } from 'react'
import { Building2, Save, CheckCircle } from 'lucide-react'
import { useStore } from '../../store/useStore'

export default function Configuracion() {
  const { negocio, setNegocio, user } = useStore()
  const [form, setForm]     = useState({ ...negocio })
  const [guardado, setGuardado] = useState(false)
  const esAdmin = user?.rol === 'administrador'

  const guardar = (e) => {
    e.preventDefault()
    setNegocio(form)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 3000)
  }

  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
          <Building2 size={20} className="text-green-700" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Configuración del negocio</h1>
          <p className="text-sm text-gray-500">Estos datos aparecen en las boletas</p>
        </div>
      </div>

      {!esAdmin && (
        <div className="mb-4 text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded-lg">
          Solo un administrador puede editar esta información.
        </div>
      )}

      <form onSubmit={guardar} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Nombre del negocio</label>
          <input type="text" value={form.nombre || ''} onChange={cambiar('nombre')}
            disabled={!esAdmin} required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200 disabled:bg-gray-50"
            placeholder="Ej: Carnicería El Buen Corte" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">RUT</label>
            <input type="text" value={form.rut || ''} onChange={cambiar('rut')}
              disabled={!esAdmin}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200 disabled:bg-gray-50"
              placeholder="76.123.456-7" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Teléfono</label>
            <input type="text" value={form.telefono || ''} onChange={cambiar('telefono')}
              disabled={!esAdmin}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200 disabled:bg-gray-50"
              placeholder="+56 9 1234 5678" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Dirección</label>
          <input type="text" value={form.direccion || ''} onChange={cambiar('direccion')}
            disabled={!esAdmin}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200 disabled:bg-gray-50"
            placeholder="Av. Principal 1234, Concón" />
        </div>

        {esAdmin && (
          <button type="submit"
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors">
            {guardado ? <><CheckCircle size={16}/> Guardado</> : <><Save size={16}/> Guardar cambios</>}
          </button>
        )}
      </form>
    </div>
  )
}