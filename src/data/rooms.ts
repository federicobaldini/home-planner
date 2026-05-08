import type { Room, Wall } from '../types'

// Dati reali estratti da casa.sh3d (Sweet Home 3D).
// Coordinate in metri. Origine = angolo NW dell'edificio (x→est, z→sud).
// Conversione da SH3D: x = (x_sh3d + 8.5) / 100, z = (−y_sh3d − 4.17) / 100
// Colori dal file SH3D (formato AARRGGBB → #RRGGBB).

export const ROOMS: Room[] = [
  {
    id: 'salotto',
    label: 'Living room',
    x: 2.04, z: 0.04, w: 5.47, d: 4.25,
    color: '#FFB482',
    points: [
      { x: 2.04, z: 0.04 }, { x: 7.51, z: 0.04 },
      { x: 7.51, z: 4.29 }, { x: 2.04, z: 4.29 },
    ],
  },
  {
    id: 'corridoio1',
    label: 'Corridoio',
    x: 0.00, z: 0.00, w: 2.75, d: 6.19,
    color: '#F3FFA6',
    points: [
      { x: 0.00, z: 0.00 }, { x: 0.00, z: 6.19 },
      { x: 2.75, z: 6.19 }, { x: 2.75, z: 4.37 },
      { x: 1.96, z: 4.37 }, { x: 1.96, z: 0.00 },
    ],
  },
  {
    id: 'corridoio2',
    label: 'Corridoio',
    x: 2.83, z: 4.37, w: 2.06, d: 5.43,
    color: '#4AD7FF',
    labelX: 3.86, labelZ: 5.28,   // bounding-box center è fuori dal poligono L
    points: [
      { x: 2.83, z: 6.19 }, { x: 2.83, z: 4.37 },
      { x: 4.89, z: 4.37 }, { x: 4.89, z: 9.80 },
      { x: 3.56, z: 9.80 }, { x: 3.56, z: 6.19 },
    ],
  },
  {
    id: 'balcone_grande',
    label: 'Balcone',
    x: 7.80, z: 0.04, w: 1.37, d: 5.39,
    color: '#A366FF',
    isBalcony: true,
    points: [
      { x: 7.80, z: 0.04 }, { x: 9.17, z: 0.04 },
      { x: 9.17, z: 5.43 }, { x: 7.80, z: 5.43 },
    ],
  },
  {
    id: 'cucina',
    label: 'Cucina',
    x: 0.00, z: 6.27, w: 3.48, d: 5.50,
    color: '#FF239F',
    points: [
      { x: 0.00, z: 11.77 }, { x: 2.75, z: 11.77 },
      { x: 2.75, z: 9.80  }, { x: 3.48, z: 9.80  },
      { x: 3.48, z: 6.27  }, { x: 0.00, z: 6.29  },
    ],
  },
  {
    id: 'camera_matrimoniale',
    label: 'Camera matrimoniale',
    x: 4.97, z: 9.01, w: 3.91, d: 4.00,
    color: '#6977FF',
    points: [
      { x: 4.97, z: 13.01 }, { x: 8.88, z: 13.01 },
      { x: 8.88, z: 9.01  }, { x: 4.97, z: 9.01  },
    ],
  },
  {
    id: 'bagno',
    label: 'Bagno',
    x: 2.83, z: 9.88, w: 2.06, d: 3.13,
    color: '#71FFB4',
    points: [
      { x: 3.05, z: 13.01 }, { x: 4.89, z: 13.01 },
      { x: 4.89, z: 9.88  }, { x: 2.83, z: 9.88  },
      { x: 2.83, z: 11.77 }, { x: 3.05, z: 11.77 },
    ],
  },
  {
    id: 'balcone_piccolo',
    label: 'Balcone',
    x: -0.26, z: 12.01, w: 3.01, d: 1.44,
    color: '#FF911A',
    isBalcony: true,
    points: [
      { x: -0.26, z: 12.01 }, { x: 2.75, z: 12.01 },
      { x:  2.75, z: 13.45 }, { x: -0.26, z: 13.45 },
    ],
  },
  {
    id: 'camera_singola1',
    label: 'Camera singola',
    x: 4.97, z: 7.15, w: 3.91, d: 1.78,
    color: '#FF521D',
    points: [
      { x: 4.97, z: 7.15 }, { x: 8.88, z: 7.15 },
      { x: 8.88, z: 8.93 }, { x: 4.97, z: 8.93 },
    ],
  },
  {
    id: 'camera_singola2',
    label: 'Camera singola',
    x: 4.97, z: 4.37, w: 3.91, d: 2.70,
    color: '#009904',
    points: [
      { x: 4.97, z: 7.07 }, { x: 4.97, z: 4.37 },
      { x: 7.51, z: 4.37 }, { x: 7.51, z: 5.75 },
      { x: 8.88, z: 5.75 }, { x: 8.88, z: 7.07 },
    ],
  },
]

// Segmenti di muro estratti da casa.sh3d — tutti a spessore 7.5 cm.
// Ogni segmento è orizzontale (z1==z2) o verticale (x1==x2).
export const WALLS: Wall[] = [
  // Muro ovest esterno (due tratti separati)
  { id: 'w01', x1: 0.00, z1: 0.00, x2: 0.00, z2: 6.23 },
  { id: 'w07', x1: 0.00, z1: 6.29, x2: 0.00, z2: 11.81 },
  // Muro nord esterno
  { id: 'w13', x1: 0.00, z1: 0.00, x2: 2.00, z2: 0.00 },
  { id: 'w25', x1: 2.00, z1: 0.00, x2: 7.55, z2: 0.00 },
  // Muro sud esterno
  { id: 'w10', x1: 3.01, z1: 13.05, x2: 4.93, z2: 13.05 },
  { id: 'w14', x1: 4.93, z1: 13.05, x2: 8.92, z2: 13.05 },
  // Muro est esterno (tre tratti)
  { id: 'w19', x1: 8.92, z1: 5.71, x2: 8.92, z2: 7.11 },
  { id: 'w17', x1: 8.92, z1: 7.11, x2: 8.92, z2: 8.97 },
  { id: 'w15', x1: 8.92, z1: 8.97, x2: 8.92, z2: 13.05 },
  // Muri interni orizzontali
  { id: 'w02', x1: 0.00, z1: 6.23, x2: 3.52, z2: 6.23 },
  { id: 'w04', x1: 2.79, z1: 9.84, x2: 3.52, z2: 9.84 },
  { id: 'w06', x1: 0.00, z1: 11.81, x2: 2.79, z2: 11.81 },
  { id: 'w08', x1: 2.79, z1: 11.81, x2: 3.01, z2: 11.81 },
  { id: 'w11', x1: 2.00, z1: 4.33, x2: 4.93, z2: 4.33 },
  { id: 'w16', x1: 4.93, z1: 8.97, x2: 8.92, z2: 8.97 },
  { id: 'w18', x1: 4.93, z1: 7.11, x2: 8.92, z2: 7.11 },
  { id: 'w20', x1: 7.55, z1: 5.71, x2: 8.92, z2: 5.71 },
  { id: 'w23', x1: 4.93, z1: 4.33, x2: 7.55, z2: 4.33 },
  { id: 'w26', x1: 3.52, z1: 9.84, x2: 4.93, z2: 9.84 },
  // Muri interni verticali
  { id: 'w03', x1: 3.52, z1: 6.23, x2: 3.52, z2: 9.84 },
  { id: 'w05', x1: 2.79, z1: 9.84, x2: 2.79, z2: 11.81 },
  { id: 'w09', x1: 3.01, z1: 11.81, x2: 3.01, z2: 13.05 },
  { id: 'w12', x1: 2.00, z1: 0.00, x2: 2.00, z2: 4.33 },
  { id: 'w21', x1: 7.55, z1: 4.33, x2: 7.55, z2: 5.71 },
  { id: 'w24', x1: 7.55, z1: 0.00, x2: 7.55, z2: 4.33 },
  { id: 'w27', x1: 2.79, z1: 4.33, x2: 2.79, z2: 6.23 },
  { id: 'w28', x1: 4.93, z1: 8.97, x2: 4.93, z2: 13.05 },
  { id: 'w29', x1: 4.93, z1: 4.33, x2: 4.93, z2: 8.97 },
]

export const BUILDING_WIDTH  = 8.92
export const BUILDING_DEPTH  = 13.05
export const CEILING_HEIGHT  = 3.00
export const WALL_THICKNESS  = 0.075

// Bounds della vista 2D in metri (includono balconi + margini)
export const VIEW_LEFT   = -0.50
export const VIEW_TOP    = -0.30
export const VIEW_RIGHT  =  9.50
export const VIEW_BOTTOM = 14.00
