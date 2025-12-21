<template>
  <div class="space-y-6">
    <div class="section-head">
      <div>
        <p class="eyebrow">Paiements</p>
        <h1 class="text-2xl font-semibold text-ink">Stripe Checkout (mock)</h1>
      </div>
      <button class="btn-primary">Initier un paiement</button>
    </div>

    <div class="panel">
      <div class="section-head">
        <h2>Transactions</h2>
        <span class="hint">CB</span>
      </div>
      <div class="grid gap-3 md:grid-cols-2">
        <div v-for="payment in store.payments" :key="payment.id" class="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex items-center justify-between">
          <div>
            <p class="font-semibold text-ink">{{ payment.student }}</p>
            <p class="text-sm text-muted">{{ currency(payment.amount) }}</p>
            <p class="text-xs text-muted">Stripe PaymentIntent</p>
          </div>
          <span class="pill" :class="statusClass(payment.status)">{{ payment.status }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDemoStore } from '../stores/demo'; // Store Pinia (paiements mock).
const store = useDemoStore(); // Instance du store.
const currency = (amount: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount); // Format EUR.

const statusClass = (status: string) => {
  if (status === 'succeeded') return 'bg-primary/10 text-primary'; // Paiement réussi.
  if (status === 'requires_action') return 'bg-accent/10 text-accent'; // Action requise (3DS).
  return 'bg-red-100 text-red-600'; // Erreur/échec.
};
</script>
