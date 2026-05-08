<template>
  <div class="app">
    <!-- Top bar -->
    <header class="topbar">
      <span class="app-title">🏠 Home Planner</span>
      <div class="view-toggle">
        <button
          v-for="v in views"
          :key="v.value"
          :class="['toggle-btn', { active: store.view === v.value }]"
          @click="store.view = v.value"
        >{{ v.label }}</button>
      </div>
      <span class="hint">Clicca per selezionare • Trascina per spostare • ↔ inverte apertura</span>

      <div class="save-btns">
        <button class="save-btn" title="Salva come file JSON" @click="store.exportPlan()">💾 Salva</button>
        <label class="save-btn" title="Carica un file JSON">
          📂 Carica
          <input type="file" accept=".json,application/json,text/plain" hidden @change="onImport">
        </label>
        <button class="save-btn danger" title="Rimuovi tutti i mobili" @click="onClear">🗑</button>
      </div>
    </header>

    <div class="main">
      <!-- Sidebar -->
      <FurnitureSidebar />

      <!-- Viewport area -->
      <div class="viewport">
        <!-- 2D panel -->
        <div
          v-if="store.view === '2d' || store.view === 'both'"
          :class="['panel', store.view === 'both' ? 'half' : 'full']"
        >
          <div class="panel-label">Vista 2D</div>
          <FloorPlan2D />
        </div>

        <!-- 3D panel -->
        <div
          v-if="store.view === '3d' || store.view === 'both'"
          :class="['panel', store.view === 'both' ? 'half' : 'full']"
        >
          <div class="panel-label">Vista 3D</div>
          <FloorPlan3D />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePlannerStore } from './stores/plannerStore'
import FurnitureSidebar from './components/FurnitureSidebar.vue'
import FloorPlan2D from './components/FloorPlan2D.vue'
import FloorPlan3D from './components/FloorPlan3D.vue'

const store = usePlannerStore()

const views = [
  { value: 'both' as const, label: '2D + 3D' },
  { value: '2d' as const,   label: 'Solo 2D' },
  { value: '3d' as const,   label: 'Solo 3D' },
]

function onImport(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) store.importPlan(file)
  ;(e.target as HTMLInputElement).value = ''
}

function onClear() {
  if (confirm('Rimuovere tutti i mobili?')) store.clearPlan()
}
</script>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #0f172a; }
</style>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  font-family: sans-serif;
}

.topbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 16px;
  height: 48px;
  background: #0f172a;
  border-bottom: 1px solid #1e293b;
  flex-shrink: 0;
}

.app-title {
  font-size: 16px;
  font-weight: 700;
  color: #f1f5f9;
  margin-right: 8px;
}

.view-toggle { display: flex; gap: 4px; }

.toggle-btn {
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid #334155;
  background: transparent;
  color: #94a3b8;
  font-size: 12px;
  cursor: pointer;
  font-weight: 600;
}
.toggle-btn.active { background: #1d4ed8; color: white; border-color: #1d4ed8; }
.toggle-btn:hover:not(.active) { background: #1e293b; }

.hint {
  font-size: 11px;
  color: #475569;
  margin-left: auto;
}

.save-btns { display: flex; gap: 4px; }

.save-btn {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid #334155;
  background: #1e293b;
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}
.save-btn:hover { background: #334155; }
.save-btn.danger { border-color: #7f1d1d; color: #fca5a5; }
.save-btn.danger:hover { background: #7f1d1d; }

.main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.viewport {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-left: 1px solid #334155;
}
.panel.half { flex: 1; }
.panel.full { flex: 1; }

.panel-label {
  padding: 4px 12px;
  background: #1e293b;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
  flex-shrink: 0;
  border-bottom: 1px solid #334155;
}

.panel > :last-child {
  flex: 1;
  min-height: 0;
}
</style>

