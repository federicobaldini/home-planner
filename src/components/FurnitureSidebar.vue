<template>
  <aside class="sidebar">
    <h2 class="sidebar-title">Mobili</h2>

    <div v-for="cat in CATEGORIES" :key="cat" class="category">
      <button class="cat-header" @click="toggleCat(cat)">
        <span>{{ cat }}</span>
        <span class="chevron">{{ openCats.has(cat) ? '▾' : '▸' }}</span>
      </button>
      <div v-if="openCats.has(cat)" class="cat-items">
        <button
          v-for="item in itemsByCategory(cat)"
          :key="item.id"
          class="furniture-btn"
          @click="store.addFurniture(item)"
          :title="`${item.w}m × ${item.d}m × h${item.h}m`"
        >
          <span class="icon">{{ item.icon }}</span>
          <span class="item-label">{{ item.label }}</span>
          <span class="dims">{{ item.w }}×{{ item.d }}m</span>
        </button>
      </div>
    </div>

    <!-- Selected furniture actions -->
    <div v-if="selectedItem" class="selection-panel">
      <h3>Selezionato</h3>
      <p class="sel-label">{{ selectedItem.label }}</p>
      <p class="sel-dims">{{ selectedItem.w.toFixed(1) }}m × {{ selectedItem.d.toFixed(1) }}m × h{{ selectedItem.h.toFixed(1) }}m</p>
      <div class="sel-actions">
        <button class="action-btn rotate" @click="store.rotateFurniture(selectedItem.uid)">↻ Ruota 90°</button>
        <button class="action-btn delete" @click="store.removeFurniture(selectedItem.uid)">🗑 Rimuovi</button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePlannerStore } from '../stores/plannerStore'
import { FURNITURE_CATALOG, CATEGORIES } from '../data/furnitureCatalog'

const store = usePlannerStore()
const openCats = ref<Set<string>>(new Set(CATEGORIES))

function toggleCat(cat: string) {
  if (openCats.value.has(cat)) openCats.value.delete(cat)
  else openCats.value.add(cat)
}

function itemsByCategory(cat: string) {
  return FURNITURE_CATALOG.filter(f => f.category === cat)
}

const selectedItem = computed(() =>
  store.selectedUid
    ? store.placedFurniture.find(f => f.uid === store.selectedUid) ?? null
    : null
)
</script>

<style scoped>
.sidebar {
  width: 220px;
  min-width: 200px;
  background: #1e293b;
  color: #f1f5f9;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 0 0 16px;
  gap: 0;
  font-family: sans-serif;
}

.sidebar-title {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #94a3b8;
  padding: 16px 14px 8px;
  border-bottom: 1px solid #334155;
}

.category { border-bottom: 1px solid #334155; }

.cat-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  background: transparent;
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border: none;
  cursor: pointer;
}
.cat-header:hover { background: #334155; }

.cat-items { display: flex; flex-direction: column; gap: 2px; padding: 4px 8px; }

.furniture-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 12px;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
}
.furniture-btn:hover { background: #1d4ed8; border-color: #3b82f6; }
.icon { font-size: 16px; flex-shrink: 0; }
.item-label { flex: 1; }
.dims { font-size: 10px; color: #64748b; flex-shrink: 0; }

.selection-panel {
  margin: 12px 8px 0;
  background: #0f172a;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  padding: 12px;
}
.selection-panel h3 {
  font-size: 11px;
  text-transform: uppercase;
  color: #60a5fa;
  margin: 0 0 6px;
}
.sel-label { font-size: 13px; font-weight: 600; margin: 0 0 2px; }
.sel-dims { font-size: 11px; color: #94a3b8; margin: 0 0 10px; }
.sel-actions { display: flex; gap: 6px; }
.action-btn {
  flex: 1;
  padding: 6px 4px;
  border-radius: 5px;
  border: none;
  font-size: 11px;
  cursor: pointer;
  font-weight: 600;
}
.rotate { background: #1d4ed8; color: white; }
.rotate:hover { background: #2563eb; }
.delete { background: #dc2626; color: white; }
.delete:hover { background: #ef4444; }
</style>
