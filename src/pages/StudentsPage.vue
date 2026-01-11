<template>
  <div class="space-y-6">
    <div class="section-head">
      <div>
        <p class="eyebrow">Élèves</p>
        <h1 class="text-2xl font-semibold text-ink">Gestion des élèves</h1>
      </div>
    </div>

    <form class="panel grid gap-4 md:grid-cols-4 items-end" @submit.prevent="submit">
      <div>
        <label class="label">Matricule</label>
        <input v-model="form.matricule" type="text" class="input" placeholder="MAT-001" />
      </div>
      <div>
        <label class="label">Prénom</label>
        <input v-model="form.firstName" type="text" class="input" placeholder="Lina" />
      </div>
      <div>
        <label class="label">Nom</label>
        <input v-model="form.lastName" type="text" class="input" placeholder="Rakoto" />
      </div>
      <div>
        <label class="label">Classe ID</label>
        <input v-model.number="form.classId" type="number" min="1" class="input" placeholder="1" />
      </div>
      <div class="md:col-span-2">
        <label class="label">Parents (IDs, séparés par des virgules)</label>
        <input v-model="guardians" type="text" class="input" placeholder="ex: 1,2" />
      </div>
      <div class="flex items-center gap-3 md:col-span-4 flex-wrap">
        <button class="btn-primary" type="submit" :disabled="loading">{{ loading ? 'Création...' : 'Ajouter' }}</button>
        <button class="link" type="button" @click="reset">Annuler</button>
        <p class="text-sm" :class="msgClass">{{ message }}</p>
      </div>
    </form>

    <div class="panel overflow-x-auto">
      <div class="section-head">
        <h2>Liste des élèves</h2>
        <span class="hint">Cliquez pour voir la fiche</span>
      </div>
      <table class="min-w-full text-sm">
        <thead class="bg-slate-50 text-muted uppercase text-xs">
          <tr>
            <th class="cell text-left">ID</th>
            <th class="cell text-left">Matricule</th>
            <th class="cell text-left">Élève</th>
            <th class="cell text-left">Classe</th>
            <th class="cell text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in store.students" :key="s.id" class="border-t border-slate-100 hover:bg-slate-50/40">
            <td class="cell">{{ s.id }}</td>
            <td class="cell">{{ s.matricule }}</td>
            <td class="cell">
              <RouterLink class="link" :to="`/students/${s.id}`">{{ s.firstName }} {{ s.lastName }}</RouterLink>
            </td>
            <td class="cell">{{ s.class?.label || 'N/A' }}</td>
            <td class="cell text-right space-x-3">
              <button class="link" type="button" @click="prefill(s)">Modifier</button>
              <button class="link text-red-600" type="button" @click="remove(s.id)" :disabled="loading">Supprimer</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!store.students.length" class="text-sm text-muted px-4 py-3">Aucun élève</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useStudentsStore, type StudentRecord } from '../stores/students';

const store = useStudentsStore();

const form = ref({ id: null as number | null, matricule: '', firstName: '', lastName: '', classId: 1, guardianIds: [] as number[] });
const guardians = ref('');
const loading = ref(false);
const message = ref('');
const msgClass = computed(() => (message.value.startsWith('Erreur') ? 'text-red-600' : 'text-secondary'));

const reset = () => {
  form.value = { id: null, matricule: '', firstName: '', lastName: '', classId: 1, guardianIds: [] };
  guardians.value = '';
  message.value = '';
};

const submit = async () => {
  if (!form.value.matricule || !form.value.firstName || !form.value.lastName || !form.value.classId) {
    message.value = 'Erreur : champs requis manquants';
    return;
  }
  loading.value = true;
  message.value = '';
  try {
    const guardianIds = guardians.value
      .split(',')
      .map((v) => Number(v.trim()))
      .filter((n) => !Number.isNaN(n));

    if (form.value.id) {
      await store.updateStudent(
        {
          id: form.value.id,
          matricule: form.value.matricule,
          firstName: form.value.firstName,
          lastName: form.value.lastName,
          classId: form.value.classId,
          guardianIds,
        },
      );
      message.value = 'Élève mis à jour';
    } else {
      await store.addStudent(
        {
          matricule: form.value.matricule,
          firstName: form.value.firstName,
          lastName: form.value.lastName,
          classId: form.value.classId,
          guardianIds,
        },
      );
      message.value = 'Élève créé';
    }
    reset();
  } catch (err) {
    message.value = form.value.id ? 'Erreur : mise à jour impossible' : 'Erreur : création impossible';
  } finally {
    loading.value = false;
  }
};

const prefill = (s: StudentRecord) => {
  form.value = { id: s.id, matricule: s.matricule, firstName: s.firstName, lastName: s.lastName, classId: s.class?.id || 1, guardianIds: [] };
  guardians.value = '';
};

const remove = async (id: number) => {
  loading.value = true;
  message.value = '';
  try {
    await store.deleteStudent(id);
    message.value = 'Élève supprimé';
  } catch (err) {
    message.value = 'Erreur : suppression impossible';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  store.fetchStudents();
});
</script>
