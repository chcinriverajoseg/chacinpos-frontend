import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, MapPin, Users, TrendingUp, Building2 } from 'lucide-react'
import api from '../../api/axios'
import { clp } from '../../utils/formato'

const FORM_VACIO = { nombre: '', direccion: '', telefono: '', ciudad: '' }

export default function Sucursales() {
  const [sucursales, setSucursales] = useState([])
  const [modal, setModal]           = useState(false)
  const [form, setForm]             = useState(FORM_VACIO)
  const [editId, setEditId]         = useState(null)
  const [cargando, setCargando]     = useState(true)

  useEffect(() => { cargarSucursales() }, [])

  const cargarSucursales = async () => {
    try {
      const res = await api.get('/sucursales')
      setSucursales(res.data.sucursales)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setCargando(false)
    }
  }

  const abrirNuevo  = () => { setForm(FORM_VACIO); setEditId(null); setModal(true) }
  const abrirEditar = (s) => { setForm(s); setEditId(s.id); setModal(true) }
  const cerrar      = () => { setModal(false); setEditId(null) }

  const guardar = async () => {
    if (!form.nombre) return
    try {
      if (editId) await api.put(`/sucursales/${editId}`, form)
      else await api.post('/sucursales', form)
      await cargarSucursales()
      cerrar()
    } catch (err) {
      alert('Error al guardar sucursal')
    }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Desactivar esta sucursal?')) return
    await api.delete(`/sucursales/${id}`)
    cargarSucursales()
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Building2 size={20} className="text-green-600"/>
            Sucursales
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Gestiona múltiples locales desde un solo panel</p>
        </div>
        <button onClick={abrirNuevo}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm transition-colors">
          <Plus size={16}/> Nueva sucursal
        </button>
      </div>

      {cargando ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sucursales.map(s => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <Building2 size={18} className="text-green-700"/>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{s.nombre}</p>
                    <p className="text-xs text-gray-400">{s.ciudad}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => abrirEditar(s)}
                    className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors">
                    <Edit2 size={14}/>
                  </button>
                  <button onClick={() => eliminar(s.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {s.direccion && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin size={12}/> {s.direccion}
                  </div>
                )}
                {s.telefono && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    📞 {s.telefono}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-xs text-gray-400">Usuarios</p>
                  <p className="text-sm font-semibold text-gray-900">{s.total_usuarios}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Ventas</p>
                  <p className="text-sm font-semibold text-gray-900">{s.total_ventas}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Total</p>
                  <p className="text-sm font-semibold text-green-600">{clp(s.total_vendido)}</p>
                </div>
              </div>
            </div>
          ))}

          {sucursales.length === 0 && (
            <div className="col-span-3 flex flex-col items-center py-16 text-gray-300">
              <Building2 size={40} className="mb-3 opacity-40"/>
              <p className="text-sm">Sin sucursales registradas</p>
            </div>
          )}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-5">
              {editId ? 'Editar sucursal' : 'Nueva sucursal'}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nombre *</label>
                <input value={form.nombre} onChange={e => setForm(f=>({...f,nombre:e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                  placeholder="Sucursal Centro"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Ciudad</label>
                <input value={form.ciudad} onChange={e => setForm(f=>({...f,ciudad:e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                  placeholder="Concón"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Dirección</label>
                <input value={form.direccion} onChange={e => setForm(f=>({...f,direccion:e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                  placeholder="Av. Principal 1234"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Teléfono</label>
                <input value={form.telefono} onChange={e => setForm(f=>({...f,telefono:e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                  placeholder="+56 9 1234 5678"/>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={cerrar}
                className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={guardar}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}