import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, Users } from 'lucide-react'
import api from '../../api/axios'

const FORM_VACIO = { nombre:'', rut:'', email:'', telefono:'', direccion:'', giro:'' }

export default function Clientes() {
  const [clientes, setClientes]   = useState([])
  const [busqueda, setBusqueda]   = useState('')
  const [modal, setModal]         = useState(false)
  const [form, setForm]           = useState(FORM_VACIO)
  const [editId, setEditId]       = useState(null)
  const [tab, setTab]             = useState('clientes')
  const [proveedores, setProveedores] = useState([])
  const [formProv, setFormProv]   = useState({ nombre:'', rut:'', email:'', telefono:'', direccion:'', contacto:'' })
  const [editProvId, setEditProvId] = useState(null)
  const [modalProv, setModalProv] = useState(false)

  useEffect(() => {
    cargarClientes()
    cargarProveedores()
  }, [])

  const cargarClientes = () => {
    api.get('/clientes').then(res => setClientes(res.data.clientes)).catch(console.error)
  }

  const cargarProveedores = () => {
    api.get('/proveedores').then(res => setProveedores(res.data.proveedores)).catch(console.error)
  }

  const clientesFiltrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.rut && c.rut.includes(busqueda)) ||
    (c.email && c.email.toLowerCase().includes(busqueda.toLowerCase()))
  )

  const provFiltrados = proveedores.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.rut && p.rut.includes(busqueda))
  )

  // Clientes
  const abrirNuevo  = () => { setForm(FORM_VACIO); setEditId(null); setModal(true) }
  const abrirEditar = (c) => { setForm(c); setEditId(c.id); setModal(true) }
  const cerrar      = () => { setModal(false); setEditId(null) }

  /*const guardar = async () => {
    if (!form.nombre) return
    try {
      if (editId) await api.put(`/clientes/${editId}`, form)
      else await api.post('/clientes', form)
      await cargarClientes()
      cerrar()
    } catch (err) { console.error(err) }
  }*/

    const guardar = async () => {
  console.log('Guardando cliente:', form)
  if (!form.nombre) {
    console.log('Falta nombre')
    return
  }
  try {
    if (editId) await api.put(`/clientes/${editId}`, form)
    else await api.post('/clientes', form)
    await cargarClientes()
    cerrar()
  } catch (err) { 
    console.error('Error:', err) 
  }
}

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar cliente?')) return
    await api.delete(`/clientes/${id}`)
    cargarClientes()
  }

  // Proveedores
  const abrirNuevoProv  = () => { setFormProv({ nombre:'', rut:'', email:'', telefono:'', direccion:'', contacto:'' }); setEditProvId(null); setModalProv(true) }
  const abrirEditarProv = (p) => { setFormProv(p); setEditProvId(p.id); setModalProv(true) }
  const cerrarProv      = () => { setModalProv(false); setEditProvId(null) }

  const guardarProv = async () => {
    if (!formProv.nombre) return
    try {
      if (editProvId) await api.put(`/proveedores/${editProvId}`, formProv)
      else await api.post('/proveedores', formProv)
      await cargarProveedores()
      cerrarProv()
    } catch (err) { console.error(err) }
  }

  const eliminarProv = async (id) => {
    if (!confirm('¿Eliminar proveedor?')) return
    await api.delete(`/proveedores/${id}`)
    cargarProveedores()
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-gray-900">Clientes y Proveedores</h1>
        <button onClick={tab === 'clientes' ? abrirNuevo : abrirNuevoProv}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm transition-colors">
          <Plus size={16}/> {tab === 'clientes' ? 'Nuevo cliente' : 'Nuevo proveedor'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
        {['clientes','proveedores'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize
              ${tab===t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'clientes' ? `Clientes (${clientes.length})` : `Proveedores (${proveedores.length})`}
          </button>
        ))}
      </div>

      {/* Buscador */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
          className="w-full px-3 py-2 pl-9 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
          placeholder={`Buscar ${tab}...`}/>
      </div>

      {/* Tabla clientes */}
      {tab === 'clientes' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">RUT</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Teléfono</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Giro</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map(c => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.nombre}</td>
                  <td className="px-4 py-3 text-gray-500">{c.rut || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{c.email || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{c.telefono || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{c.giro || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => abrirEditar(c)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"><Edit2 size={14}/></button>
                      <button onClick={() => eliminar(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {clientesFiltrados.length === 0 && (
            <div className="flex flex-col items-center py-16 text-gray-300">
              <Users size={36} className="mb-2 opacity-40"/>
              <p className="text-sm">No hay clientes registrados</p>
            </div>
          )}
        </div>
      )}

      {/* Tabla proveedores */}
      {tab === 'proveedores' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">RUT</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Teléfono</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Contacto</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {provFiltrados.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.nombre}</td>
                  <td className="px-4 py-3 text-gray-500">{p.rut || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{p.email || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{p.telefono || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{p.contacto || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => abrirEditarProv(p)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"><Edit2 size={14}/></button>
                      <button onClick={() => eliminarProv(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {provFiltrados.length === 0 && (
            <div className="flex flex-col items-center py-16 text-gray-300">
              <Users size={36} className="mb-2 opacity-40"/>
              <p className="text-sm">No hay proveedores registrados</p>
            </div>
          )}
        </div>
      )}

      {/* Modal cliente */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-5">{editId ? 'Editar cliente' : 'Nuevo cliente'}</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Nombre *</label>
                <input value={form.nombre} onChange={e => setForm(f=>({...f,nombre:e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200" placeholder="Juan Pérez"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">RUT</label>
                <input value={form.rut} onChange={e => setForm(f=>({...f,rut:e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200" placeholder="12.345.678-9"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Teléfono</label>
                <input value={form.telefono} onChange={e => setForm(f=>({...f,telefono:e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200" placeholder="+56 9 1234 5678"/>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                <input value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200" placeholder="correo@ejemplo.cl"/>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Dirección</label>
                <input value={form.direccion} onChange={e => setForm(f=>({...f,direccion:e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200" placeholder="Av. Principal 1234"/>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Giro</label>
                <input value={form.giro} onChange={e => setForm(f=>({...f,giro:e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200" placeholder="Comercio al por menor"/>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={cerrar} className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={guardar} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal proveedor */}
      {modalProv && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-5">{editProvId ? 'Editar proveedor' : 'Nuevo proveedor'}</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Nombre *</label>
                <input value={formProv.nombre} onChange={e => setFormProv(f=>({...f,nombre:e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200" placeholder="Distribuidora XYZ"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">RUT</label>
                <input value={formProv.rut} onChange={e => setFormProv(f=>({...f,rut:e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200" placeholder="76.123.456-7"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Teléfono</label>
                <input value={formProv.telefono} onChange={e => setFormProv(f=>({...f,telefono:e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200" placeholder="+56 2 1234 5678"/>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                <input value={formProv.email} onChange={e => setFormProv(f=>({...f,email:e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200" placeholder="ventas@proveedor.cl"/>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Dirección</label>
                <input value={formProv.direccion} onChange={e => setFormProv(f=>({...f,direccion:e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200" placeholder="Calle Comercial 567"/>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Nombre contacto</label>
                <input value={formProv.contacto} onChange={e => setFormProv(f=>({...f,contacto:e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200" placeholder="Pedro González"/>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={cerrarProv} className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={guardarProv} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}