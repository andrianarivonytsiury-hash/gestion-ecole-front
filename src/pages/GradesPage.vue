<template>
  <div class="space-y-6">
    <div class="section-head">
      <div>
        <p class="eyebrow">Notes</p>
        <h1 class="text-2xl font-semibold text-ink">Saisie et consultation</h1>
      </div>
      <span class="pill bg-primary/10 text-primary" v-if="canEditGrades">Admin / Prof : edition autorisee</span>
    </div>

    <div v-if="canEditGrades" class="panel">
      <div class="section-head">
        <h2>{{ form.id ? 'Modifier une note' : 'Ajouter une note' }}</h2>
        <button class="link" type="button" @click="reset">Annuler</button>
      </div>
      <form class="grid gap-4 md:grid-cols-3 items-end" @submit.prevent="submit">
        <div>
          <label class="label">Eleve</label>
          <select v-model.number="form.studentId" class="input">
            <option :value="null" disabled>Choisir un eleve</option>
            <option v-for="student in store.students" :key="student.id" :value="student.id">
              {{ student.firstName }} {{ student.lastName }} ({{ student.matricule }})
            </option>
          </select>
        </div>
        <div>
          <label class="label">Cours</label>
          <select v-model.number="form.courseId" class="input">
            <option :value="null" disabled>Choisir un cours</option>
            <option v-for="course in store.courseCatalog" :key="course.id" :value="course.id">
              {{ course.subject }} - {{ course.classLabel || 'Classe #' + course.classId }}
            </option>
          </select>
        </div>
        <div>
          <label class="label">Type d'evaluation</label>
          <input v-model="form.typeEval" type="text" class="input" placeholder="Interro / Devoir" />
        </div>
        <div>
          <label class="label">Coeff</label>
          <input v-model.number="form.coeff" type="number" min="1" step="0.5" class="input" />
        </div>
        <div>
          <label class="label">Note /20</label>
          <input v-model.number="form.valeur" type="number" min="0" max="20" step="0.5" class="input" />
        </div>
        <div>
          <label class="label">Auteur (ID)</label>
          <input v-model.number="form.authorId" type="number" min="1" class="input" />
        </div>
        <div class="md:col-span-3 flex items-center gap-3 flex-wrap">
          <button class="btn-primary" type="submit" :disabled="submitting">
            {{ submitting ? 'Enregistrement...' : form.id ? 'Mettre a jour' : 'Ajouter' }}
          </button>
          <p class="text-sm" :class="messageClass">{{ message }}</p>
        </div>
      </form>
    </div>

    <div class="panel overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead class="bg-slate-50 text-muted uppercase text-xs">
          <tr>
            <th class="cell text-left">Eleve</th>
            <th class="cell text-left">Evaluation</th>
            <th class="cell text-left">Coeff</th>
            <th class="cell text-left">Note</th>
            <th class="cell text-left">Cours</th>
            <th v-if="canEditGrades" class="cell text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="grade in store.grades" :key="grade.id" class="border-t border-slate-100 hover:bg-slate-50/40">
            <td class="cell font-semibold text-ink">{{ grade.student }}</td>
            <td class="cell">{{ grade.typeEval }}</td>
            <td class="cell">{{ grade.coeff }}</td>
            <td class="cell">
              <span class="pill bg-primary/10 text-primary">{{ grade.valeur }}/20</span>
            </td>
            <td class="cell">Cours #{{ grade.courseId || '-' }}</td>
            <td v-if="canEditGrades" class="cell text-right space-x-3">
              <button class="link" type="button" @click="prefill(grade)">Editer</button>
              <button class="link text-red-600" type="button" :disabled="submitting" @click="remove(grade.id)">Supprimer</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!store.grades.length" class="text-sm text-muted px-4 py-3">Aucune note</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useDemoStore, type GradeRecord } from '../stores/demo';

const store = useDemoStore();
const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const canEditGrades = computed(() => store.role === 'admin' || store.role === 'prof');
const submitting = ref(false);
const message = ref('');
const messageClass = computed(() => (message.value.startsWith('Erreur') ? 'text-red-600' : 'text-secondary'));

const form = ref({
  id: null as number | null,
  studentId: null as number | null,
  courseId: null as number | null,
  typeEval: 'Evaluation',
  coeff: 1,
  valeur: 0,
  authorId: 1,
});

const reset = () => {
  form.value = { id: null, studentId: null, courseId: null, typeEval: 'Evaluation', coeff: 1, valeur: 0, authorId: 1 };
  message.value = '';
};

const submit = async () => {
  if (!form.value.studentId || !form.value.courseId) {
    message.value = 'Erreur : eleve et cours requis';
    return;
  }
  submitting.value = true;
  message.value = '';
  try {
    const payload = {
      studentId: form.value.studentId,
      courseId: form.value.courseId,
      valeur: Number(form.value.valeur) || 0,
      typeEval: form.value.typeEval,
      coeff: Number(form.value.coeff) || 1,
    };
    if (form.value.id) {
      await store.updateGrade(form.value.id, { ...payload, updatedBy: form.value.authorId }, apiBase);
      message.value = 'Note mise a jour';
    } else {
      await store.createGrade({ ...payload, createdBy: form.value.authorId }, apiBase);
      message.value = 'Note enregistree';
    }
    reset();
  } catch (err) {
    message.value = 'Erreur : enregistrement impossible';
  } finally {
    submitting.value = false;
  }
};

const prefill = (grade: GradeRecord) => {
  form.value = {
    id: grade.id,
    studentId: grade.studentId ?? store.students.find((s) => `${s.firstName} ${s.lastName}`.trim() === grade.student)?.id ?? null,
    courseId: grade.courseId ?? null,
    typeEval: grade.typeEval,
    coeff: grade.coeff,
    valeur: grade.valeur,
    authorId: form.value.authorId,
  };
  message.value = '';
};

const remove = async (id: number) => {
  submitting.value = true;
  message.value = '';
  try {
    await store.deleteGrade(id, apiBase);
    message.value = 'Note supprimee';
    if (form.value.id === id) reset();
  } catch (err) {
    message.value = 'Erreur : suppression impossible';
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  store.fetchGrades(apiBase);
  if (!store.students.length) store.fetchStudents(apiBase);
  if (!store.courseCatalog.length) store.fetchCourseCatalog(apiBase);
});
</script>
