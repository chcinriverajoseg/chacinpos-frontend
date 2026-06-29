import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Eye, EyeOff, Lock, User } from 'lucide-react'
import { useStore } from '../../store/useStore'
import api from '../../api/axios'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { setUser } = useStore()
  const navigate    = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', { email, password })
      setUser(res.data.usuario, res.data.token)
      navigate('/pos')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al conectar con el servidor')
    }
    setLoading(false)
  }

  const loginRapido = (email, password) => {
    setEmail(email)
    setPassword(password)
  }

  const USUARIOS_DEMO = [
    { nombre:'José Chacín',  email:'admin@chacinpos.cl',  password:'admin123',  rol:'Administrador' },
    { nombre:'Ana Martínez', email:'cajera@chacinpos.cl', password:'cajero123', rol:'Cajero' },
    { nombre:'Luis Pérez',   email:'bodega@chacinpos.cl', password:'bodega123', rol:'Bodega' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-600 shadow-lg mb-4">
            <ShoppingCart size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ChacinPOS</h1>
          <p className="text-gray-500 text-sm mt-1">Sistema de punto de venta — Chile</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Correo electrónico</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 pl-9 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                  placeholder="usuario@correo.cl" required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Contraseña</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pl-9 pr-9 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                  placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
              {loading
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : 'Ingresar'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-3 text-center">Acceso rápido (demo)</p>
            <div className="space-y-2">
              {USUARIOS_DEMO.map(u => (
                <button key={u.email} onClick={() => loginRapido(u.email, u.password)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 border border-gray-100 text-left transition-colors">
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-800 text-xs font-semibold">
                    {u.nombre[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{u.nombre}</p>
                    <p className="text-xs text-gray-400">{u.rol}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">ChacinPOS v1.0 · Hecho en Chile 🇨🇱</p>
      </div>
    </div>
  )
}