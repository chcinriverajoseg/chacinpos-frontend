import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Users, Key, Shield } from 'lucide-react'
import api from '../../api/axios'
import { useStore } from '../../store/useStore'

const ROLES = ['administrador', 'cajero', 'bodega']
const FORM_VACIO = { nombre: '', email: '', password: '', rol: 'cajero' }

export default function Usuarios() {
  const { user } = useStore()
  const [usuarios, setUsuarios]   = useState([])
  const [modal, setModal]         = useState(false)
  const [modalPass, setModalPass] = useState(false)
  const [form, setForm]           = useState(FORM_VACIO)
  const [editId, setEditId]       = useState(null)
  const [passForm, setPassForm]   = useState({ id: null, password: '' })
  const [cargando, setCargando]   = useState(true)

  useEffect(() => { cargarUsuarios() }, [])

  const cargarUsuarios = async () => {
    try {
      const res = await api.get('/usuarios')
      setUsuarios(res.data.usuarios)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setCargando(false)
    }
  }

  const abrirNuevo  = () => { setForm(FORM_VACIO); setEditId(null); setModal(true) }
  const abrirEditar = (u) => {
    setForm({ nombre: u.nombre, email: u.email, password: '', rol: u.rol })
    setEditId(u.id)
    setModal(true)
  }
  const cerrar = () => { setModal(false); setEditId(null) }

  const guardar = async () => {
    if (!form.nombre || !form.email) return
    if (!editId && !form.password) return alert('La contraseña es requerida')
    try {
      if (editId) {
        await api.put(`/usuarios/${editId}`, { nombre: form.nombre, email: form.email, rol: form.rol, activo: true })
      } else {
        await api.post('/usuarios', form)
      }
      await cargarUsuarios()
      cerrar()
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar')
    }
  }

  const cambiarPassword = async () => {
    if (!passForm.password || passForm.password.length < 6) return alert('Mínimo 6 caracteres')
    try {
      await api.put(`/usuarios/${passForm.id}/password`, { password: passForm.password })
      setModalPass(false)
      alert('Contraseña actualizada')
    } catch (err) {
      alert('Error al cambiar contraseña')
    }
  }

  const desactivar = async (id) => {
    if (id === user?.id) return alert('No puedes desactivarte a ti mismo')
    if (!confirm('¿Desactivar este usuario?')) return
    await api.delete(`/usuarios/${id}`)
    cargarUsuarios()
  }

  const colorRol = (rol) => {
    if (rol === 'administrador') return 'bg-purple-50 text-purple-700'
    if (rol === 'cajero') return 'bg-blue-50 text-blue-700'
    return 'bg-amber-50 text-amber-700'
  }

  if (user?.rol !== 'administrador') {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full text-gray-400">
        <Shield size={48} className="mb-4 opacity-40"/>
        <p className="text-lg font-medium">Acceso restringido</p>
        <p className="text-sm mt-1">Solo el administrador puede gestionar usuarios</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Gestión de usuarios</h1>
          <p className="text-sm text-gray-400 mt-0.5">{usuarios.length} usuarios registrados</p>
        </div>
        <button onClick={abrirNuevo}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm transition-colors">
          <Plus size={16}/> Nuevo usuario
        </button>
      </div>

      {cargando ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Usuario</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Rol</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-800 text-xs font-semibold">
                        {u.nombre[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.nombre}</p>
                        {u.id === user?.id && <p className="text-xs text-green-600">Tú</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorRol(u.rol)}`}>
                      {u.rol}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {u.activo
                      ? <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">Activo</span>
                      : <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">Inactivo</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => abrirEditar(u)} title="Editar"
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors">
                        <Edit2 size={14}/>
                      </button>
                      <button onClick={() => { setPassForm({ id: u.id, password: '' }); setModalPass(true) }} title="Cambiar contraseña"
                        className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-500 transition-colors">
                        <Key size={14}/>
                      </button>
                      {u.id !== user?.id && (
                        <button onClick={() => desactivar(u.id)} title="Desactivar"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                          <Trash2 size={14}/>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal usuario */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-5">
              {editId ? 'Editar usuario' : 'Nuevo usuario'}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nombre *</label>
                <input value={form.nombre} onChange={e => setForm(f=>({...f,nombre:e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                  placeholder="Juan Pérez"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                  placeholder="juan@correo.cl"/>
              </div>
              {!editId && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Contraseña *</label>
                  <input type="password" value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                    placeholder="Mínimo 6 caracteres"/>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Rol</label>
                <select value={form.rol} onChange={e => setForm(f=>({...f,rol:e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200">
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
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

      {/* Modal cambiar contraseña */}
      {modalPass && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-5">Cambiar contraseña</h2>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nueva contraseña *</label>
              <input type="password" value={passForm.password}
                onChange={e => setPassForm(f=>({...f,password:e.target.value}))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                placeholder="Mínimo 6 caracteres"/>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModalPass(false)}
                className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={cambiarPassword}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors">
                Cambiar
              </button>
            </div>
          </div>
        </div>
      )}npm run dev
      
    </div>
  )
}