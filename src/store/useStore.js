import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── Store principal: auth, carro, caja, config ────────────────────────────────
export const useStore = create(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      token: null,
      setUser: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null, carro: [] }),

      // Carro
      carro: [],
      agregarProducto: (producto, cantidad = 1) => {
        const { carro } = get()
        const existe = carro.find(i => i.id === producto.id)
        if (existe) {
          set({ carro: carro.map(i => i.id === producto.id ? { ...i, cantidad: i.cantidad + cantidad } : i) })
        } else {
          set({ carro: [...carro, { ...producto, cantidad }] })
        }
      },
      cambiarCantidad: (id, cantidad) => {
        if (cantidad <= 0) return get().eliminarDelCarro(id)
        set({ carro: get().carro.map(i => i.id === id ? { ...i, cantidad } : i) })
      },
      eliminarDelCarro: (id) => set({ carro: get().carro.filter(i => i.id !== id) }),
      limpiarCarro: () => set({ carro: [] }),

      // Caja
      cajaAbierta: false,
      cajaId: null,
      fondoInicial: 0,
      abrirCaja: (fondoInicial, cajaId) => set({ cajaAbierta: true, fondoInicial, cajaId }),
      cerrarCaja: () => set({ cajaAbierta: false, cajaId: null, fondoInicial: 0 }),

      // UI
      sidebarOpen: true,
      toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),

      // Config negocio
      negocio: {
        nombre: 'Mi Negocio',
        rut: '12.345.678-9',
        giro: 'Comercio al por menor',
        direccion: 'Dirección 1234, Ciudad',
        telefono: '',
        email: '',
      },
      setNegocio: (datos) => set(s => ({ negocio: { ...s.negocio, ...datos } })),
    }),
    {
      name: 'chacinpos-storage',
      partialize: (s) => ({ user: s.user, token: s.token, negocio: s.negocio, cajaAbierta: s.cajaAbierta, fondoInicial: s.fondoInicial }),
    }
  )
)

// ── Inventario ────────────────────────────────────────────────────────────────
export const useInventarioStore = create((set, get) => ({
  productos: [
    { id:1,  nombre:'Pan amasado',   codigo:'001', categoria:'Panadería',  precio:150,  costo:80,   stock:120, stockMin:20, tipo:'unidad', emoji:'🍞', activo:true },
    { id:2,  nombre:'Leche 1L',      codigo:'002', categoria:'Lácteos',    precio:990,  costo:700,  stock:48,  stockMin:10, tipo:'unidad', emoji:'🥛', activo:true },
    { id:3,  nombre:'Pollo entero',  codigo:'003', categoria:'Carnicería', precio:3490, costo:2100, stock:12,  stockMin:4,  tipo:'kilo',   emoji:'🍗', activo:true },
    { id:4,  nombre:'Arroz 1kg',     codigo:'004', categoria:'Abarrotes',  precio:1290, costo:850,  stock:55,  stockMin:15, tipo:'unidad', emoji:'🍚', activo:true },
    { id:5,  nombre:'Coca-Cola 2L',  codigo:'005', categoria:'Bebidas',    precio:1990, costo:1200, stock:24,  stockMin:6,  tipo:'unidad', emoji:'🥤', activo:true },
    { id:6,  nombre:'Queso gauda',   codigo:'006', categoria:'Lácteos',    precio:8900, costo:6000, stock:3,   stockMin:2,  tipo:'kilo',   emoji:'🧀', activo:true },
    { id:7,  nombre:'Tomate',        codigo:'007', categoria:'Verduras',   precio:1200, costo:700,  stock:30,  stockMin:5,  tipo:'peso',   emoji:'🍅', activo:true },
    { id:8,  nombre:'Azúcar 1kg',    codigo:'008', categoria:'Abarrotes',  precio:1100, costo:700,  stock:8,   stockMin:10, tipo:'unidad', emoji:'🍬', activo:true },
    { id:9,  nombre:'Aceite Chef',   codigo:'009', categoria:'Abarrotes',  precio:3200, costo:2100, stock:15,  stockMin:5,  tipo:'unidad', emoji:'🫙', activo:true },
    { id:10, nombre:'Detergente 1L', codigo:'010', categoria:'Limpieza',   precio:2490, costo:1500, stock:0,   stockMin:5,  tipo:'unidad', emoji:'🧴', activo:false },
  ],
  agregarProducto: (p) => set(s => ({ productos: [...s.productos, { ...p, id: Date.now(), activo: true }] })),
  actualizarProducto: (id, datos) => set(s => ({ productos: s.productos.map(p => p.id === id ? { ...p, ...datos } : p) })),
  eliminarProducto: (id) => set(s => ({ productos: s.productos.filter(p => p.id !== id) })),
  descontarStock: (id, cantidad) => set(s => ({
    productos: s.productos.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock - cantidad) } : p)
  })),
}))

// ── Caja / Billetes ───────────────────────────────────────────────────────────
const BILLETES_INIT = () => ({
  50000:{ entrada:0, salida:0 },
  20000:{ entrada:0, salida:0 },
  10000:{ entrada:0, salida:0 },
  5000: { entrada:0, salida:0 },
  2000: { entrada:0, salida:0 },
  1000: { entrada:0, salida:0 },
  500:  { entrada:0, salida:0 },
  100:  { entrada:0, salida:0 },
})

export const useCajaStore = create((set, get) => ({
  billetes: BILLETES_INIT(),
  movimientos: [],
  ventas: [],
  folioActual: 1001,

  registrarPago: (billetesRecibidos, billetesVuelto, venta) => {
    const billetes = { ...get().billetes }
    const movs = []
    const hora = new Date().toLocaleTimeString('es-CL')

    billetesRecibidos.forEach(({ denominacion, cantidad }) => {
      if (billetes[denominacion] !== undefined) {
        billetes[denominacion] = { ...billetes[denominacion], entrada: billetes[denominacion].entrada + cantidad }
        movs.push({ hora, tipo:'entrada', denominacion, cantidad, venta: venta.total, cajero: 'Cajero 1' })
      }
    })
    billetesVuelto.forEach(({ denominacion, cantidad }) => {
      if (billetes[denominacion] !== undefined) {
        billetes[denominacion] = { ...billetes[denominacion], salida: billetes[denominacion].salida + cantidad }
        movs.push({ hora, tipo:'salida', denominacion, cantidad, venta:'Cambio', cajero: 'Cajero 1' })
      }
    })

    set(s => ({
      billetes,
      movimientos: [...s.movimientos, ...movs],
      ventas: [...s.ventas, { ...venta, id: Date.now(), fecha: new Date().toISOString(), folio: s.folioActual }],
      folioActual: s.folioActual + 1,
    }))
  },

  resetCaja: () => set({ billetes: BILLETES_INIT(), movimientos: [] }),
}))
