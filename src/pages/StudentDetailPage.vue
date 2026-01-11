<template>
  <div class="space-y-6" v-if="detail">
    <div class="section-head">
      <div>
        <p class="eyebrow">Fiche élève</p>
        <h1 class="text-2xl font-semibold text-ink">{{ fullName }} ({{ detail.student.matricule }})</h1>
        <p class="text-sm text-muted">Classe : {{ detail.student.class?.label || 'N/A' }}</p>
      </div>
      <div class="space-x-2">
        <button class="btn-primary" type="button" @click="refresh">Actualiser</button>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <div class="panel">
        <div class="section-head">
          <h2>Parents</h2>
          <span class="hint">Contacts</span>
        </div>
        <div v-if="!detail.student.guardians?.length" class="text-sm text-muted">Aucun parent enregistré</div>
        <div v-for="guardian in detail.student.guardians" :key="guardian.id" class="py-2 border-b last:border-none border-slate-100">
          <p class="font-semibold text-ink">Parent #{{ guardian.id }}</p>
          <p class="text-sm text-muted">{{ guardian.email || 'email ?' }} · {{ guardian.phone || 'phone ?' }}</p>
        </div>
      </div>

      <div class="panel">
        <div class="section-head">
          <h2>Finances</h2>
          <span class="hint">Flux</span>
        </div>
        <div v-if="!detail.finance.length" class="text-sm text-muted">Aucune écriture</div>
        <div v-for="flow in detail.finance" :key="flow.id" class="flex items-center justify-between py-2 border-b last:border-none border-slate-100">
          <div>
            <p class="font-semibold text-ink">{{ flow.libelle }}</p>
            <p class="text-xs text-muted">{{ flow.date }} · {{ flow.reference }}</p>
          </div>
          <div class="text-right">
            <p class="text-red-500" v-if="flow.debit">-{{ currency(flow.debit) }}</p>
            <p class="text-primary" v-else>+{{ currency(flow.credit) }}</p>
            <p class="text-xs text-muted">Solde: {{ currency(flow.solde) }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <div class="panel">
        <div class="section-head">
          <h2>Présence</h2>
          <span class="hint">Absences / retards</span>
        </div>
        <div v-if="!detail.attendance.length" class="text-sm text-muted">Aucun enregistrement</div>
        <div v-for="item in detail.attendance" :key="item.id" class="flex items-center justify-between py-2 border-b last:border-none border-slate-100">
          <p class="font-semibold text-ink">Cours #{{ item.courseId }}</p>
          <span class="pill" :class="badgeClass(item.status)">{{ item.status }}</span>
        </div>
      </div>

      <div class="panel">
        <div class="section-head">
          <h2>Paiements</h2>
          <span class="hint">Stripe mock</span>
        </div>
        <div v-if="!detail.payments.length" class="text-sm text-muted">Aucun paiement</div>
        <div v-for="p in detail.payments" :key="p.id" class="flex items-center justify-between py-2 border-b last:border-none border-slate-100">
          <p class="font-semibold text-ink">{{ currency(p.amount) }}</p>
          <span class="pill" :class="statusClass(p.status)">{{ p.status }}</span>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="section-head">
        <h2>Notes</h2>
        <span class="hint">Evaluations</span>
      </div>
      <div v-if="!detail.grades.length" class="text-sm text-muted">Pas de notes</div>
      <div v-for="g in detail.grades" :key="g.id" class="flex items-center justify-between py-2 border-b last:border-none border-slate-100">
        <div>
          <p class="font-semibold text-ink">Cours #{{ g.courseId }}</p>
          <p class="text-sm text-muted">Coeff {{ g.coeff }}</p>
        </div>
        <span class="pill bg-primary/10 text-primary">{{ g.valeur }}/20</span>
      </div>
    </div>

    <div class="panel">
      <div class="section-head">
        <h2>Correspondance</h2>
        <span class="hint">Carnet</span>
      </div>
      <div v-if="!detail.correspondence.length" class="text-sm text-muted">Aucun message</div>
      <div v-for="c in detail.correspondence" :key="c.id" class="py-2 border-b last:border-none border-slate-100">
        <p class="text-xs text-muted">{{ c.fromRole }} · {{ c.createdAt }}</p>
        <p class="text-ink font-medium">{{ c.message }}</p>
      </div>
    </div>
  </div>
  <div v-else class="text-sm text-muted">Chargement...</div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useStudentsStore } from '../stores/students';

const route = useRoute();
const studentsStore = useStudentsStore();

const detailId = computed(() => Number(route.params.id));
const detail = computed(() => studentsStore.studentDetails[detailId.value]);
const fullName = computed(() => `${detail.value?.student.firstName ?? ''} ${detail.value?.student.lastName ?? ''}`.trim());

const currency = (amount: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
const badgeClass = (state: string) => {
  if (state === 'present') return 'bg-primary/10 text-primary';
  if (state === 'absent') return 'bg-red-100 text-red-600';
  if (state === 'retard') return 'bg-accent/10 text-accent';
  return 'bg-secondary/10 text-secondary';
};
const statusClass = (status: string) => {
  if (status === 'succeeded') return 'bg-primary/10 text-primary';
  if (status === 'requires_action') return 'bg-accent/10 text-accent';
  return 'bg-red-100 text-red-600';
};

const refresh = async () => {
  if (!detailId.value) return;
  await studentsStore.fetchStudentDetails(detailId.value);
};

watch(
  () => detailId.value,
  () => {
    refresh();
  },
  { immediate: true },
);

onMounted(() => {
  if (!studentsStore.students.length) studentsStore.fetchStudents();
});
</script>
