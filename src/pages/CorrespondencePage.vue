<template>
  <div class="space-y-6">
    <div class="section-head">
      <div>
        <p class="eyebrow">Carnet de correspondance</p>
        <h1 class="text-2xl font-semibold text-ink">Parents ↔ Prof / Admin</h1>
      </div>
    </div>

    <form class="panel grid gap-4 md:grid-cols-3 items-end" @submit.prevent="submitMessage">
      <div>
        <label class="label">ID étudiant</label>
        <input v-model.number="studentId" type="number" min="1" class="input" placeholder="ex: 1" />
      </div>
      <div>
        <label class="label">Rôle</label>
        <select v-model="fromRole" class="input">
          <option value="parent">Parent</option>
          <option value="teacher">Prof</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div class="md:col-span-2">
        <label class="label">Message</label>
        <input v-model="message" type="text" class="input" placeholder="Écrire un message" />
      </div>
      <div class="flex items-center gap-3 md:col-span-3">
        <button class="btn-primary" type="submit" :disabled="loading">
          {{ loading ? 'Envoi...' : 'Répondre' }}
        </button>
        <button class="link" type="button" @click="refresh">Actualiser</button>
        <p class="text-sm" :class="messageClass">{{ feedback }}</p>
      </div>
    </form>

    <div class="grid gap-4 md:grid-cols-2">
      <div v-for="messageItem in store.correspondence" :key="messageItem.id" class="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-2">
        <p class="text-xs text-muted">{{ messageItem.fromRole }} · {{ messageItem.createdAt }}</p>
        <p class="text-ink font-medium">{{ messageItem.message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useDemoStore } from '../stores/demo';

const store = useDemoStore();
const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const studentId = ref<number | null>(null);
const fromRole = ref('parent');
const message = ref('');
const loading = ref(false);
const feedback = ref('');

const messageClass = computed(() => (feedback.value.startsWith('Erreur') ? 'text-red-600' : 'text-secondary'));

const refresh = () => {
  store.fetchCorrespondence(apiBase);
};

const submitMessage = async () => {
  if (!studentId.value || !message.value) {
    feedback.value = 'Erreur : indiquez ID étudiant et message';
    return;
  }
  loading.value = true;
  feedback.value = '';
  try {
    await store.addCorrespondence({ studentId: studentId.value, fromRole: fromRole.value, message: message.value }, apiBase);
    feedback.value = 'Message envoyé';
    message.value = '';
  } catch (err) {
    feedback.value = 'Erreur : envoi impossible';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  store.fetchCorrespondence(apiBase);
});
</script>
