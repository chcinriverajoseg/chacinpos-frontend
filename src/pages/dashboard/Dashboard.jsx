import { useState, useEffect } from 'react'
import { TrendingUp, ShoppingCart, Package, DollarSign, AlertTriangle, ArrowRight, Users, TrendingDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts'
import { useStore } from '../../store/useStore'
import { clp } from '../../utils/formato'
import api from '../../api/axios'

const COLORES = ['#1D9E75', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function Dashboard() {
  const { user, negocio } = useStore()
  const navigate = useNavigate()
  const [datos, setDatos]       = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    setCargando(true)
    try {
      const res = await api.get('/ventas/dashboard')
      setDatos(res.data)
    } catch (err) {
      console.error('Error cargando dashboard:', err)
    } finally {
      setCargando(false)
    }
  }

  if (cargando) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  const totalHoy      = parseFloat(datos?.hoy?.total || 0)
  const transHoy      = parseInt(datos?.hoy?.transacciones || 0)
  const totalMes      = parseFloat(datos?.mes?.total || 0)
  const totalSemana   = parseFloat(datos?.semana?.total || 0)
  const semanaAnterior = parseFloat(datos?.semana_anterior?.total || 0)
  const utilidadDia   = parseFloat(datos?.utilidad_dia || 0)
  const stockBajo     = datos?.stock_bajo || 0
  const sinStock      = datos?.sin_stock  || 0
  const totalClientes = datos?.total_clientes || 0

  // Variación semana vs semana anterior
  const variacionSemana = semanaAnterior > 0
    ? ((totalSemana - semanaAnterior) / semanaAnterior * 100).toFixed(1)
    : 0

  const datosGrafico = (datos?.ventas7dias || []).map(d => ({
    fecha: new Date(d.fecha).toLocaleDateString('es-CL', { day:'2-digit', month:'2-digit' }),
    total: parseFloat(d.total),
    transacciones: parseInt(d.transacciones)
  }))

  const datosMes = (datos?.ventas_por_mes || []).map(d => ({
    mes: d.mes,
    total: parseFloat(d.total),
  }))

  const datosCategoria = (datos?.ventas_por_categoria || []).map(d => ({
    name: d.categoria || 'Sin categoría',
    value: parseFloat(d.total),
  }))

  const STATS = [
    { label:'Ventas hoy',     value: clp(totalHoy),    sub:`${transHoy} transacciones`,           icon: TrendingUp,  color:'text-green-600',  bg:'bg-green-50'  },
    { label:'Utilidad hoy',   value: clp(utilidadDia), sub:'margen bruto',                        icon: DollarSign,  color:'text-blue-600',   bg:'bg-blue-50'   },
    { label:'Ventas del mes', value: clp(totalMes),    sub:`${datos?.mes?.transacciones || 0} transacciones`, icon: ShoppingCart, color:'text-purple-600', bg:'bg-purple-50' },
    { label:'Alertas stock',  value: stockBajo + sinStock, sub:`${sinStock} sin stock`,           icon: Package,     color: stockBajo > 0 ? 'text-red-600' : 'text-green-600', bg: stockBajo > 0 ? 'bg-red-50' : 'bg-green-50' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Saludo */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Buenos días, {user?.nombre?.split(' ')[0] || 'usuario'} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {negocio.nombre} · {new Date().toLocaleDateString('es-CL', { weekday:'long', day:'numeric', month:'long' })}
          </p>
        </div>
        <button onClick={cargarDatos}
          className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon size={18} className={s.color}/>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            <p className="text-xs text-gray-300 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Comparativa semana */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Esta semana vs semana anterior</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{clp(totalSemana)}</p>
          </div>
          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium ${
            parseFloat(variacionSemana) >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {parseFloat(variacionSemana) >= 0
              ? <TrendingUp size={16}/>
              : <TrendingDown size={16}/>
            }
            {variacionSemana}% vs semana anterior ({clp(semanaAnterior)})
          </div>
        </div>
      </div>

      {/* Gráficos principales */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Ventas 7 días */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Ventas últimos 7 días</h2>
          {datosGrafico.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-300 text-sm">Sin datos aún</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={datosGrafico}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1D9E75" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#1D9E75" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="fecha" tick={{ fontSize:11 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => '$' + (v/1000).toFixed(0) + 'K'}/>
                <Tooltip formatter={v => [clp(v), 'Ventas']}
                  contentStyle={{ borderRadius:8, border:'1px solid #e5e7eb', fontSize:12 }}/>
                <Area type="monotone" dataKey="total" stroke="#1D9E75" strokeWidth={2} fill="url(#colorTotal)"/>
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top productos */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Top productos del mes</h2>
          {(datos?.top_productos || []).length === 0 ? (
            <p className="text-sm text-gray-300">Sin datos aún</p>
          ) : (
            <div className="space-y-3">
              {(datos?.top_productos || []).map((p, i) => (
                <div key={p.nombre} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-300 w-4">{i+1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-700 truncate">{p.nombre}</span>
                      <span className="text-xs font-semibold text-gray-500">{parseFloat(p.vendido).toFixed(0)}</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-green-500 h-full rounded-full"
                        style={{ width:`${(parseFloat(p.vendido)/parseFloat(datos.top_productos[0]?.vendido))*100}%`}}/>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Gráficos secundarios */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Ventas por mes */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Ventas últimos 6 meses</h2>
          {datosMes.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-300 text-sm">Sin datos aún</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={datosMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="mes" tick={{ fontSize:11 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => '$' + (v/1000).toFixed(0) + 'K'}/>
                <Tooltip formatter={v => [clp(v), 'Ventas']}
                  contentStyle={{ borderRadius:8, border:'1px solid #e5e7eb', fontSize:12 }}/>
                <Bar dataKey="total" fill="#1D9E75" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Ventas por categoría */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Ventas por categoría este mes</h2>
          {datosCategoria.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-300 text-sm">Sin datos aún</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={datosCategoria} cx="50%" cy="50%" outerRadius={70}
                  dataKey="value" nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                  labelLine={false}>
                  {datosCategoria.map((_, i) => (
                    <Cell key={i} fill={COLORES[i % COLORES.length]}/>
                  ))}
                </Pie>
                <Tooltip formatter={v => clp(v)}/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label:'Punto de venta', to:'/pos',        icon:ShoppingCart, primary:true  },
            { label:'Inventario',     to:'/inventario', icon:Package,      primary:false },
            { label:'Caja',           to:'/caja',       icon:DollarSign,   primary:false },
            { label:'Reportes',       to:'/reportes',   icon:TrendingUp,   primary:false },
          ].map(a => (
            <button key={a.to} onClick={() => navigate(a.to)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                a.primary ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}>
              <a.icon size={16}/>
              {a.label}
              <ArrowRight size={14} className="ml-auto opacity-50"/>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}