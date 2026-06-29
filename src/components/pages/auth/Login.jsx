import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Eye, EyeOff, Lock, User } from 'lucide-react'
import { useStore } from '../../store/useStore'

const USUARIOS_DEMO = [
  { id:1, nombre:'José Chacín',  email:'admin@chacinpos.cl',  password:'admin123',  rol:'Administrador' },
  { id:2, nombre:'Ana Martínez', email:'cajera@chacinpos.cl', password:'cajero123', rol:'Cajero' },
  { id:3, nombre:'Luis Pérez',   email:'bodega@chacinpos.cl', password:'bodega123', rol:'Bodega' },
]

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
    await new Promise(r => setTimeout(r, 600))
    const user = USUARIOS_DEMO.find(u => u.email === email && u.password === password)
    if (user) {
      setUser(user, 'token-demo-' + user.id)
      navigate('/pos')
    } else {
      setError('Correo o contraseña incorrectos')
    }
    setLoading(false)
  }

  const loginRapido = (u) => { setEmail(u.email); setPassword(u.password) }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-400 shadow-lg mb-4">
            <ShoppingCart size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ChacinPOS</h1>
          <p className="text-gray-500 text-sm mt-1">Sistema de punto de venta — Chile</p>
        </div>

        {/* Card */}
        <div className="card p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Correo electrónico</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input pl-9"
                  placeholder="usuario@correo.cl"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Contraseña</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input pl-9 pr-9"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : 'Ingresar'}
            </button>
          </form>

          {/* Accesos rápidos demo */}
          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-3 text-center">Acceso rápido (demo)</p>
            <div className="space-y-2">
              {USUARIOS_DEMO.map(u => (
                <button key={u.id} onClick={() => loginRapido(u)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 border border-gray-100 text-left transition-colors">
                  <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 text-xs font-semibold">
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

        <p className="text-center text-xs text-gray-400 mt-6">
          ChacinPOS v1.0 · Hecho en Chile 🇨🇱
        </p>
      </div>
    </div>
  )
}
