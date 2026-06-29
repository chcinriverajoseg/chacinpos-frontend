import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import Layout from './components/layout/Layout'
import Login from './pages/auth/Login'
import Dashboard from './pages/dashboard/Dashboard'
import POS from './pages/pos/POS'
import Inventario from './pages/inventario/Inventario'
import Caja from './pages/caja/Caja'
import Reportes from './pages/reportes/Reportes'
import Clientes from './pages/clientes/Clientes'

function PrivateRoute({ children }) {
  const { token } = useStore()
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/pos" replace />} />
          <Route path="dashboard"  element={<Dashboard />} />
          <Route path="pos"        element={<POS />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="caja"       element={<Caja />} />
          <Route path="reportes"   element={<Reportes />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="config"     element={<div className="p-6 text-gray-500">Configuración — próximamente</div>} />
        </Route>
        <Route path="*" element={<Navigate to="/pos" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
