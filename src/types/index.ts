export interface Window2D {
  wall: 'north' | 'south' | 'east' | 'west'
  offset: number
  width: number
}

export interface RoomPoint {
  x: number
  z: number
}

export interface Room {
  id: string
  label: string
  x: number
  z: number
  w: number
  d: number
  color: string
  isBalcony?: boolean
  windows?: Window2D[]
  points?: RoomPoint[]
  labelX?: number
  labelZ?: number
}

export interface Wall {
  id: string
  x1: number
  z1: number
  x2: number
  z2: number
}

export interface FurnitureCatalogItem {
  id: string
  label: string
  category: string
  w: number
  d: number
  h: number
  elevation?: number  // altezza dal pavimento in metri (default 0)
  color: string
  icon: string
}

export interface PlacedFurniture {
  uid: string
  catalogId: string
  label: string
  x: number
  z: number
  w: number
  d: number
  h: number
  elevation?: number  // altezza dal pavimento in metri (default 0)
  rotation: number
  color: string
  wallId?: string | null
}
