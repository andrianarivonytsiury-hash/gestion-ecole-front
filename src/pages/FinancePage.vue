<template>
  <div class="space-y-6">
    <div class="section-head">
      <div>
        <p class="eyebrow">Finances</p>
        <h1 class="text-2xl font-semibold text-ink">Flux et statistiques</h1>
      </div>
    </div>

    <div v-if="canEditFinance" class="panel">
      <div class="section-head">
        <h2>{{ editId ? 'Modifier un flux' : 'Nouvelle ecriture' }}</h2>
        <button class="link" type="button" @click="onResetClick">Reinitialiser</button>
      </div>
      <form class="grid gap-4 md:grid-cols-3" @submit.prevent="submit">
        <div>
          <label class="label">Date</label>
          <input v-model="form.date" type="date" class="input" required />
        </div>
        <div>
          <label class="label">Reference</label>
          <input v-model="form.reference" type="text" class="input" placeholder="REF-2024-01" required />
        </div>
        <div>
          <label class="label">Libelle</label>
          <input v-model="form.libelle" type="text" class="input" placeholder="Ecolage / achat..." />
        </div>
        <div>
          <label class="label">Debit</label>
          <input v-model.number="form.debit" type="number" min="0" step="0.01" class="input" />
        </div>
        <div>
          <label class="label">Credit</label>
          <input v-model.number="form.credit" type="number" min="0" step="0.01" class="input" />
        </div>
        <div>
          <label class="label">ID etudiant (optionnel)</label>
          <input v-model.number="form.studentId" type="number" min="1" class="input" placeholder="1" />
        </div>
        <div>
          <label class="label">Moyen</label>
          <input v-model="form.moyen" type="text" class="input" placeholder="CB / cash" />
        </div>
        <div>
          <label class="label">Statut</label>
          <input v-model="form.statut" type="text" class="input" placeholder="valide / en attente" />
        </div>
        <div class="md:col-span-3 flex items-center gap-3 flex-wrap">
          <button class="btn-primary" type="submit" :disabled="submitting">
            {{ submitting ? 'Enregistrement...' : editId ? 'Mettre a jour' : 'Ajouter' }}
          </button>
          <p class="text-sm" :class="messageClass">{{ message }}</p>
        </div>
      </form>
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
        <span class="hint">Actions temps reel</span>
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
            <th v-if="canEditFinance" class="cell text-right">Actions</th>
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
            <td v-if="canEditFinance" class="cell text-right space-x-3">
              <button class="link" type="button" @click="startEdit(flow)">Editer</button>
              <button class="link text-red-600" type="button" :disabled="submitting" @click="removeFlow(flow.id)">Supprimer</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useDemoStore, type FinanceFlow } from '../stores/demo';

const store = useDemoStore();
const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const totalCredit = computed(() => store.finances.reduce((sum, f) => sum + f.credit, 0));
const totalDebit = computed(() => store.finances.reduce((sum, f) => sum + f.debit, 0));
const currentSolde = computed(() => store.finances.at(-1)?.solde ?? 0);
const monthly = computed(() => store.monthlyFinance);
const canEditFinance = computed(() => store.role === 'admin');

const maxAmount = computed(() => {
  const values = Object.values(monthly.value).flatMap((m) => [m.debit, m.credit]);
  return Math.max(...values, 1);
});

const form = ref({
  date: new Date().toISOString().slice(0, 10),
  reference: '',
  libelle: '',
  debit: 0,
  credit: 0,
  studentId: null as number | null,
  moyen: '',
  statut: '',
});
const editId = ref<number | null>(null);
const submitting = ref(false);
const message = ref('');
const messageClass = computed(() => (message.value.startsWith('Erreur') ? 'text-red-600' : 'text-secondary'));

const resetForm = () => {
  form.value = {
    date: new Date().toISOString().slice(0, 10),
    reference: '',
    libelle: '',
    debit: 0,
    credit: 0,
    studentId: null,
    moyen: '',
    statut: '',
  };
  editId.value = null;
};

const onResetClick = () => {
  resetForm();
  message.value = '';
};

const submit = async () => {
  if (!form.value.date || !form.value.reference) {
    message.value = 'Erreur : date et reference requises';
    return;
  }
  submitting.value = true;
  message.value = '';
  try {
    const payload = {
      date: form.value.date,
      reference: form.value.reference,
      libelle: form.value.libelle,
      debit: Number(form.value.debit) || 0,
      credit: Number(form.value.credit) || 0,
      studentId: form.value.studentId || undefined,
      moyen: form.value.moyen,
      statut: form.value.statut,
    };
    if (editId.value) {
      await store.updateFinanceFlow(editId.value, payload, apiBase);
      resetForm();
      message.value = 'Flux mis a jour';
    } else {
      await store.createFinanceFlow(payload, apiBase);
      resetForm();
      message.value = 'Flux enregistre';
    }
  } catch (err) {
    message.value = 'Erreur : impossible denregistrer';
  } finally {
    submitting.value = false;
  }
};

const startEdit = (flow: FinanceFlow) => {
  editId.value = flow.id;
  form.value = {
    date: flow.date,
    reference: flow.reference,
    libelle: flow.libelle,
    debit: flow.debit,
    credit: flow.credit,
    studentId: flow.studentId ?? null,
    moyen: flow.moyen ?? '',
    statut: flow.statut ?? '',
  };
  message.value = '';
};

const removeFlow = async (id: number) => {
  submitting.value = true;
  message.value = '';
  try {
    await store.deleteFinanceFlow(id, apiBase);
    if (editId.value === id) resetForm();
    message.value = 'Flux supprime';
  } catch (err) {
    message.value = 'Erreur : suppression impossible';
  } finally {
    submitting.value = false;
  }
};

const currency = (amount: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
const barWidth = (value: number) => `${Math.min(100, Math.round((value / maxAmount.value) * 100))}%`;

onMounted(() => {
  store.fetchFinances(apiBase);
});
</script>
