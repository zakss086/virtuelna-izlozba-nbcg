// Colors for places that cannot read the CSS tokens in index.css: the three.js 3D room and the Leaflet route line.
// Matched to the nb-cg.me palette in DESIGN.md. Components import these instead of writing color values inline.
// three.js parses the comma form of hsl(), so keep it that way.

export const SCENE = {
  wall: 'hsl(40, 25%, 90%)',
  floor: 'hsl(30, 20%, 22%)',
  ceiling: 'hsl(40, 20%, 95%)',
  frame: 'hsl(41, 49%, 55%)',
  backdrop: 'hsl(0, 0%, 12%)',
}

export const MAP_ROUTE_COLOR = 'hsl(41, 49%, 55%)'
