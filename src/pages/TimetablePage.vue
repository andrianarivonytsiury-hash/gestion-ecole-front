<template>
  <div class="space-y-6">
    <div class="section-head">
      <div>
        <p class="eyebrow">Emplois du temps & Calendrier</p>
        <h1 class="text-2xl font-semibold text-ink">Vue fusionnée cours + jours off</h1>
      </div>
      <button class="btn-primary" type="button" @click="refresh">Actualiser</button>
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <div class="panel lg:col-span-2">
        <div class="section-head">
          <h2>Emplois du temps</h2>
          <span class="hint">6ème A / Terminale S</span>
        </div>
        <div class="divide-y divide-slate-100">
          <div v-for="slot in store.courses" :key="slot.id" class="flex items-start gap-3 py-3">
            <div class="slot-chip bg-secondary/10 text-secondary">{{ slot.start }}</div>
            <div class="flex-1">
              <p class="font-semibold text-ink">{{ slot.label }}</p>
              <p class="text-sm text-muted">{{ slot.room }} · {{ slot.class }}</p>
            </div>
            <span class="pill bg-primary/10 text-primary">{{ slot.status }}</span>
          </div>
        </div>
      </div>
      <div class="panel">
        <div class="section-head">
          <h2>Jours off</h2>
          <span class="hint">Vacances / pauses</span>
        </div>
        <div class="space-y-3">
          <div v-for="holiday in store.holidays" :key="holiday.id" class="p-3 rounded-xl bg-slate-50">
            <p class="font-semibold text-ink">{{ holiday.label }}</p>
            <p class="text-sm text-muted">{{ holiday.startDate }} · {{ holiday.endDate }}</p>
            <span class="pill bg-ink/10 text-ink">{{ holiday.type }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useDemoStore } from '../stores/demo';

const store = useDemoStore();
const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const refresh = () => {
  store.fetchCourses(apiBase);
  store.fetchHolidays(apiBase);
};

onMounted(refresh);
</script>
