<template>
  <div class="floor-plan-2d" ref="containerRef">
    <svg
      :width="svgW"
      :height="svgH"
      @mousemove="onSvgMouseMove"
      @click.self="store.selectFurniture(null)"
    >
      <!-- Rooms (no stroke — walls drawn explicitly below) -->
      <g v-for="room in store.rooms" :key="room.id">
        <polygon
          v-if="room.points"
          :points="toSvgPoints(room)"
          :fill="room.color"
          :stroke="room.isBalcony ? '#6ee7b7' : 'none'"
          :stroke-width="room.isBalcony ? 1.5 : 0"
          :stroke-dasharray="room.isBalcony ? '4,3' : 'none'"
          opacity="0.85"
        />
        <rect
          v-else
          :x="toSvgX(room.x)"
          :y="toSvgY(room.z)"
          :width="room.w * scale"
          :height="room.d * scale"
          :fill="room.color"
          :stroke="room.isBalcony ? '#6ee7b7' : 'none'"
          :stroke-width="room.isBalcony ? 1.5 : 0"
          :stroke-dasharray="room.isBalcony ? '4,3' : 'none'"
          opacity="0.85"
        />
        <text
          :x="toSvgX(room.labelX ?? (room.x + room.w / 2))"
          :y="toSvgY(room.labelZ ?? (room.z + room.d / 2))"
          text-anchor="middle"
          dominant-baseline="middle"
          :font-size="room.isBalcony ? 9 : 11"
          fill="#1f2937"
          font-family="sans-serif"
          font-weight="600"
          pointer-events="none"
        >{{ room.label }}</text>
      </g>

      <!-- ── Wall rectangles ──────────────────────────────────────────────── -->
      <rect
        v-for="wr in wallRects2D"
        :key="wr.key"
        :x="wr.x" :y="wr.y" :width="wr.w" :height="wr.h"
        :fill="wr.outer ? '#c8c8c8' : '#d4d4d4'"
        stroke="#9ca3af"
        stroke-width="0.5"
        pointer-events="none"
      />

      <!-- Placed items (furniture + aperture) -->
      <g
        v-for="item in store.placedFurniture"
        :key="item.uid"
        :transform="`translate(${toSvgX(item.x)}, ${toSvgY(item.z)})`"
        style="cursor: grab"
        @mousedown.stop="startDrag($event, item.uid)"
        @click.stop="store.selectFurniture(item.uid)"
      >
        <!-- ── Aperture: simboli architettonici ── -->
        <template v-if="isAperture(item)">

          <!-- PORTA: rettangolo bianco + anta aperta + arco di apertura -->
          <template v-if="apertureKind(item.catalogId) === 'porta'">
            <rect
              :x="horiz(item) ? -op(item)/2 : -dp(item)/2"
              :y="horiz(item) ? -dp(item)/2 : -op(item)/2"
              :width="horiz(item) ? op(item) : dp(item)"
              :height="horiz(item) ? dp(item) : op(item)"
              fill="white" stroke="#374151" stroke-width="1.5"
            />
            <!-- anta nella posizione aperta (perpendicolare alla parete) -->
            <line
              v-for="(leaf, i) in doorLeafLines(item)"
              :key="`leaf${i}`"
              :x1="leaf.x1"
              :y1="leaf.y1"
              :x2="leaf.x2"
              :y2="leaf.y2"
              stroke="#374151" stroke-width="1.5"
            />
            <!-- arco di apertura 90° -->
            <path :d="doorArcPath(item)" fill="none" stroke="#374151" stroke-width="1"/>
          </template>

          <!-- FINESTRA: rettangolo bianco + 2 linee del vetro -->
          <template v-else-if="apertureKind(item.catalogId) === 'finestra'">
            <rect
              :x="-item.w*scale/2" :y="-item.d*scale/2"
              :width="item.w*scale" :height="item.d*scale"
              fill="white" stroke="#374151" stroke-width="1.5"
            />
            <!-- vetro orizzontale -->
            <template v-if="horiz(item)">
              <line :x1="-item.w*scale/2" :y1="-item.d*scale/4" :x2="item.w*scale/2" :y2="-item.d*scale/4" stroke="#93c5fd" stroke-width="2"/>
              <line :x1="-item.w*scale/2" :y1=" item.d*scale/4" :x2="item.w*scale/2" :y2=" item.d*scale/4" stroke="#93c5fd" stroke-width="2"/>
              <!-- montante centrale per finestra doppia -->
              <line v-if="panelCount(item.catalogId) >= 2" x1="0" :y1="-item.d*scale/2" x2="0" :y2="item.d*scale/2" stroke="#374151" stroke-width="1"/>
            </template>
            <!-- vetro verticale -->
            <template v-else>
              <line :x1="-item.w*scale/4" :y1="-item.d*scale/2" :x2="-item.w*scale/4" :y2="item.d*scale/2" stroke="#93c5fd" stroke-width="2"/>
              <line :x1=" item.w*scale/4" :y1="-item.d*scale/2" :x2=" item.w*scale/4" :y2="item.d*scale/2" stroke="#93c5fd" stroke-width="2"/>
              <line v-if="panelCount(item.catalogId) >= 2" :x1="-item.w*scale/2" y1="0" :x2="item.w*scale/2" y2="0" stroke="#374151" stroke-width="1"/>
            </template>
          </template>

          <!-- PORTAFINESTRA: riempimento azzurro + pannelli vetro -->
          <template v-else>
            <rect
              :x="-item.w*scale/2" :y="-item.d*scale/2"
              :width="item.w*scale" :height="item.d*scale"
              fill="#e0f2fe" stroke="#374151" stroke-width="1.5"
            />
            <rect
              :x="-item.w*scale/2+1" :y="-item.d*scale/2+1"
              :width="item.w*scale-2" :height="item.d*scale-2"
              fill="none" stroke="#93c5fd" stroke-width="1"
            />
            <!-- divisori pannelli – orizzontale -->
            <template v-if="horiz(item)">
              <line v-if="panelCount(item.catalogId) >= 2" x1="0" :y1="-item.d*scale/2" x2="0" :y2="item.d*scale/2" stroke="#374151" stroke-width="1.2"/>
              <line v-if="panelCount(item.catalogId) >= 3" :x1="-item.w*scale/3" :y1="-item.d*scale/2" :x2="-item.w*scale/3" :y2="item.d*scale/2" stroke="#374151" stroke-width="1.2"/>
              <line v-if="panelCount(item.catalogId) >= 3" :x1=" item.w*scale/3" :y1="-item.d*scale/2" :x2=" item.w*scale/3" :y2="item.d*scale/2" stroke="#374151" stroke-width="1.2"/>
            </template>
            <!-- divisori pannelli – verticale -->
            <template v-else>
              <line v-if="panelCount(item.catalogId) >= 2" :x1="-item.w*scale/2" y1="0" :x2="item.w*scale/2" y2="0" stroke="#374151" stroke-width="1.2"/>
              <line v-if="panelCount(item.catalogId) >= 3" :x1="-item.w*scale/2" :y1="-item.d*scale/3" :x2="item.w*scale/2" :y2="-item.d*scale/3" stroke="#374151" stroke-width="1.2"/>
              <line v-if="panelCount(item.catalogId) >= 3" :x1="-item.w*scale/2" :y1=" item.d*scale/3" :x2="item.w*scale/2" :y2=" item.d*scale/3" stroke="#374151" stroke-width="1.2"/>
            </template>
          </template>

          <!-- Handle selezione apertura -->
          <g v-if="store.selectedUid === item.uid">
            <circle :cx="item.w*scale/2+10" :cy="-item.d*scale/2-10" r="8" fill="#1d4ed8" style="cursor:pointer" @click.stop="store.rotateFurniture(item.uid)"/>
            <text  :x="item.w*scale/2+10"  :y="-item.d*scale/2-10" text-anchor="middle" dominant-baseline="middle" font-size="10" fill="white" pointer-events="none">↔</text>
            <circle :cx="-item.w*scale/2-10" :cy="-item.d*scale/2-10" r="8" fill="#dc2626" style="cursor:pointer" @click.stop="store.removeFurniture(item.uid)"/>
            <text  :x="-item.w*scale/2-10"  :y="-item.d*scale/2-10" text-anchor="middle" dominant-baseline="middle" font-size="11" fill="white" pointer-events="none">×</text>
          </g>
        </template>

        <!-- ── Mobili normali ── -->
        <template v-else>
          <rect
            :x="-item.w * scale / 2"
            :y="-item.d * scale / 2"
            :width="item.w * scale"
            :height="item.d * scale"
            :fill="displayColor(item)"
            :stroke="store.selectedUid === item.uid ? '#1d4ed8' : '#64748b'"
            :stroke-width="store.selectedUid === item.uid ? 2.5 : 1.5"
            rx="2"
            opacity="0.9"
          />
          <text
            x="0" y="0"
            text-anchor="middle"
            dominant-baseline="middle"
            :font-size="Math.max(8, Math.min(12, item.w * scale / 5))"
            fill="#1f2937"
            font-family="sans-serif"
            pointer-events="none"
          >{{ item.label }}</text>

          <!-- Handle selezione mobile -->
          <g v-if="store.selectedUid === item.uid">
            <circle :cx="item.w*scale/2+10" :cy="-item.d*scale/2-10" r="8" fill="#1d4ed8" style="cursor:pointer" @click.stop="store.rotateFurniture(item.uid)"/>
            <text  :x="item.w*scale/2+10"  :y="-item.d*scale/2-10" text-anchor="middle" dominant-baseline="middle" font-size="10" fill="white" pointer-events="none">↻</text>
            <circle :cx="-item.w*scale/2-10" :cy="-item.d*scale/2-10" r="8" fill="#dc2626" style="cursor:pointer" @click.stop="store.removeFurniture(item.uid)"/>
            <text  :x="-item.w*scale/2-10"  :y="-item.d*scale/2-10" text-anchor="middle" dominant-baseline="middle" font-size="11" fill="white" pointer-events="none">×</text>
          </g>
        </template>
      </g>

      <!-- Scale bar -->
      <g :transform="`translate(${PADDING}, ${svgH - 22})`">
        <line x1="0" y1="0" :x2="scale" y2="0" stroke="#374151" stroke-width="2"/>
        <line x1="0" y1="-4" x2="0" y2="4" stroke="#374151" stroke-width="2"/>
        <line :x1="scale" y1="-4" :x2="scale" y2="4" stroke="#374151" stroke-width="2"/>
        <text x="0" :y="-9" font-size="9" fill="#374151" font-family="sans-serif">1m</text>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePlannerStore } from '../stores/plannerStore'
import { VIEW_LEFT, VIEW_TOP, VIEW_RIGHT, VIEW_BOTTOM, WALLS, WALL_THICKNESS } from '../data/rooms'
import { APERTURE_IDS } from '../data/furnitureCatalog'
import type { Room, PlacedFurniture } from '../types'

const store = usePlannerStore()

const PADDING = 40
const containerRef = ref<HTMLElement | null>(null)

const scale = computed(() => {
  const w = containerRef.value?.clientWidth ?? 600
  const h = containerRef.value?.clientHeight ?? 500
  const scaleX = (w - PADDING * 2) / (VIEW_RIGHT - VIEW_LEFT)
  const scaleY = (h - PADDING * 2) / (VIEW_BOTTOM - VIEW_TOP)
  return Math.min(scaleX, scaleY)
})

const svgW = computed(() => containerRef.value?.clientWidth ?? 600)
const svgH = computed(() => containerRef.value?.clientHeight ?? 500)

function toSvgX(meters: number) { return PADDING + (meters - VIEW_LEFT) * scale.value }
// Flip verticale: nord (z=0) → fondo dell'SVG, sud (z=13) → cima dell'SVG
function toSvgY(meters: number) { return PADDING + (VIEW_BOTTOM - meters) * scale.value }

function toSvgPoints(room: Room): string {
  return (room.points ?? []).map(p => `${toSvgX(p.x)},${toSvgY(p.z)}`).join(' ')
}

// ─── Wall rectangles ─────────────────────────────────────────────────────────

interface WallRect { key: string; x: number; y: number; w: number; h: number; outer: boolean }

const wallRects2D = computed((): WallRect[] => {
  const T = WALL_THICKNESS
  const s = scale.value
  return WALLS.map(wall => {
    const isVert = Math.abs(wall.x1 - wall.x2) < 0.01
    const isOuter =
      (wall.x1 <= 0.01 && wall.x2 <= 0.01) ||
      (wall.x1 >= 8.91 && wall.x2 >= 8.91) ||
      (wall.z1 <= 0.01 && wall.z2 <= 0.01) ||
      (wall.z1 >= 13.04 && wall.z2 >= 13.04)

    if (isVert) {
      const x0   = wall.x1
      const zMin = Math.min(wall.z1, wall.z2)
      const zMax = Math.max(wall.z1, wall.z2)
      return {
        key: wall.id,
        x: toSvgX(x0 - T / 2),
        y: toSvgY(zMax + T / 2),   // flipped Y: larger z → smaller SVG y (higher)
        w: T * s,
        h: (zMax - zMin + T) * s,
        outer: isOuter,
      }
    } else {
      const z0   = wall.z1
      const xMin = Math.min(wall.x1, wall.x2)
      const xMax = Math.max(wall.x1, wall.x2)
      return {
        key: wall.id,
        x: toSvgX(xMin - T / 2),
        y: toSvgY(z0 + T / 2),
        w: (xMax - xMin + T) * s,
        h: T * s,
        outer: isOuter,
      }
    }
  })
})

// ─── Helpers per aperture architettoniche ────────────────────────────────────

function isAperture(item: PlacedFurniture) { return APERTURE_IDS.has(item.catalogId) }

function apertureKind(id: string): 'porta' | 'finestra' | 'portafinestra' {
  if (id.startsWith('portafinestra_')) return 'portafinestra'
  if (id.startsWith('porta_'))         return 'porta'
  return 'finestra'
}

function panelCount(id: string): number {
  return id.includes('tripla') ? 3 : id.includes('doppia') ? 2 : 1
}

function displayColor(item: PlacedFurniture): string {
  if (item.catalogId.startsWith('porta_')) return '#d6b98c'
  if (item.catalogId.startsWith('finestra_') || item.catalogId.startsWith('portafinestra_')) return '#f8fafc'
  if (item.catalogId === 'sedia') return '#4ade80'
  if (item.catalogId === 'sedia_con_braccioli') return '#86efac'
  if (item.catalogId.startsWith('tavolo_')) return '#f8fafc'
  if (item.catalogId.startsWith('libreria')) return '#f8fafc'
  if (item.catalogId.startsWith('tv_stand')) return '#374151'
  if (item.catalogId.startsWith('scrivania_studio')) return '#f8fafc'
  return item.color
}

// Dimensione "apertura" (la più grande) in pixel SVG
function op(item: PlacedFurniture) { return Math.max(item.w, item.d) * scale.value }
// Dimensione "spessore parete" in pixel SVG
function dp(item: PlacedFurniture) { return Math.min(item.w, item.d) * scale.value }
// true se il lato lungo è orizzontale (w ≥ d)
function horiz(item: PlacedFurniture) { return item.w >= item.d }
// true se la porta/finestra va verso il lato opposto (flip del verso di apertura)
function isFlipped(item: PlacedFurniture) { return item.rotation !== 0 }

function doorLeafLines(item: PlacedFurniture) {
  const o = op(item)
  const flip = isFlipped(item)
  const dir = flip ? 1 : -1

  if (item.catalogId === 'porta_doppia') {
    const leaf = o / 2
    return horiz(item)
      ? [
          { x1: -o / 2, y1: 0, x2: -o / 2, y2: dir * leaf },
          { x1:  o / 2, y1: 0, x2:  o / 2, y2: dir * leaf },
        ]
      : [
          { x1: 0, y1: -o / 2, x2: -dir * leaf, y2: -o / 2 },
          { x1: 0, y1:  o / 2, x2: -dir * leaf, y2:  o / 2 },
        ]
  }

  return horiz(item)
    ? [{ x1: -o / 2, y1: 0, x2: -o / 2, y2: dir * o }]
    : [{ x1: 0, y1: -o / 2, x2: -dir * o, y2: -o / 2 }]
}

// Path SVG dell'arco di apertura della porta (90°), con supporto flip
function doorArcPath(item: PlacedFurniture): string {
  const o    = op(item)
  const flip = isFlipped(item)
  if (horiz(item)) {
    return flip
      ? `M ${o/2},0 A ${o},${o} 0 0 1 ${-o/2},${o}`
      : `M ${o/2},0 A ${o},${o} 0 0 0 ${-o/2},${-o}`
  }
  return flip
    ? `M 0,${o/2} A ${o},${o} 0 0 0 ${o},${-o/2}`
    : `M 0,${o/2} A ${o},${o} 0 0 1 ${-o},${-o/2}`
}

// ─── Drag state ──────────────────────────────────────────────────────────────

const dragging = ref<{ uid: string; offsetX: number; offsetY: number } | null>(null)

function startDrag(e: MouseEvent, uid: string) {
  store.selectFurniture(uid)
  const item = store.placedFurniture.find(f => f.uid === uid)!
  const svgEl = (e.currentTarget as SVGElement).closest('svg')!
  const rect = svgEl.getBoundingClientRect()
  dragging.value = {
    uid,
    offsetX: e.clientX - rect.left - toSvgX(item.x),
    offsetY: e.clientY - rect.top  - toSvgY(item.z),
  }
  // Window mouseup ensures the drag ends even if the cursor leaves the SVG
  window.addEventListener('mouseup', onWindowMouseUp, { once: true })
}

function onSvgMouseMove(e: MouseEvent) {
  if (!dragging.value) return
  const rect = (e.currentTarget as SVGElement).getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top
  const newX = (mouseX - dragging.value.offsetX - PADDING) / scale.value + VIEW_LEFT
  const newZ = VIEW_BOTTOM - (mouseY - dragging.value.offsetY - PADDING) / scale.value
  store.moveFurniture(dragging.value.uid, newX, newZ)
}

function onWindowMouseUp() {
  if (dragging.value) store.finalizeAperture(dragging.value.uid)
  dragging.value = null
}
</script>

<style scoped>
.floor-plan-2d {
  width: 100%;
  height: 100%;
  background: #f8fafc;
}

.floor-plan-2d svg {
  user-select: none;
}
</style>
