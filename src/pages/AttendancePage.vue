<template>
  <div class="space-y-6">
    <div class="section-head">
      <div>
        <p class="eyebrow">Absences / Retards</p>
        <h1 class="text-2xl font-semibold text-ink">Prise de présence par cours</h1>
      </div>
    </div>

    <form class="panel grid gap-4 md:grid-cols-4 items-end" @submit.prevent="submitAttendance">
      <div class="md:col-span-2">
        <label class="label">Cours</label>
        <select v-model.number="courseId" class="input">
          <option :value="null" disabled>Choisir un cours</option>
          <option v-for="course in store.courses" :key="course.id" :value="course.courseId || course.id">
            {{ course.label }} - {{ course.class }} ({{ course.start }})
          </option>
        </select>
      </div>
      <div>
        <label class="label">ID étudiant</label>
        <input v-model.number="studentId" type="number" min="1" class="input" placeholder="ex: 1" />
      </div>
      <div>
        <label class="label">Statut</label>
        <select v-model="status" class="input">
          <option value="present">Présent</option>
          <option value="retard">Retard</option>
          <option value="absent">Absent</option>
          <option value="excused">Justifié</option>
        </select>
      </div>
      <div class="md:col-span-3">
        <label class="label">Motif (optionnel)</label>
        <input v-model="motif" type="text" class="input" placeholder="Motif / commentaire" />
      </div>
      <div class="flex items-center gap-3">
        <button class="btn-primary" type="submit" :disabled="submitting">
          {{ submitting ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
        <p class="text-sm" :class="messageClass">{{ message }}</p>
      </div>
    </form>

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
          <div v-if="attendanceByCourse(course.courseId || course.id).length === 0" class="text-sm text-muted">Aucun enregistrement pour ce cours.</div>
          <div v-for="record in attendanceByCourse(course.courseId || course.id)" :key="record.id" class="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
            <span class="text-ink font-medium">{{ record.student }} (ID {{ record.studentId }})</span>
            <span class="pill" :class="badgeClass(record.status)">{{ record.status }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="section-head">
        <h2>Historique</h2>
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
import { computed, onMounted, ref } from 'vue';
import { useDemoStore } from '../stores/demo';

const store = useDemoStore();
const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const courseId = ref<number | null>(null);
const studentId = ref<number | null>(null);
const status = ref('present');
const motif = ref('');
const submitting = ref(false);
const message = ref('');

const attendanceByCourse = (id: number) => store.attendance.filter((r) => r.courseId === id);

const messageClass = computed(() => (message.value.startsWith('Erreur') ? 'text-red-600' : 'text-secondary'));

const badgeClass = (state: string) => {
  if (state === 'present') return 'bg-primary/10 text-primary';
  if (state === 'absent') return 'bg-red-100 text-red-600';
  if (state === 'retard') return 'bg-accent/10 text-accent';
  return 'bg-secondary/10 text-secondary';
};

const submitAttendance = async () => {
  if (!courseId.value || !studentId.value) {
    message.value = 'Erreur : sélectionnez un cours et un étudiant.';
    return;
  }
  submitting.value = true;
  message.value = '';
  try {
    await store.addAttendance(
      { courseId: courseId.value, studentId: studentId.value, status: status.value, motif: motif.value },
      apiBase,
    );
    message.value = 'Présence enregistrée.';
    motif.value = '';
  } catch (err) {
    message.value = 'Erreur : enregistrement impossible';
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  store.fetchCourses(apiBase);
  store.fetchAttendance(apiBase);
});
</script>
