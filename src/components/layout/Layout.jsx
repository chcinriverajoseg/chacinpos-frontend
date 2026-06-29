import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ShoppingCart, Package, DollarSign, BarChart2, Settings, LogOut, Menu, Bell, AlertTriangle, Users } from 'lucide-react'
import { useStore, useInventarioStore } from '../../store/useStore'

const NAV = [
  { to: '/pos',        icon: ShoppingCart, label: 'Punto de venta' },
  { to: '/inventario', icon: Package,      label: 'Inventario' },
  { to: '/caja',       icon: DollarSign,   label: 'Caja' },
  { to: '/reportes',   icon: BarChart2,    label: 'Reportes' },
  { to: '/clientes',   icon: Users,        label: 'Clientes' },
  { to: '/config',     icon: Settings,     label: 'Configuración' },
]

export default function Layout() {
  const { sidebarOpen, toggleSidebar, user, logout, negocio, cajaAbierta } = useStore()
  const { productos } = useInventarioStore()
  const navigate = useNavigate()

  const alertas = productos.filter(p => p.stock === 0 || p.stock <= p.stockMin).length

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Sidebar */}
      <aside className={`flex flex-col bg-white border-r border-gray-100 transition-all duration-200 z-20 ${sidebarOpen ? 'w-56' : 'w-16'}`}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
            <ShoppingCart size={16} className="text-white" />
          </div>
          {sidebarOpen && (
            <div>
              <p className="text-sm font-semibold text-gray-900 leading-tight">ChacinPOS</p>
              <p className="text-xs text-gray-400 truncate max-w-[100px]">{negocio.nombre}</p>
            </div>
          )}
        </div>

        {/* Estado caja */}
        {sidebarOpen && (
          <div className={`mx-3 mt-3 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${cajaAbierta ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'}`}>
            <span className={`w-2 h-2 rounded-full ${cajaAbierta ? 'bg-green-500' : 'bg-red-500'}`}/>
            {cajaAbierta ? 'Caja abierta' : 'Caja cerrada'}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group ${isActive ? 'bg-green-50 text-green-800 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              {({ isActive }) => (
                <>
                  <Icon size={18} className={`flex-shrink-0 ${isActive ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  {sidebarOpen && <span className="truncate">{label}</span>}
                  {sidebarOpen && to === '/inventario' && alertas > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                      {alertas}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Usuario */}
        <div className="border-t border-gray-100 p-3">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-800 text-xs font-semibold flex-shrink-0">
                {user?.nombre?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">{user?.nombre || 'Usuario'}</p>
                <p className="text-xs text-gray-400">{user?.rol || 'Cajero'}</p>
              </div>
              <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} className="w-full flex justify-center p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
              <LogOut size={15} />
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center gap-4 px-6 flex-shrink-0">
          <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          {alertas > 0 && (
            <button onClick={() => navigate('/inventario')} className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">
              <AlertTriangle size={14} />
              {alertas} alerta{alertas > 1 ? 's' : ''} de stock
            </button>
          )}
          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <Bell size={18} />
          </button>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}