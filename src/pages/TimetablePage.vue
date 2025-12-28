<template>
  <div class="space-y-6">
    <div class="section-head">
      <div>
        <p class="eyebrow">Emplois du temps & Calendrier</p>
        <h1 class="text-2xl font-semibold text-ink">Vue fusionnee cours + jours off</h1>
      </div>
      <div class="flex items-center gap-3">
        <button class="btn-primary" type="button" @click="refresh">Actualiser</button>
      </div>
    </div>

    <div v-if="canEditTimetable" class="panel">
      <div class="section-head">
        <h2>{{ slotForm.id ? 'Modifier un cours' : 'Ajouter un cours' }}</h2>
        <button class="link" type="button" @click="reset">Annuler</button>
      </div>
      <form class="grid gap-4 md:grid-cols-3 items-end" @submit.prevent="submit">
        <div>
          <label class="label">Debut</label>
          <input v-model="slotForm.start" type="datetime-local" class="input" />
        </div>
        <div>
          <label class="label">Fin</label>
          <input v-model="slotForm.end" type="datetime-local" class="input" />
        </div>
        <div>
          <label class="label">Salle</label>
          <input v-model="slotForm.room" type="text" class="input" placeholder="Salle A1" />
        </div>
        <div>
          <label class="label">Statut</label>
          <input v-model="slotForm.status" type="text" class="input" placeholder="prevu / reporte" />
        </div>
        <div>
          <label class="label">Classe</label>
          <select v-model.number="slotForm.classId" class="input">
            <option :value="null" disabled>Choisir une classe</option>
            <option v-for="classe in store.classes" :key="classe.id" :value="classe.id">
              {{ classe.label }} - {{ classe.level }}
            </option>
          </select>
        </div>
        <div>
          <label class="label">Cours</label>
          <select v-model.number="slotForm.courseId" class="input">
            <option :value="null" disabled>Choisir un cours</option>
            <option v-for="course in store.courseCatalog" :key="course.id" :value="course.id">
              {{ course.subject }} (Classe {{ course.classLabel || course.classId }})
            </option>
          </select>
        </div>
        <div class="md:col-span-3 flex items-center gap-3 flex-wrap">
          <button class="btn-primary" type="submit" :disabled="submitting">
            {{ submitting ? 'Enregistrement...' : slotForm.id ? 'Mettre a jour' : 'Ajouter' }}
          </button>
          <p class="text-sm" :class="messageClass">{{ message }}</p>
        </div>
      </form>
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <div class="panel lg:col-span-2">
        <div class="section-head">
          <h2>Emplois du temps</h2>
          <span class="hint">Edition admin</span>
        </div>
        <div class="divide-y divide-slate-100">
          <div v-for="slot in store.courses" :key="slot.id" class="flex items-start gap-3 py-3">
            <div class="slot-chip bg-secondary/10 text-secondary">{{ slot.start }}</div>
            <div class="flex-1">
              <p class="font-semibold text-ink">{{ slot.label }}</p>
              <p class="text-sm text-muted">{{ slot.room }} | {{ slot.class }}</p>
              <p class="text-xs text-muted">Cours #{{ slot.courseId }} | Classe #{{ slot.classId || '-' }}</p>
            </div>
            <div class="flex flex-col items-end gap-2">
              <span class="pill bg-primary/10 text-primary">{{ slot.status }}</span>
              <div v-if="canEditTimetable" class="space-x-2">
                <button class="link" type="button" @click="prefill(slot)">Editer</button>
                <button class="link text-red-600" type="button" :disabled="submitting" @click="remove(slot.id)">Supprimer</button>
              </div>
            </div>
          </div>
          <p v-if="!store.courses.length" class="text-sm text-muted py-3 px-2">Aucun cours dans l'emploi du temps.</p>
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
            <p class="text-sm text-muted">{{ holiday.startDate }} | {{ holiday.endDate }}</p>
            <span class="pill bg-ink/10 text-ink">{{ holiday.type }}</span>
          </div>
          <p v-if="!store.holidays.length" class="text-sm text-muted">Pas de jours off</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useDemoStore, type CourseRecord } from '../stores/demo';

const store = useDemoStore();
const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const canEditTimetable = computed(() => store.role === 'admin');
const submitting = ref(false);
const message = ref('');
const messageClass = computed(() => (message.value.startsWith('Erreur') ? 'text-red-600' : 'text-secondary'));

const slotForm = ref({
  id: null as number | null,
  start: new Date().toISOString().slice(0, 16),
  end: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
  room: 'Salle A1',
  status: 'prevu',
  classId: null as number | null,
  courseId: null as number | null,
});

const reset = () => {
  slotForm.value = {
    id: null,
    start: new Date().toISOString().slice(0, 16),
    end: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
    room: 'Salle A1',
    status: 'prevu',
    classId: null,
    courseId: null,
  };
  message.value = '';
};

const submit = async () => {
  if (!slotForm.value.start || !slotForm.value.end || !slotForm.value.classId || !slotForm.value.courseId) {
    message.value = 'Erreur : debut, fin, classe et cours requis';
    return;
  }
  submitting.value = true;
  message.value = '';
  try {
    const payload = {
      start: new Date(slotForm.value.start).toISOString(),
      end: new Date(slotForm.value.end).toISOString(),
      room: slotForm.value.room,
      status: slotForm.value.status,
      classId: slotForm.value.classId,
      courseId: slotForm.value.courseId,
    };
    if (slotForm.value.id) {
      await store.updateTimetableSlot(slotForm.value.id, payload, apiBase);
      message.value = 'Cours mis a jour';
    } else {
      await store.createTimetableSlot(payload, apiBase);
      message.value = 'Cours ajoute';
    }
    reset();
  } catch (err) {
    message.value = 'Erreur : enregistrement impossible';
  } finally {
    submitting.value = false;
  }
};

const prefill = (slot: CourseRecord) => {
  slotForm.value = {
    id: slot.id,
    start: slot.startRaw || new Date().toISOString().slice(0, 16),
    end: slot.endRaw || new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
    room: slot.room,
    status: slot.status,
    classId: slot.classId ?? null,
    courseId: slot.courseId ?? null,
  };
  message.value = '';
};

const remove = async (id: number) => {
  submitting.value = true;
  message.value = '';
  try {
    await store.deleteTimetableSlot(id, apiBase);
    if (slotForm.value.id === id) reset();
    message.value = 'Cours supprime';
  } catch (err) {
    message.value = 'Erreur : suppression impossible';
  } finally {
    submitting.value = false;
  }
};

const refresh = () => {
  store.fetchCourses(apiBase);
  store.fetchHolidays(apiBase);
};

onMounted(() => {
  refresh();
  if (!store.classes.length) store.fetchClasses(apiBase);
  if (!store.courseCatalog.length) store.fetchCourseCatalog(apiBase);
});
</script>
