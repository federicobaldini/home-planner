<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { useTresContext, useLoop } from '@tresjs/core'
import * as THREE from 'three'

const props = defineProps<{
  active:     boolean
  lockTarget: HTMLElement | null
}>()
const emit = defineEmits<{ exit: [] }>()

const { camera } = useTresContext()
const { onBeforeRender } = useLoop()

const EYE_H = 1.6   // altezza occhi (m)
const SPEED = 4     // velocità spostamento (m/s)
const SENS  = 0.002 // sensibilità mouse

let yaw        = 0     // rotazione orizzontale (Y)
let pitch      = 0     // rotazione verticale (X)
let justEntered = false // flag: posiziona la camera al primo frame

const keys = { w: false, a: false, s: false, d: false }
const _dir   = new THREE.Vector3()
const _euler = new THREE.Euler(0, 0, 0, 'YXZ')

// ─── Input handlers ──────────────────────────────────────────────────────────

function onMouseMove(e: MouseEvent) {
  if (!props.active || !document.pointerLockElement) return
  yaw   -= e.movementX * SENS
  pitch -= e.movementY * SENS
  pitch  = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitch))
}

function onKeyDown(e: KeyboardEvent) {
  if (!props.active) return
  if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp')    keys.w = true
  if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown')  keys.s = true
  if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft')  keys.a = true
  if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.d = true
}

function onKeyUp(e: KeyboardEvent) {
  if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp')    keys.w = false
  if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown')  keys.s = false
  if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft')  keys.a = false
  if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.d = false
}

function onPointerLockChange() {
  // Se il pointer lock viene rilasciato (es. ESC) segnalalo al parent
  if (props.active && !document.pointerLockElement) emit('exit')
}

// ─── Lifecycle ───────────────────────────────────────────────────────────────

watch(() => props.active, active => {
  if (active) {
    yaw = 0; pitch = 0; justEntered = true
    props.lockTarget?.requestPointerLock()
  } else {
    if (document.pointerLockElement) document.exitPointerLock()
    keys.w = keys.a = keys.s = keys.d = false
  }
})

onMounted(() => {
  document.addEventListener('mousemove',        onMouseMove)
  document.addEventListener('keydown',          onKeyDown)
  document.addEventListener('keyup',            onKeyUp)
  document.addEventListener('pointerlockchange', onPointerLockChange)
  if (props.active) { yaw = 0; pitch = 0; justEntered = true; props.lockTarget?.requestPointerLock() }
})

onUnmounted(() => {
  document.removeEventListener('mousemove',        onMouseMove)
  document.removeEventListener('keydown',          onKeyDown)
  document.removeEventListener('keyup',            onKeyUp)
  document.removeEventListener('pointerlockchange', onPointerLockChange)
})

// ─── Per-frame update ────────────────────────────────────────────────────────

onBeforeRender(({ delta }) => {
  if (!props.active) return
  const cam = camera.activeCamera.value as THREE.PerspectiveCamera | undefined
  if (!cam) return

  // Posiziona la camera al primo frame dopo l'ingresso (up reset incluso)
  if (justEntered) {
    cam.up.set(0, 1, 0)
    cam.position.set(4.5, EYE_H, 6.5)
    cam.rotation.order = 'YXZ'
    cam.rotation.set(0, 0, 0)
    justEntered = false
  }

  // Applica mouse-look
  cam.rotation.order = 'YXZ'
  cam.rotation.y = yaw
  cam.rotation.x = pitch

  // Applica WASD
  _dir.set(
    (keys.d ? 1 : 0) - (keys.a ? 1 : 0),
    0,
    (keys.s ? 1 : 0) - (keys.w ? 1 : 0),
  )
  if (_dir.lengthSq() > 0) {
    _euler.set(0, yaw, 0)
    _dir.normalize().applyEuler(_euler).multiplyScalar(SPEED * delta)
    cam.position.add(_dir)
    cam.position.y = EYE_H  // locked a terra, niente volo
  }
})
</script>

<template><!-- solo logica, nessun oggetto 3D --></template>
