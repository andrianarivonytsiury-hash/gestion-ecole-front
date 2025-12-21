<template>
  <div class="space-y-6">
    <div class="section-head">
      <div>
        <p class="eyebrow">Finances</p>
        <h1 class="text-2xl font-semibold text-ink">Flux et statistiques</h1>
      </div>
      <button class="btn-primary">Nouvelle écriture</button>
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <div class="card">
        <p class="eyebrow">Encaissements</p>
        <p class="stat">{{ currency(totalCredit) }}</p>
        <p class="hint text-primary">Inclut écolage</p>
      </div>
      <div class="card">
        <p class="eyebrow">Décaissements</p>
        <p class="stat">{{ currency(totalDebit) }}</p>
        <p class="hint text-red-500">Charges, achats</p>
      </div>
      <div class="card">
        <p class="eyebrow">Solde courant</p>
        <p class="stat">{{ currency(currentSolde) }}</p>
        <p class="hint text-secondary">Recalculé après chaque flux</p>
      </div>
    </div>

    <div class="panel">
      <div class="section-head">
        <h2>Par mois</h2>
        <span class="hint">Débit / Crédit</span>
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
      <table class="min-w-full text-sm">
        <thead class="bg-slate-50 text-muted uppercase text-xs">
          <tr>
            <th class="cell text-left">Date</th>
            <th class="cell text-left">Référence</th>
            <th class="cell text-left">Libellé</th>
            <th class="cell text-right">Débit</th>
            <th class="cell text-right">Crédit</th>
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
import { computed } from 'vue'; // API pour valeurs dérivées.
import { useDemoStore } from '../stores/demo'; // Store Pinia avec données mock.

const store = useDemoStore(); // Instance du store.

const totalCredit = computed(() => store.finances.reduce((sum, f) => sum + f.credit, 0)); // Somme des crédits.
const totalDebit = computed(() => store.finances.reduce((sum, f) => sum + f.debit, 0)); // Somme des débits.
const currentSolde = computed(() => store.finances.at(-1)?.solde ?? 0); // Solde du dernier flux.
const monthly = computed(() => store.monthlyFinance); // Agrégat mensuel depuis le getter.

const maxAmount = computed(() => {
  const values = Object.values(monthly.value).flatMap((m) => [m.debit, m.credit]); // Collecte débits + crédits.
  return Math.max(...values, 1); // Trouve le max pour dimensionner les barres.
});

const currency = (amount: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount); // Format EUR.
const barWidth = (value: number) => `${Math.min(100, Math.round((value / maxAmount.value) * 100))}%`; // Pourcentage de barre.
</script>
