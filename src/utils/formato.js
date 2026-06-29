export const clp = (n) => '$' + Math.round(n).toLocaleString('es-CL')
export const clpNum = (n) => Math.round(n).toLocaleString('es-CL')
export const calcIVA = (total) => Math.round(total * 19 / 119)
export const calcNeto = (total) => total - calcIVA(total)

const DENOMINACIONES = [50000, 20000, 10000, 5000, 2000, 1000, 500, 100]
export const desgloseVuelto = (monto) => {
  let resto = Math.round(monto)
  const resultado = []
  DENOMINACIONES.forEach(d => {
    if (resto >= d) {
      const cantidad = Math.floor(resto / d)
      resultado.push({ denominacion: d, cantidad })
      resto -= d * cantidad
    }
  })
  return resultado
}

export const labelDenom = (d) => {
  if (d >= 1000) return `$${(d/1000).toFixed(0)}.000`
  return `$${d}`
}

export const precioLabel = (producto) => {
  if (producto.tipo === 'kilo') return `${clp(producto.precio)}/kg`
  if (producto.tipo === 'peso') return `${clp(producto.precio)}/100g`
  return clp(producto.precio)
}

export const totalItem = (item) => {
  if (item.tipo === 'kilo') return item.precio * item.cantidad
  if (item.tipo === 'peso') return Math.round(item.precio * (item.cantidad / 100))
  return item.precio * item.cantidad
}

export const subtotalCarro = (carro) => carro.reduce((s, i) => s + totalItem(i), 0)

export const estadoStock = (producto) => {
  if (producto.stock === 0) return 'sin-stock'
  if (producto.stock <= producto.stockMin) return 'bajo'
  return 'ok'
}

export const fechaCorta = (iso) =>
  new Date(iso).toLocaleDateString('es-CL', { day:'2-digit', month:'2-digit', year:'numeric' })

export const fechaHora = (iso) =>
  new Date(iso).toLocaleString('es-CL', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })