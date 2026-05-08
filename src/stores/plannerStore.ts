import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { ROOMS, WALLS, WALL_THICKNESS } from '../data/rooms'
import { APERTURE_IDS } from '../data/furnitureCatalog'
import type { PlacedFurniture, FurnitureCatalogItem } from '../types'

const STORAGE_KEY = 'home_planner_v1'

// During drag, snap to a wall within this distance (meters).
// Apertures follow the mouse freely outside this zone and lock to the
// nearest wall on mouse release (finalizeAperture).
const SNAP_THRESHOLD = 0.15

// ─── Collision & snap helpers ─────────────────────────────────────────────────

const SNAP_DIST = 0.12   // meters — snap threshold for walls & furniture edges
const OVERLAP_EPS = 0.002 // 2 mm tolerance so touching edges don't count as collision

type Rect = { x0: number; x1: number; z0: number; z1: number }

function furnitureRect(x: number, z: number, f: PlacedFurniture): Rect {
  return { x0: x - f.w / 2, x1: x + f.w / 2, z0: z - f.d / 2, z1: z + f.d / 2 }
}

function buildWallRects(): Rect[] {
  const T = WALL_THICKNESS / 2
  return WALLS.map(w => {
    const isVert = Math.abs(w.x1 - w.x2) < 0.01
    return isVert
      ? { x0: w.x1 - T, x1: w.x1 + T, z0: Math.min(w.z1, w.z2), z1: Math.max(w.z1, w.z2) }
      : { x0: Math.min(w.x1, w.x2), x1: Math.max(w.x1, w.x2), z0: w.z1 - T, z1: w.z1 + T }
  })
}

const WALL_RECTS = buildWallRects()

function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x0 + OVERLAP_EPS < b.x1 && a.x1 - OVERLAP_EPS > b.x0 &&
         a.z0 + OVERLAP_EPS < b.z1 && a.z1 - OVERLAP_EPS > b.z0
}

function heightsOverlap(a: PlacedFurniture, b: PlacedFurniture): boolean {
  const aBot = a.elevation ?? 0, aTop = aBot + a.h
  const bBot = b.elevation ?? 0, bTop = bBot + b.h
  return aBot + 0.01 < bTop && aTop - 0.01 > bBot
}

// ─── Snap & collision resolve ─────────────────────────────────────────────────

function snapToWall(
  currentW: number,
  currentD: number,
  rawX: number,
  rawZ: number,
  threshold: number,
): { x: number; z: number; w: number; d: number; wallId: string } | null {
  const openingWidth = Math.max(currentW, currentD)
  const thickness    = Math.min(currentW, currentD)

  let bestScore = threshold
  let best: { x: number; z: number; w: number; d: number; wallId: string } | null = null

  for (const wall of WALLS) {
    const isVert = Math.abs(wall.x1 - wall.x2) < 0.01

    if (isVert) {
      const perpDist = Math.abs(rawX - wall.x1)
      // Prefer walls whose Z range contains the cursor; tiny penalty otherwise
      const inRange  = rawZ >= Math.min(wall.z1, wall.z2) && rawZ <= Math.max(wall.z1, wall.z2)
      const score    = perpDist + (inRange ? 0 : 0.001)
      if (score < bestScore) {
        const zMin = Math.min(wall.z1, wall.z2) + openingWidth / 2
        const zMax = Math.max(wall.z1, wall.z2) - openingWidth / 2
        if (zMin <= zMax) {
          bestScore = score
          best = {
            x: wall.x1,
            z: Math.max(zMin, Math.min(zMax, rawZ)),
            w: thickness,
            d: openingWidth,
            wallId: wall.id,
          }
        }
      }
    } else {
      const perpDist = Math.abs(rawZ - wall.z1)
      const inRange  = rawX >= Math.min(wall.x1, wall.x2) && rawX <= Math.max(wall.x1, wall.x2)
      const score    = perpDist + (inRange ? 0 : 0.001)
      if (score < bestScore) {
        const xMin = Math.min(wall.x1, wall.x2) + openingWidth / 2
        const xMax = Math.max(wall.x1, wall.x2) - openingWidth / 2
        if (xMin <= xMax) {
          bestScore = score
          best = {
            x: Math.max(xMin, Math.min(xMax, rawX)),
            z: wall.z1,
            w: openingWidth,
            d: thickness,
            wallId: wall.id,
          }
        }
      }
    }
  }

  return best
}

function resolveMovement(
  item: PlacedFurniture,
  newX: number,
  newZ: number,
  allFurniture: PlacedFurniture[],
): { x: number; z: number } {
  const hw = item.w / 2
  const hd = item.d / 2
  const T  = WALL_THICKNESS / 2

  // ── 1. Snap to wall faces ──────────────────────────────────────────────────
  for (const wall of WALLS) {
    const isVert = Math.abs(wall.x1 - wall.x2) < 0.01
    if (isVert) {
      const lf = wall.x1 - T  // left face
      const rf = wall.x1 + T  // right face
      // Approaching from the left → snap right edge to left face
      const gl = lf - (newX + hw)
      if (gl >= 0 && gl < SNAP_DIST) newX = lf - hw
      // Approaching from the right → snap left edge to right face
      const gr = (newX - hw) - rf
      if (gr >= 0 && gr < SNAP_DIST) newX = rf + hw
    } else {
      const tf = wall.z1 - T  // top face (lower z)
      const bf = wall.z1 + T  // bottom face (higher z)
      const gt = tf - (newZ + hd)
      if (gt >= 0 && gt < SNAP_DIST) newZ = tf - hd
      const gb = (newZ - hd) - bf
      if (gb >= 0 && gb < SNAP_DIST) newZ = bf + hd
    }
  }

  // ── 2. Snap to other furniture edges (skip if snap would penetrate a wall) ──
  for (const other of allFurniture) {
    if (other.uid === item.uid || APERTURE_IDS.has(other.catalogId) || !heightsOverlap(item, other)) continue
    const or = furnitureRect(other.x, other.z, other)
    const gxr = or.x0 - (newX + hw)
    if (gxr >= 0 && gxr < SNAP_DIST) {
      const cx = or.x0 - hw
      if (!WALL_RECTS.some(wr => rectsOverlap(furnitureRect(cx, newZ, item), wr))) newX = cx
    }
    const gxl = (newX - hw) - or.x1
    if (gxl >= 0 && gxl < SNAP_DIST) {
      const cx = or.x1 + hw
      if (!WALL_RECTS.some(wr => rectsOverlap(furnitureRect(cx, newZ, item), wr))) newX = cx
    }
    const gzb = or.z0 - (newZ + hd)
    if (gzb >= 0 && gzb < SNAP_DIST) {
      const cz = or.z0 - hd
      if (!WALL_RECTS.some(wr => rectsOverlap(furnitureRect(newX, cz, item), wr))) newZ = cz
    }
    const gzt = (newZ - hd) - or.z1
    if (gzt >= 0 && gzt < SNAP_DIST) {
      const cz = or.z1 + hd
      if (!WALL_RECTS.some(wr => rectsOverlap(furnitureRect(newX, cz, item), wr))) newZ = cz
    }
  }

  // ── 3. Collision resolution ────────────────────────────────────────────────
  // For walls: clamp to the nearest wall face (don't revert to origin).
  // For furniture: revert axis to current position (slide behavior).

  const wallClamp = (pos: number, isX: boolean, crossPos: number): number => {
    for (const wr of WALL_RECTS) {
      const r = isX ? furnitureRect(pos, crossPos, item) : furnitureRect(crossPos, pos, item)
      if (!rectsOverlap(r, wr)) continue
      // Pick face closest to pos
      const faceA = isX ? wr.x0 - hw : wr.z0 - hd
      const faceB = isX ? wr.x1 + hw : wr.z1 + hd
      return Math.abs(faceA - pos) <= Math.abs(faceB - pos) ? faceA : faceB
    }
    return pos
  }

  const furnCollides = (cx: number, cz: number): boolean =>
    allFurniture.some(f => {
      if (f.uid === item.uid || APERTURE_IDS.has(f.catalogId) || !heightsOverlap(item, f)) return false
      return rectsOverlap(furnitureRect(cx, cz, item), furnitureRect(f.x, f.z, f))
    })

  let resolvedX = WALL_RECTS.some(wr => rectsOverlap(furnitureRect(newX, item.z, item), wr))
    ? wallClamp(newX, true, item.z)
    : newX
  if (furnCollides(resolvedX, item.z)) resolvedX = item.x

  let resolvedZ = WALL_RECTS.some(wr => rectsOverlap(furnitureRect(resolvedX, newZ, item), wr))
    ? wallClamp(newZ, false, resolvedX)
    : newZ
  if (furnCollides(resolvedX, resolvedZ)) resolvedZ = item.z

  return { x: resolvedX, z: resolvedZ }
}

export const usePlannerStore = defineStore('planner', () => {
  const rooms = ref(ROOMS)
  const placedFurniture = ref<PlacedFurniture[]>([])
  const selectedUid = ref<string | null>(null)
  const view = ref<'2d' | '3d' | 'both'>('both')

  // ─── Persistence ──────────────────────────────────────────────────────────

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try { placedFurniture.value = JSON.parse(stored) } catch { /* ignore corrupt data */ }
  }

  watch(placedFurniture, val => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  }, { deep: true })

  async function exportPlan(): Promise<void> {
    const payload = JSON.stringify({ version: 1, furniture: placedFurniture.value }, null, 2)

    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: 'home-plan.json',
          types: [{ description: 'Piano JSON', accept: { 'application/json': ['.json'] } }],
        })
        const writable = await handle.createWritable()
        await writable.write(payload)
        await writable.close()
      } catch (e) {
        if ((e as DOMException).name !== 'AbortError') console.error(e)
      }
    } else {
      // Fallback per browser senza File System Access API (Firefox, Safari)
      const blob = new Blob([payload], { type: 'application/json' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = 'home-plan.json'
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 100)
    }
  }

  function importPlan(file: File): void {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (Array.isArray(data?.furniture)) {
          placedFurniture.value = data.furniture
          selectedUid.value = null
        }
      } catch { /* ignore malformed file */ }
    }
    reader.readAsText(file)
  }

  function clearPlan(): void {
    placedFurniture.value = []
    selectedUid.value = null
  }

  // ─── Furniture actions ─────────────────────────────────────────────────────

  function addFurniture(item: FurnitureCatalogItem, x = 5.0, z = 5.0) {
    const uid = `${item.id}_${Date.now()}`
    const placed: PlacedFurniture = {
      uid,
      catalogId: item.id,
      label: item.label,
      x,
      z,
      w: item.w,
      d: item.d,
      h: item.h,
      elevation: item.elevation ?? 0,
      rotation: 0,
      color: item.color,
      wallId: null,
    }

    if (APERTURE_IDS.has(item.id)) {
      // Always snap to nearest wall regardless of distance for initial placement
      const snapped = snapToWall(item.w, item.d, x, z, Infinity)
      if (snapped) {
        placed.x = snapped.x; placed.z = snapped.z
        placed.w = snapped.w; placed.d = snapped.d
        placed.wallId = snapped.wallId
      }
    }

    placedFurniture.value.push(placed)
    selectedUid.value = uid
  }

  function moveFurniture(uid: string, x: number, z: number) {
    const item = placedFurniture.value.find(f => f.uid === uid)
    if (!item) return

    if (APERTURE_IDS.has(item.catalogId)) {
      const snapped = snapToWall(item.w, item.d, x, z, SNAP_THRESHOLD)
      if (snapped) {
        // Lock to nearby wall
        item.x = snapped.x; item.z = snapped.z
        item.w = snapped.w; item.d = snapped.d
        item.wallId = snapped.wallId
      } else {
        // Follow the mouse freely between walls; will snap to nearest on release
        item.x = x; item.z = z; item.wallId = null
      }
    } else {
      const resolved = resolveMovement(item, x, z, placedFurniture.value)
      item.x = resolved.x
      item.z = resolved.z
    }
  }

  // Called on drag-end: ensures any temporarily free aperture ends up on a wall
  function finalizeAperture(uid: string): void {
    const item = placedFurniture.value.find(f => f.uid === uid)
    if (!item || !APERTURE_IDS.has(item.catalogId) || item.wallId) return
    const snapped = snapToWall(item.w, item.d, item.x, item.z, Infinity)
    if (snapped) {
      item.x = snapped.x; item.z = snapped.z
      item.w = snapped.w; item.d = snapped.d
      item.wallId = snapped.wallId
    }
  }

  function rotateFurniture(uid: string) {
    const item = placedFurniture.value.find(f => f.uid === uid)
    if (!item) return

    if (APERTURE_IDS.has(item.catalogId) && item.wallId) {
      // Flip door-swing / window-handle direction; keep wall alignment
      item.rotation = item.rotation === 0 ? 1 : 0
    } else {
      item.rotation = (item.rotation + 90) % 360
      const tmp = item.w; item.w = item.d; item.d = tmp
    }
  }

  function removeFurniture(uid: string) {
    placedFurniture.value = placedFurniture.value.filter(f => f.uid !== uid)
    if (selectedUid.value === uid) selectedUid.value = null
  }

  function selectFurniture(uid: string | null) {
    selectedUid.value = uid
  }

  return {
    rooms,
    placedFurniture,
    selectedUid,
    view,
    addFurniture,
    moveFurniture,
    finalizeAperture,
    rotateFurniture,
    removeFurniture,
    selectFurniture,
    exportPlan,
    importPlan,
    clearPlan,
  }
})
