<template>
  <div class="space-y-6">
    <div class="section-head">
      <div>
        <p class="eyebrow">Absences / Retards</p>
        <h1 class="text-2xl font-semibold text-ink">Prise de présence par cours</h1>
      </div>
      <button class="btn-primary">Enregistrer</button>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <div v-for="course in store.courses" :key="course.id" class="panel">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted">{{ course.class }}</p>
            <p class="text-lg font-semibold text-ink">{{ course.label }}</p>
          </div>
          <span class="pill bg-secondary/10 text-secondary">{{ course.start }}</span>
        </div>
        <div class="mt-4 space-y-2">
          <div v-for="student in studentsForCourse" :key="student" class="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
            <span class="text-ink font-medium">{{ student }}</span>
            <div class="flex gap-2">
              <button class="pill bg-primary/10 text-primary">Présent</button>
              <button class="pill bg-accent/10 text-accent">Retard</button>
              <button class="pill bg-red-100 text-red-600">Absent</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="section-head">
        <h2>Historique du jour</h2>
        <span class="hint">Notifications aux parents</span>
      </div>
      <div class="divide-y divide-slate-100">
        <div v-for="record in store.attendance" :key="record.id" class="flex items-center justify-between py-3">
          <div>
            <p class="font-semibold text-ink">{{ record.student }}</p>
            <p class="text-sm text-muted">Cours #{{ record.courseId }} · {{ record.motif || '—' }}</p>
          </div>
          <span class="pill" :class="badgeClass(record.status)">{{ record.status }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDemoStore } from '../stores/demo'; // Store Pinia avec données mock.

const store = useDemoStore(); // Instance du store.
const studentsForCourse = ['Lina Rakoto', 'Noah Randrian', 'Sarina Andry']; // Liste de démo pour l'affichage.

const badgeClass = (status: string) => {
  if (status === 'present') return 'bg-primary/10 text-primary'; // Style pour présent.
  if (status === 'absent') return 'bg-red-100 text-red-600'; // Style pour absent.
  return 'bg-accent/10 text-accent'; // Style pour retard/autres.
};
</script>
