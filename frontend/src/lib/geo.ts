type Point = { lat: number; lng: number }

const EARTH_RADIUS_KM = 6371

const toRadians = (degrees: number) => (degrees * Math.PI) / 180

// Straight-line (great-circle) distance in kilometres.
export function distanceKm(a: Point, b: Point) {
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

// The item closest to `from`, or undefined when the list is empty.
export function nearestTo<T>(from: Point, items: T[], position: (item: T) => Point | undefined) {
  let best: { item: T; km: number } | undefined
  for (const item of items) {
    const point = position(item)
    if (!point) continue
    const km = distanceKm(from, point)
    if (!best || km < best.km) best = { item, km }
  }
  return best
}
