<template>
  <div class="min-h-screen bg-surface text-ink flex">
    <aside class="w-72 hidden lg:flex flex-col border-r border-slate-200 bg-white">
      <div class="px-5 py-6 flex items-center gap-3">
        <span class="h-11 w-11 rounded-2xl bg-primary text-white grid place-items-center font-semibold">E</span>
        <div>
          <p class="text-sm text-muted">Plateforme</p>
          <p class="text-lg font-semibold text-ink">Gestion d'ecole</p>
        </div>
      </div>
      <div class="px-5 pb-4">
        <p class="text-xs uppercase text-muted mb-2">Roles</p>
        <div class="flex gap-2 flex-wrap">
          <button v-for="r in roles" :key="r" class="chip" :class="{ 'chip-active': store.role === r }" @click="store.setRole(r)">
            {{ labelRole(r) }}
          </button>
        </div>
      </div>
      <nav class="px-3 space-y-1">
        <RouterLink v-for="link in links" :key="link.to" :to="link.to" class="nav-link" active-class="nav-link-active">
          <span>{{ link.label }}</span>
          <span class="text-xs text-muted">{{ link.kicker }}</span>
        </RouterLink>
      </nav>
      <div class="px-3 mt-4 mb-2 text-xs uppercase text-muted">Élèves</div>
      <div class="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
        <RouterLink
          v-for="student in store.students"
          :key="student.id"
          :to="`/students/${student.id}`"
          class="nav-link"
          active-class="nav-link-active"
        >
          <span class="font-semibold text-ink">{{ student.firstName }} {{ student.lastName }}</span>
          <span class="text-xs text-muted">{{ student.class?.label || student.matricule }}</span>
        </RouterLink>
        <p v-if="!store.students.length" class="text-xs text-muted px-2">Aucun élève</p>
      </div>
      <div class="px-5 py-4 text-xs text-muted">
        <p>Role: {{ labelRole(store.role) }}</p>
        <p>Socket: temps réel</p>
      </div>
    </aside>

    <div class="flex-1 flex flex-col">
      <header class="bg-white shadow-sm sticky top-0 z-10">
        <div class="px-4 lg:px-8 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3 lg:hidden">
            <span class="h-10 w-10 rounded-xl bg-primary text-white grid place-items-center font-semibold">E</span>
            <div>
              <p class="text-sm text-muted">Plateforme</p>
              <p class="text-lg font-semibold text-ink">Gestion d'ecole</p>
            </div>
          </div>
          <div class="flex items-center gap-2 text-sm text-muted">
            <span class="pill bg-primary/10 text-primary">Role: {{ labelRole(store.role) }}</span>
            <span class="hidden md:inline">|</span>
            <span class="hidden md:inline font-medium">Demo UX mobile-first</span>
          </div>
        </div>
      </header>

      <main class="px-4 lg:px-8 py-8 bg-surface">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import { useDemoStore, type Role } from './stores/demo';

const store = useDemoStore();
const roles: Role[] = ['admin', 'prof', 'parent'];

const links = [
  { to: '/', label: 'Dashboard', kicker: 'Vue globale' },
  { to: '/finances', label: 'Finances', kicker: 'Flux + stats' },
  { to: '/absences', label: 'Absences', kicker: 'Presence cours' },
   { to: '/students', label: 'Eleves', kicker: 'CRUD' },
  { to: '/notes', label: 'Notes', kicker: 'Saisie + lecture' },
  { to: '/timetable', label: 'Emplois du temps', kicker: 'Calendrier' },
  { to: '/payments', label: 'Paiements', kicker: 'Stripe mock' },
  { to: '/notifications', label: 'Notifications', kicker: 'Parents' },
  { to: '/correspondence', label: 'Correspondance', kicker: 'Carnet' },
];

const labelRole = (role: Role) => {
  if (role === 'admin') return 'Admin';
  if (role === 'prof') return 'Prof';
  return 'Parent';
};

onMounted(() => {
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  store.bootstrap(apiBase);
  store.initSocket(apiBase);
});
</script>
