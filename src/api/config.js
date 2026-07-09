import api from './axios'

export const getConfiguracion = () => api.get('/config')
export const actualizarConfiguracion = (data) => api.put('/config', data)