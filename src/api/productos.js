import api from './axios'

export const getProductos    = () => api.get('/productos')
export const crearProducto   = (data) => api.post('/productos', data)
export const actualizarProducto = (id, data) => api.put(`/productos/${id}`, data)
export const eliminarProducto = (id) => api.delete(`/productos/${id}`)
export const buscarProducto  = (q) => api.get(`/productos/buscar?q=${q}`)