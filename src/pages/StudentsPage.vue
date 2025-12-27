<template>
  <div class="space-y-6">
    <div class="section-head">
      <div>
        <p class="eyebrow">Élèves</p>
        <h1 class="text-2xl font-semibold text-ink">Gestion des élèves</h1>
      </div>
    </div>

    <form class="panel grid gap-4 md:grid-cols-3 items-end" @submit.prevent="submit">
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
      <div class="flex items-center gap-3 md:col-span-3">
        <button class="btn-primary" type="submit" :disabled="loading">{{ loading ? 'Création...' : 'Ajouter' }}</button>
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
            <td class="cell text-right">
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
import { useDemoStore } from '../stores/demo';

const store = useDemoStore();
const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const form = ref({ matricule: '', firstName: '', lastName: '', classId: 1 });
const guardians = ref('');
const loading = ref(false);
const message = ref('');
const msgClass = computed(() => (message.value.startsWith('Erreur') ? 'text-red-600' : 'text-secondary'));

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
    await store.addStudent(
      {
        matricule: form.value.matricule,
        firstName: form.value.firstName,
        lastName: form.value.lastName,
        classId: form.value.classId,
        guardianIds,
      },
      apiBase,
    );
    message.value = 'Élève créé';
    form.value = { matricule: '', firstName: '', lastName: '', classId: 1 };
    guardians.value = '';
  } catch (err) {
    message.value = 'Erreur : création impossible';
  } finally {
    loading.value = false;
  }
};

const remove = async (id: number) => {
  loading.value = true;
  message.value = '';
  try {
    await store.deleteStudent(id, apiBase);
    message.value = 'Élève supprimé';
  } catch (err) {
    message.value = 'Erreur : suppression impossible';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  store.fetchStudents(apiBase);
});
</script>
