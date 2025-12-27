<template>
  <div class="space-y-6">
    <div class="section-head">
      <div>
        <p class="eyebrow">Finances</p>
        <h1 class="text-2xl font-semibold text-ink">Flux et statistiques</h1>
      </div>
      <button class="btn-primary">Nouvelle ecriture</button>
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <div class="card">
        <p class="eyebrow">Encaissements</p>
        <p class="stat">{{ currency(totalCredit) }}</p>
        <p class="hint text-primary">Inclut ecolage</p>
      </div>
      <div class="card">
        <p class="eyebrow">Decaissements</p>
        <p class="stat">{{ currency(totalDebit) }}</p>
        <p class="hint text-red-500">Charges, achats</p>
      </div>
      <div class="card">
        <p class="eyebrow">Solde courant</p>
        <p class="stat">{{ currency(currentSolde) }}</p>
        <p class="hint text-secondary">Recalcule apres chaque flux</p>
      </div>
    </div>

    <div class="panel">
      <div class="section-head">
        <h2>Par mois</h2>
        <span class="hint">Debit / Credit</span>
      </div>
      <div class="flex gap-3 overflow-x-auto pb-2">
        <div v-for="(item, month) in monthly" :key="month" class="min-w-[120px] bg-slate-50 rounded-xl p-3 border border-slate-100">
          <p class="text-sm font-semibold text-ink">{{ month }}</p>
          <div class="mt-3 space-y-2">
            <div class="h-2 rounded-full bg-red-100">
              <div class="h-2 rounded-full bg-red-500" :style="{ width: barWidth(item.debit) }"></div>
            </div>
            <div class="h-2 rounded-full bg-primary/10">
              <div class="h-2 rounded-full bg-primary" :style="{ width: barWidth(item.credit) }"></div>
            </div>
            <div class="flex justify-between text-xs text-muted">
              <span>-{{ currency(item.debit) }}</span>
              <span>+{{ currency(item.credit) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="panel overflow-x-auto">
      <div class="section-head">
        <h2>Journal des flux</h2>
        <button class="link">Exporter CSV</button>
      </div>
      <p v-if="store.financesLoading" class="px-4 pb-3 text-sm text-muted">Chargement des flux depuis l'API...</p>
      <p v-else-if="store.financeError" class="px-4 pb-3 text-sm text-red-600">API finances: {{ store.financeError }} (affichage des donnees locales)</p>
      <table class="min-w-full text-sm">
        <thead class="bg-slate-50 text-muted uppercase text-xs">
          <tr>
            <th class="cell text-left">Date</th>
            <th class="cell text-left">Reference</th>
            <th class="cell text-left">Libelle</th>
            <th class="cell text-right">Debit</th>
            <th class="cell text-right">Credit</th>
            <th class="cell text-right">Solde</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="flow in store.finances" :key="flow.id" class="border-t border-slate-100 hover:bg-slate-50/40">
            <td class="cell">{{ flow.date }}</td>
            <td class="cell font-medium text-ink">{{ flow.reference }}</td>
            <td class="cell">{{ flow.libelle }}</td>
            <td class="cell text-right text-red-500">{{ flow.debit ? '-' + currency(flow.debit) : '-' }}</td>
            <td class="cell text-right text-primary">{{ flow.credit ? '+' + currency(flow.credit) : '-' }}</td>
            <td class="cell text-right font-semibold text-ink">{{ currency(flow.solde) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useDemoStore } from '../stores/demo';

const store = useDemoStore();
const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const totalCredit = computed(() => store.finances.reduce((sum, f) => sum + f.credit, 0));
const totalDebit = computed(() => store.finances.reduce((sum, f) => sum + f.debit, 0));
const currentSolde = computed(() => store.finances.at(-1)?.solde ?? 0);
const monthly = computed(() => store.monthlyFinance);

const maxAmount = computed(() => {
  const values = Object.values(monthly.value).flatMap((m) => [m.debit, m.credit]);
  return Math.max(...values, 1);
});

const currency = (amount: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
const barWidth = (value: number) => `${Math.min(100, Math.round((value / maxAmount.value) * 100))}%`;

onMounted(() => {
  store.fetchFinances(apiBase);
});
</script>
