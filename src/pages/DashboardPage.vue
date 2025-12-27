<template>
  <!-- Page dashboard regroupant cartes et tableaux -->
  <div class="space-y-6">
    <!-- Cartes de stats rapides (dont message backend pour illustrer la liaison front/back) -->
    <div class="grid gap-4 md:grid-cols-3">
      <div class="card">
        <p class="eyebrow">Encaissements</p>
        <p class="stat">{{ currency(totalCredit) }}</p>
        <p class="hint text-primary">+12% vs mois precedent</p>
      </div>
      <div class="card">
        <p class="eyebrow">Absences du jour</p>
        <p class="stat">{{ absents }}</p>
        <p class="hint text-secondary">Notifications parents envoyees</p>
      </div>
      <div class="card">
        <p class="eyebrow">Paiements en attente</p>
        <p class="stat">{{ pendingPayments }}</p>
        <p class="hint text-accent">Stripe Checkout active</p>
      </div>
      <div class="card">
        <p class="eyebrow">Backend API</p>
        <p class="text-sm text-ink font-semibold break-words">{{ store.apiMessage || 'Chargement...' }}</p>
        <p class="hint text-muted">Depuis {{ apiBase }}</p>
      </div>
    </div>

    <!-- Tableau finances -->
    <div class="grid gap-6 lg:grid-cols-3">
      <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div class="section-head">
          <h2>Flux financiers</h2>
          <button class="link">Exporter CSV</button>
        </div>
        <p v-if="store.financesLoading" class="px-4 pb-2 text-sm text-muted">Chargement des flux...</p>
        <p v-else-if="store.financeError" class="px-4 pb-2 text-sm text-red-600">API finances: {{ store.financeError }}</p>
        <div class="overflow-x-auto">
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

      <!-- Bloc presence -->
      <div class="space-y-4">
        <div class="section-head">
          <h2>Presence</h2>
          <button class="link">Notifier</button>
        </div>
        <div class="rounded-2xl bg-white border border-slate-100 shadow-sm divide-y divide-slate-100">
          <div v-for="record in store.attendance" :key="record.id" class="px-4 py-3 flex items-center justify-between">
            <div>
              <p class="font-semibold text-ink">{{ record.student }}</p>
              <p class="text-xs text-muted">Cours #{{ record.courseId }}</p>
            </div>
            <span class="pill" :class="badgeClass(record.status)">{{ record.status }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Emploi du temps + notes -->
    <div class="grid gap-6 lg:grid-cols-2">
      <div class="panel">
        <div class="section-head">
          <h2>Emploi du temps</h2>
          <span class="hint">Classe 6eme A</span>
        </div>
        <div class="divide-y divide-slate-100">
          <div v-for="slot in store.courses" :key="slot.id" class="py-3 flex items-start gap-3">
            <div class="slot-chip">{{ slot.start }}</div>
            <div class="flex-1">
              <p class="font-semibold text-ink">{{ slot.label }}</p>
              <p class="text-sm text-muted">{{ slot.room }} - {{ slot.status }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="panel">
        <div class="section-head">
          <h2>Notes recentes</h2>
          <span class="hint">Prof - Maths</span>
        </div>
        <div class="divide-y divide-slate-100">
          <div v-for="grade in store.grades" :key="grade.id" class="flex items-center justify-between py-3">
            <div>
              <p class="font-semibold text-ink">{{ grade.student }}</p>
              <p class="text-sm text-muted">{{ grade.typeEval }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-muted">Coeff {{ grade.coeff }}</span>
              <span class="pill bg-primary/10 text-primary">{{ grade.valeur }}/20</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notifications / paiements / correspondance -->
    <div class="grid gap-6 lg:grid-cols-3">
      <div class="panel">
        <div class="section-head">
          <h2>Notifications parents</h2>
          <span class="hint">Canal</span>
        </div>
        <div class="space-y-3">
          <div v-for="notif in store.notifications" :key="notif.id" class="p-3 rounded-xl bg-slate-50">
            <div class="flex items-center justify-between">
              <p class="font-semibold text-ink">{{ notif.title }}</p>
              <span class="pill bg-ink/10 text-ink">{{ notif.channel }}</span>
            </div>
            <p class="text-sm text-muted">{{ notif.message }}</p>
          </div>
        </div>
      </div>
      <div class="panel">
        <div class="section-head">
          <h2>Paiements</h2>
          <span class="hint">Stripe</span>
        </div>
        <div class="space-y-3">
          <div v-for="payment in store.payments" :key="payment.id" class="p-3 rounded-xl border border-slate-100 flex items-center justify-between">
            <div>
              <p class="font-semibold text-ink">{{ payment.student }}</p>
              <p class="text-sm text-muted">{{ currency(payment.amount) }} - {{ payment.status }}</p>
            </div>
            <span class="pill bg-primary/10 text-primary">CB</span>
          </div>
        </div>
      </div>
      <div class="panel">
        <div class="section-head">
          <h2>Correspondance</h2>
          <button class="link">Repondre</button>
        </div>
        <div class="space-y-3">
          <div v-for="message in store.correspondence" :key="message.id" class="p-3 rounded-xl bg-slate-50">
            <p class="text-xs text-muted">{{ message.fromRole }} - {{ message.createdAt }}</p>
            <p class="text-ink font-medium">{{ message.message }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'; // API Vue pour valeurs derivées et hook de montage.
import { useDemoStore } from '../stores/demo'; // Store de démo (données + actions).

const store = useDemoStore(); // Instance du store Pinia.
const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000'; // Base API pour joindre le backend.

// Valeur totale des crédits.
const totalCredit = computed(() => store.finances.reduce((sum, f) => sum + f.credit, 0));
// Nombre d'absences du jour.
const absents = computed(() => store.attendance.filter((a) => a.status === 'absent').length);
// Nombre de paiements non réussis.
const pendingPayments = computed(() => store.payments.filter((p) => p.status !== 'succeeded').length);

// Formateur monnaie EUR.
const currency = (amount: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
// Couleur badge selon statut.
const badgeClass = (status: string) => {
  if (status === 'present') return 'bg-primary/10 text-primary';
  if (status === 'absent') return 'bg-red-100 text-red-600';
  return 'bg-accent/10 text-accent';
};

onMounted(() => {
  store.fetchApiMessage(apiBase); // Charge le message depuis le backend au montage de la page.
  store.bootstrap(apiBase); // Charge les donn├®es dynamiques (finances, presences, etc.).
});
</script>
