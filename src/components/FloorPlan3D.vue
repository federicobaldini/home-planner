<template>
  <div class="floor-plan-3d" ref="containerRef">

    <!-- Overlay walk-mode -->
    <div v-if="walkMode" class="walk-overlay">
      <span class="walk-hint"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> muoviti &nbsp;·&nbsp; mouse guarda &nbsp;·&nbsp; <kbd>ESC</kbd> esci</span>
      <button class="walk-exit-btn" @click="exitWalk">← Vista aerea</button>
    </div>

    <!-- Pulsante entra (solo in orbit mode) -->
    <button v-else class="walk-enter-btn" @click="enterWalk">👁 Entra</button>

    <div v-if="!walkMode" class="sun-panel">
      <div class="sun-title">Sole e ombre</div>
      <label>
        <span>Nord planimetria</span>
        <select v-model.number="northDeg">
          <option :value="0">Nord in alto</option>
          <option :value="90">Nord a destra (casa)</option>
          <option :value="180">Nord in basso</option>
          <option :value="270">Nord a sinistra</option>
        </select>
      </label>
      <label>
        <span>Ora {{ formattedHour }}</span>
        <input v-model.number="timeOfDay" type="range" min="0" max="24" step="0.25">
      </label>
    </div>

    <TresCanvas :clear-color="skyColor" shadows :shadow-map-type="THREE.PCFSoftShadowMap">
      <!-- look-at omesso: in orbit mode lo gestisce OrbitControls, in walk mode WalkControls -->
      <TresPerspectiveCamera :key="camKey" :position="[BW / 2, 14, -7]" />

      <OrbitControls v-if="!walkMode" make-default :target="[BW / 2, 0, BD / 2]" />
      <WalkControls  v-if=" walkMode" :active="walkMode" :lock-target="containerRef" @exit="exitWalk" />

      <TresAmbientLight :intensity="ambientIntensity" />
      <TresHemisphereLight color="#dbeafe" ground-color="#d4b896" :intensity="hemiIntensity" />
      <TresDirectionalLight
        :position="sunPosition"
        :intensity="sunIntensity"
        cast-shadow
        :shadow-mapSize-width="2048"
        :shadow-mapSize-height="2048"
        :shadow-camera-left="-12"
        :shadow-camera-right="12"
        :shadow-camera-top="12"
        :shadow-camera-bottom="-12"
        :shadow-camera-near="1"
        :shadow-camera-far="40"
      />
      <TresMesh v-if="sunPath.altitude >= 0" :position="sunMarkerPosition">
        <TresSphereGeometry :args="[0.18, 24, 16]" />
        <TresMeshBasicMaterial color="#facc15" />
      </TresMesh>

      <!-- Mirror group: scale x by -1 and shift by BW so east appears on right (matching 2D) -->
      <TresGroup :scale="[-1, 1, 1]" :position="[BW, 0, 0]">
        <!-- Floor base -->
        <TresMesh :rotation="[-Math.PI / 2, 0, 0]" :position="[BW / 2, 0, BD / 2]" receive-shadow>
          <TresPlaneGeometry :args="[BW, BD]" />
          <TresMeshStandardMaterial color="#d6d3d1" :side="THREE.DoubleSide" />
        </TresMesh>

        <!-- Ceiling (only in walk/first-person mode) — box to block directional light -->
        <TresMesh v-if="walkMode" :position="[BW / 2, H + 0.025, BD / 2]" cast-shadow receive-shadow>
          <TresBoxGeometry :args="[BW, 0.05, BD]" />
          <TresMeshStandardMaterial color="#f5f5f4" />
        </TresMesh>

        <!-- Room floor color patches -->
        <TresMesh
          v-for="room in mainRooms"
          :key="room.id"
          :rotation="[-Math.PI / 2, 0, 0]"
          :position="[0, 0.005, 0]"
          receive-shadow
        >
          <primitive :object="allRoomGeometries[room.id]" attach="geometry" />
          <TresMeshStandardMaterial
            color="#ffffff"
            :map="floorTexture(room.id)"
            :roughness="0.74"
            :side="THREE.DoubleSide"
          />
        </TresMesh>

        <!-- Balcony slabs -->
        <TresMesh
          v-for="room in balconies"
          :key="room.id"
          :rotation="[-Math.PI / 2, 0, 0]"
          :position="[0, 0.001, 0]"
          receive-shadow
        >
          <primitive :object="allRoomGeometries[room.id]" attach="geometry" />
          <TresMeshStandardMaterial color="#a7f3d0" :side="THREE.DoubleSide" />
        </TresMesh>

        <!-- Walls — split around aperture openings -->
        <TresMesh v-for="seg in wallSegments" :key="seg.id" :position="seg.position" cast-shadow receive-shadow>
          <TresBoxGeometry :args="seg.size" />
          <TresMeshStandardMaterial :color="seg.color" :side="THREE.DoubleSide" />
        </TresMesh>

        <!-- Aperture 3D: porte, finestre e portefinestre dentro i vuoti nei muri -->
        <template v-for="item in apertureFurniture" :key="`ap3d-${item.uid}`">
          <template v-if="apertureKind3D(item.catalogId) === 'porta'">
            <TresMesh v-for="(leaf, i) in doorLeaves(item)" :key="`doorleaf-${item.uid}-${i}`" :position="leaf.position" cast-shadow receive-shadow>
              <TresBoxGeometry :args="leaf.size" />
              <TresMeshStandardMaterial color="#d6b98c" :roughness="0.72" :side="THREE.DoubleSide" />
            </TresMesh>
            <TresMesh v-for="(leaf, i) in doorLeaves(item)" :key="`doorhdl-${item.uid}-${i}`" :position="leaf.handlePosition">
              <TresBoxGeometry :args="leaf.handleSize" />
              <TresMeshStandardMaterial color="#b8bbb8" :roughness="0.2" :metalness="0.85" :side="THREE.DoubleSide" />
            </TresMesh>
          </template>

          <template v-else>
            <TresMesh :position="glassPosition(item)">
              <TresBoxGeometry :args="aperturePanelSize(item, item.h, 0.018)" />
              <TresMeshStandardMaterial color="#bfe3f5" :roughness="0.05" :transparent="true" :opacity="0.44" :side="THREE.DoubleSide" />
            </TresMesh>
            <TresMesh v-for="(part, i) in windowFrameParts(item)" :key="`frame-${item.uid}-${i}`" :position="part.position" cast-shadow receive-shadow>
              <TresBoxGeometry :args="part.size" />
              <TresMeshStandardMaterial color="#f8fafc" :roughness="0.58" :side="THREE.DoubleSide" />
            </TresMesh>
          </template>
        </template>

        <!-- Furniture (apertures excluded — represented by wall gaps) -->
        <FurnitureModel3D
          v-for="item in visibleFurniture"
          :key="item.uid"
          :item="item"
          :selected="store.selectedUid === item.uid"
        />
      </TresGroup>
    </TresCanvas>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import * as THREE from 'three'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { usePlannerStore } from '../stores/plannerStore'
import { ROOMS, WALLS, BUILDING_WIDTH, BUILDING_DEPTH, CEILING_HEIGHT, WALL_THICKNESS } from '../data/rooms'
import { APERTURE_IDS } from '../data/furnitureCatalog'
import WalkControls from './WalkControls.vue'
import FurnitureModel3D from './FurnitureModel3D.vue'
import type { PlacedFurniture, Room } from '../types'

const store = usePlannerStore()
const BW = BUILDING_WIDTH
const BD = BUILDING_DEPTH
const H  = CEILING_HEIGHT
const T  = WALL_THICKNESS

// ─── Walk mode ───────────────────────────────────────────────────────────────

const containerRef = ref<HTMLElement | null>(null)
const walkMode = ref(false)
// Bump camKey to remount the camera when returning to orbit → reset to aerial view
const camKey = ref(0)
const northDeg = ref(90)
const timeOfDay = ref(12)

function enterWalk() { walkMode.value = true }
function exitWalk()  { walkMode.value = false; camKey.value++ }

// ─── Sun controls ───────────────────────────────────────────────────────────

const formattedHour = computed(() => {
  const wrapped = timeOfDay.value % 24
  const h = Math.floor(wrapped)
  const m = Math.round((wrapped - h) * 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
})

const sunPath = computed(() => {
  const t = timeOfDay.value % 24  // normalise 24 → 0
  const isDay = t >= 6 && t <= 20

  let altitude: number
  let compassAzimuth: number

  if (isDay) {
    const dayProgress = (t - 6) / 14  // 0→1
    const morningToNoon = Math.min(1, dayProgress / 0.5)
    const noonToEvening = Math.max(0, (dayProgress - 0.5) / 0.5)
    altitude = Math.sin(dayProgress * Math.PI) * 0.95
    compassAzimuth = dayProgress <= 0.5
      ? 115 + morningToNoon * 65
      : 180 + noonToEvening * 65
  } else {
    // Night arc: from 20:00 → midnight (1:00) → 6:00, deepest at ~1:00 AM
    // Remap t so that nightProgress goes 0→1→0 across the 10h night
    const nightT = t >= 20 ? t - 20 : t + 4  // 0 at 20:00, 5 at 1:00, 10 at 6:00
    altitude = -Math.sin((nightT / 10) * Math.PI) * 0.70
    compassAzimuth = 295  // sun on north/opposite side at night
  }

  const azimuth = (compassAzimuth + northDeg.value) * Math.PI / 180
  const radius = 18
  const x = BW / 2 + Math.sin(azimuth) * radius
  const z = BD / 2 - Math.cos(azimuth) * radius
  const y = 2.5 + altitude * 14
  return { x, y, z, altitude }
})

const sunPosition = computed((): V3 => [sunPath.value.x, sunPath.value.y, sunPath.value.z])
const sunMarkerPosition = computed((): V3 => [sunPath.value.x, sunPath.value.y + 0.35, sunPath.value.z])
const sunIntensity     = computed(() => Math.max(0,    0.55 + sunPath.value.altitude * 1.25))
const ambientIntensity = computed(() => Math.max(0.03, 0.28 + sunPath.value.altitude * 0.48))
const hemiIntensity    = computed(() => Math.max(0.02, 0.25 + sunPath.value.altitude * 0.40))
const skyColor = computed(() => {
  const alt = sunPath.value.altitude
  if (alt < -0.15) return '#0f172a'  // notte profonda
  if (alt <  0)    return '#1e293b'  // crepuscolo/alba
  if (alt <  0.25) return '#cbd5e1'  // luce radente
  return '#e2e8f0'
})

// ─── Scene data ──────────────────────────────────────────────────────────────

const mainRooms = computed(() => ROOMS.filter(r => !r.isBalcony))
const balconies = computed(() => ROOMS.filter(r =>  r.isBalcony))

const visibleFurniture = computed(() =>
  store.placedFurniture.filter(f => !APERTURE_IDS.has(f.catalogId))
)

const apertureFurniture = computed(() =>
  store.placedFurniture.filter(f => APERTURE_IDS.has(f.catalogId))
)

type FloorKind = 'gres' | 'parquet' | 'bath'

function makeTexture(draw: (ctx: CanvasRenderingContext2D, size: number) => void, repeat: [number, number]): THREE.CanvasTexture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D non disponibile')
  draw(ctx, size)

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(repeat[0], repeat[1])
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

function drawWoodGrain(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, alpha = 0.16) {
  ctx.strokeStyle = `rgba(124, 93, 55, ${alpha})`
  ctx.lineWidth = 1
  for (let i = 0; i < 4; i++) {
    const yy = y + h * (0.2 + i * 0.18)
    ctx.beginPath()
    ctx.moveTo(x + 10, yy)
    ctx.bezierCurveTo(x + w * 0.32, yy - 6, x + w * 0.68, yy + 8, x + w - 10, yy - 2)
    ctx.stroke()
  }
}

const floorTextures: Record<FloorKind, THREE.CanvasTexture> = {
  gres: makeTexture((ctx, size) => {
    ctx.fillStyle = '#d9c8ad'
    ctx.fillRect(0, 0, size, size)
    const tileW = 256
    const tileH = 86
    const colors = ['#dac8aa', '#d2bf9e', '#e2d2b9', '#cdb997']
    for (let row = 0; row < Math.ceil(size / tileH) + 1; row++) {
      const offset = row % 2 === 0 ? 0 : -tileW / 2
      for (let col = 0; col < Math.ceil(size / tileW) + 2; col++) {
        const x = offset + col * tileW
        const y = row * tileH
        ctx.fillStyle = colors[(row + col) % colors.length]
        ctx.fillRect(x, y, tileW, tileH)
        drawWoodGrain(ctx, x, y, tileW, tileH, 0.12)
        ctx.strokeStyle = 'rgba(245, 238, 226, 0.92)'
        ctx.lineWidth = 4
        ctx.strokeRect(x + 1, y + 1, tileW - 2, tileH - 2)
      }
    }
  }, [2.4, 3.8]),

  parquet: makeTexture((ctx, size) => {
    ctx.fillStyle = '#cfae7b'
    ctx.fillRect(0, 0, size, size)
    const block = 64
    const colors = ['#c9a16b', '#d6b986', '#bf9660', '#dec596']
    for (let y = 0; y < size; y += block) {
      for (let x = 0; x < size; x += block) {
        const vertical = ((x / block) + (y / block)) % 2 === 0
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = colors[(x / block + y / block + i) % colors.length]
          if (vertical) {
            ctx.fillRect(x + i * (block / 4), y, block / 4, block)
            drawWoodGrain(ctx, x + i * (block / 4), y, block / 4, block, 0.10)
          } else {
            ctx.fillRect(x, y + i * (block / 4), block, block / 4)
            drawWoodGrain(ctx, x, y + i * (block / 4), block, block / 4, 0.10)
          }
        }
        ctx.strokeStyle = 'rgba(105, 73, 36, 0.28)'
        ctx.lineWidth = 2
        ctx.strokeRect(x, y, block, block)
      }
    }
  }, [4.6, 4.6]),

  bath: makeTexture((ctx, size) => {
    ctx.fillStyle = '#dbe0e3'
    ctx.fillRect(0, 0, size, size)
    const tile = 128
    const colors = ['#dce2e5', '#cfd8dc', '#e5eaec', '#d5dde1']
    for (let y = 0; y < size; y += tile) {
      for (let x = 0; x < size; x += tile) {
        ctx.fillStyle = colors[(x / tile + y / tile) % colors.length]
        ctx.fillRect(x, y, tile, tile)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.lineWidth = 5
        ctx.strokeRect(x + 1, y + 1, tile - 2, tile - 2)
      }
    }
    ctx.strokeStyle = 'rgba(91, 111, 124, 0.18)'
    ctx.lineWidth = 2
    for (let i = -size; i < size * 2; i += 96) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i + size, size)
      ctx.stroke()
    }
  }, [2.8, 2.8]),
}

function floorKind(roomId: string): FloorKind {
  if (roomId === 'bagno') return 'bath'
  if (roomId === 'salotto' || roomId === 'cucina' || roomId === 'corridoio1') return 'gres'
  return 'parquet'
}

function floorTexture(roomId: string): THREE.CanvasTexture {
  return floorTextures[floorKind(roomId)]
}

function createRoomGeometry(room: Room): THREE.BufferGeometry {
  if (room.points && room.points.length >= 3) {
    const shape = new THREE.Shape(room.points.map(p => new THREE.Vector2(p.x, -p.z)))
    return new THREE.ShapeGeometry(shape)
  }
  const geom = new THREE.PlaneGeometry(room.w - 0.04, room.d - 0.04)
  geom.translate(room.x + room.w / 2, -(room.z + room.d / 2), 0)
  return geom
}

const allRoomGeometries = computed(() => {
  const map: Record<string, THREE.BufferGeometry> = {}
  for (const room of ROOMS) map[room.id] = createRoomGeometry(room)
  return map
})

onUnmounted(() => {
  Object.values(allRoomGeometries.value).forEach(g => g.dispose())
  Object.values(floorTextures).forEach(t => t.dispose())
})

// ─── Wall segments ───────────────────────────────────────────────────────────

type V3 = [number, number, number]
interface WallSeg { id: string; position: V3; size: V3; color: string }
interface FramePart { position: V3; size: V3 }
interface DoorLeaf { position: V3; size: V3; handlePosition: V3; handleSize: V3 }

function sillHeight(catalogId: string, openingH: number): number {
  if (catalogId.startsWith('finestra_')) return Math.min(0.90, H - openingH - 0.10)
  return 0
}

function apertureKind3D(id: string): 'porta' | 'finestra' | 'portafinestra' {
  if (id.startsWith('portafinestra_')) return 'portafinestra'
  if (id.startsWith('porta_')) return 'porta'
  return 'finestra'
}

function aperturePanelCount(id: string): number {
  return id.includes('tripla') ? 3 : id.includes('doppia') ? 2 : 1
}

function apertureLong(item: PlacedFurniture): number {
  return Math.max(item.w, item.d)
}

function apertureHorizontal(item: PlacedFurniture): boolean {
  return item.w >= item.d
}

function aperturePanelSize(item: PlacedFurniture, height: number, thickness: number): V3 {
  const width = apertureLong(item)
  return apertureHorizontal(item)
    ? [width, height, thickness]
    : [thickness, height, width]
}

function apertureCenterY(item: PlacedFurniture): number {
  return sillHeight(item.catalogId, item.h) + item.h / 2
}

function isApertureFlipped(item: PlacedFurniture): boolean {
  return item.rotation !== 0
}

function doorLeaves(item: PlacedFurniture): DoorLeaf[] {
  const width = apertureLong(item)
  const flip = isApertureFlipped(item)
  const isDouble = item.catalogId === 'porta_doppia'
  const leafWidth = isDouble ? width / 2 : width
  const handleSize: V3 = apertureHorizontal(item) ? [0.018, 0.08, 0.035] : [0.035, 0.08, 0.018]

  if (apertureHorizontal(item)) {
    const dirZ = flip ? -1 : 1
    const hinges = isDouble ? [item.x - width / 2, item.x + width / 2] : [item.x - width / 2]
    return hinges.map((hingeX) => ({
      position: [hingeX, item.h / 2, item.z + dirZ * leafWidth / 2],
      size: [0.035, item.h, leafWidth],
      handlePosition: [hingeX, item.h * 0.52, item.z + dirZ * leafWidth * 0.78],
      handleSize,
    }))
  }

  const dirX = flip ? 1 : -1
  const hinges = isDouble ? [item.z + width / 2, item.z - width / 2] : [item.z + width / 2]
  return hinges.map((hingeZ) => ({
    position: [item.x + dirX * leafWidth / 2, item.h / 2, hingeZ],
    size: [leafWidth, item.h, 0.035],
    handlePosition: [item.x + dirX * leafWidth * 0.78, item.h * 0.52, hingeZ],
    handleSize,
  }))
}

function glassPosition(item: PlacedFurniture): V3 {
  return [item.x, apertureCenterY(item), item.z]
}

function windowFrameParts(item: PlacedFurniture): FramePart[] {
  const horizontal = apertureHorizontal(item)
  const width = apertureLong(item)
  const height = item.h
  const y = apertureCenterY(item)
  const bar = 0.055
  const thick = 0.045
  const parts: FramePart[] = []

  const pushHorizontal = (offsetY: number) => {
    parts.push({
      position: horizontal ? [item.x, y + offsetY, item.z] : [item.x, y + offsetY, item.z],
      size: aperturePanelSize(item, bar, thick),
    })
  }
  const pushVertical = (offset: number, sizeAlongHeight = height) => {
    parts.push({
      position: horizontal
        ? [item.x + offset, y, item.z]
        : [item.x, y, item.z + offset],
      size: horizontal
        ? [bar, sizeAlongHeight, thick]
        : [thick, sizeAlongHeight, bar],
    })
  }

  pushHorizontal(-height / 2 + bar / 2)
  pushHorizontal(height / 2 - bar / 2)
  pushVertical(-width / 2 + bar / 2)
  pushVertical(width / 2 - bar / 2)

  const panels = aperturePanelCount(item.catalogId)
  if (panels === 2) pushVertical(0, height - bar * 1.4)
  if (panels >= 3) {
    pushVertical(-width / 6, height - bar * 1.4)
    pushVertical(width / 6, height - bar * 1.4)
  }

  if (apertureKind3D(item.catalogId) === 'finestra') {
    pushHorizontal(0)
  }

  return parts
}

const wallSegments = computed((): WallSeg[] => {
  const result: WallSeg[] = []

  for (const wall of WALLS) {
    const isVert  = Math.abs(wall.x1 - wall.x2) < 0.01
    const cx      = (wall.x1 + wall.x2) / 2
    const cz      = (wall.z1 + wall.z2) / 2
    const color   = '#ffffff'

    const apertures = store.placedFurniture.filter(
      f => APERTURE_IDS.has(f.catalogId) && f.wallId === wall.id
    )

    if (apertures.length === 0) {
      const size: V3 = isVert
        ? [T, H, Math.abs(wall.z2 - wall.z1) + T]
        : [Math.abs(wall.x2 - wall.x1) + T, H, T]
      result.push({ id: wall.id, position: [cx, H / 2, cz], size, color })
      continue
    }

    const sorted    = [...apertures].sort((a, b) => isVert ? a.z - b.z : a.x - b.x)
    const wallStart = isVert ? Math.min(wall.z1, wall.z2) : Math.min(wall.x1, wall.x2)
    const wallEnd   = isVert ? Math.max(wall.z1, wall.z2) : Math.max(wall.x1, wall.x2)
    let cursor = wallStart
    let si = 0

    const pushSeg = (from: number, to: number, segH: number, yCenter: number) => {
      const len = to - from
      if (len < 0.005) return
      const mid = (from + to) / 2
      const id  = `${wall.id}_s${si++}`
      if (isVert) result.push({ id, position: [cx, yCenter, mid],  size: [T, segH, len], color })
      else        result.push({ id, position: [mid, yCenter, cz],  size: [len, segH, T], color })
    }

    for (const ap of sorted) {
      const openingW   = Math.max(ap.w, ap.d)
      const apStart    = (isVert ? ap.z : ap.x) - openingW / 2
      const apEnd      = (isVert ? ap.z : ap.x) + openingW / 2
      const sill       = sillHeight(ap.catalogId, ap.h)
      const openingTop = sill + ap.h

      pushSeg(cursor, apStart, H, H / 2)
      if (sill > 0.02)             pushSeg(apStart, apEnd, sill,        sill / 2)
      if (openingTop < H - 0.02)   pushSeg(apStart, apEnd, H - openingTop, openingTop + (H - openingTop) / 2)
      cursor = apEnd
    }

    pushSeg(cursor, wallEnd, H, H / 2)
  }

  return result
})
</script>

<style scoped>
.floor-plan-3d {
  width: 100%;
  height: 100%;
  position: relative;
}

/* ── Pulsante "Entra" (orbit mode) ── */
.walk-enter-btn {
  position: absolute;
  bottom: 16px;
  right: 16px;
  z-index: 10;
  padding: 8px 14px;
  background: #1e293b;
  color: #f1f5f9;
  border: 1px solid #334155;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.walk-enter-btn:hover { background: #334155; }

.sun-panel {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  width: 230px;
  padding: 10px;
  display: grid;
  gap: 9px;
  background: rgba(15, 23, 42, 0.86);
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 8px;
  color: #e2e8f0;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.24);
}

.sun-title {
  font-size: 12px;
  font-weight: 700;
}

.sun-panel label {
  display: grid;
  gap: 4px;
  font-size: 11px;
  color: #94a3b8;
}

.sun-panel select,
.sun-panel input {
  width: 100%;
}

.sun-panel select {
  height: 28px;
  padding: 0 8px;
  border: 1px solid #334155;
  border-radius: 6px;
  background: #1e293b;
  color: #f8fafc;
}

.sun-panel input { accent-color: #facc15; }

/* ── Overlay in walk mode ── */
.walk-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;   /* il canvas rimane cliccabile */
  z-index: 10;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 14px 16px;
}

.walk-hint {
  background: rgba(15, 23, 42, 0.75);
  color: #e2e8f0;
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 6px;
  pointer-events: none;
}
.walk-hint kbd {
  display: inline-block;
  background: #334155;
  color: #f1f5f9;
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 11px;
  font-family: monospace;
  margin: 0 1px;
}

.walk-exit-btn {
  pointer-events: all;
  padding: 7px 14px;
  background: #1e293b;
  color: #f1f5f9;
  border: 1px solid #334155;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.walk-exit-btn:hover { background: #334155; }
</style>
