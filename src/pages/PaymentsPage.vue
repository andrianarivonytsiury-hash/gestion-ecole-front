<template>
  <div class="space-y-6">
    <div class="section-head">
      <div>
        <p class="eyebrow">Paiements</p>
        <h1 class="text-2xl font-semibold text-ink">Stripe Checkout (mock)</h1>
      </div>
    </div>

    <form class="panel grid gap-4 md:grid-cols-4 items-end" @submit.prevent="submitPayment">
      <div>
        <label class="label">ID étudiant</label>
        <input v-model.number="studentId" type="number" min="1" class="input" placeholder="ex: 1" />
      </div>
      <div>
        <label class="label">Montant</label>
        <input v-model.number="amount" type="number" min="1" step="1" class="input" placeholder="ex: 200" />
      </div>
      <div>
        <label class="label">Devise</label>
        <input v-model="currency" type="text" class="input" placeholder="EUR" />
      </div>
      <div>
        <label class="label">Méthode</label>
        <select v-model="method" class="input">
          <option value="card">Carte</option>
          <option value="cash">Espèces</option>
        </select>
      </div>
      <div class="flex items-center gap-3 md:col-span-4">
        <button class="btn-primary" type="submit" :disabled="loading">
          {{ loading ? 'Création...' : 'Initier un paiement' }}
        </button>
        <p class="text-sm" :class="messageClass">{{ message }}</p>
      </div>
    </form>

    <div class="panel">
      <div class="section-head">
        <h2>Transactions</h2>
        <span class="hint">CB</span>
      </div>
      <div class="grid gap-3 md:grid-cols-2">
        <div v-for="payment in store.payments" :key="payment.id" class="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex items-center justify-between">
          <div>
            <p class="font-semibold text-ink">{{ payment.student }}</p>
            <p class="text-sm text-muted">{{ currencyFmt(payment.amount) }}</p>
            <p class="text-xs text-muted">Stripe PaymentIntent</p>
          </div>
          <span class="pill" :class="statusClass(payment.status)">{{ payment.status }}</span>
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

const studentId = ref<number | null>(null);
const amount = ref<number | null>(200);
const currency = ref('EUR');
const method = ref('card');
const loading = ref(false);
const message = ref('');

const messageClass = computed(() => (message.value.startsWith('Erreur') ? 'text-red-600' : 'text-secondary'));

const currencyFmt = (value: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

const statusClass = (status: string) => {
  if (status === 'succeeded') return 'bg-primary/10 text-primary';
  if (status === 'requires_action') return 'bg-accent/10 text-accent';
  return 'bg-red-100 text-red-600';
};

const submitPayment = async () => {
  if (!studentId.value || !amount.value) {
    message.value = 'Erreur : renseignez ID étudiant et montant';
    return;
  }
  loading.value = true;
  message.value = '';
  try {
    await store.createPayment({ studentId: studentId.value, amount: amount.value, currency: currency.value, method: method.value }, apiBase);
    message.value = 'Paiement créé (mock)';
  } catch (err) {
    message.value = 'Erreur : création impossible';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  store.fetchPayments(apiBase);
});
</script>
