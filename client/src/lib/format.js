export function formatINR(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`
}

export function formatCount(count) {
  const n = Number(count || 0)
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toString()
}

export function formatDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function deliveryDate(days = 5) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return `Get it by ${d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}`
}
