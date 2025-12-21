<template>
  <!-- Conteneur principal avec layout flex horizontal -->
  <div class="min-h-screen bg-surface text-ink flex">
    <!-- Barre laterale (affichee sur ecrans lg et plus) -->
    <aside class="w-64 hidden lg:flex flex-col border-r border-slate-200 bg-white">
      <!-- Logo/nom -->
      <div class="px-5 py-6 flex items-center gap-3">
        <span class="h-11 w-11 rounded-2xl bg-primary text-white grid place-items-center font-semibold">E</span>
        <div>
          <p class="text-sm text-muted">Plateforme</p>
          <p class="text-lg font-semibold text-ink">Gestion d'ecole</p>
        </div>
      </div>
      <!-- Selecteur de roles -->
      <div class="px-5 pb-4">
        <p class="text-xs uppercase text-muted mb-2">Roles</p>
        <div class="flex gap-2">
          <button v-for="r in roles" :key="r" class="chip" :class="{ 'chip-active': store.role === r }" @click="store.setRole(r)">
            {{ labelRole(r) }}
          </button>
        </div>
      </div>
      <!-- Navigation -->
      <nav class="flex-1 px-3 space-y-1">
        <RouterLink v-for="link in links" :key="link.to" :to="link.to" class="nav-link" active-class="nav-link-active">
          <span>{{ link.label }}</span>
          <span class="text-xs text-muted">{{ link.kicker }}</span>
        </RouterLink>
      </nav>
      <!-- Footer sidebar -->
      <div class="px-5 py-4 text-xs text-muted">
        <p>Mobile-first + Vue 3 + Tailwind</p>
        <p>Mock data + Role: {{ store.role }}</p>
      </div>
    </aside>

    <!-- Colonne principale -->
    <div class="flex-1 flex flex-col">
      <!-- Entete sticky -->
      <header class="bg-white shadow-sm sticky top-0 z-10">
        <div class="px-4 lg:px-8 py-4 flex items-center justify-between">
          <!-- Logo mobile -->
          <div class="flex items-center gap-3 lg:hidden">
            <span class="h-10 w-10 rounded-xl bg-primary text-white grid place-items-center font-semibold">E</span>
            <div>
              <p class="text-sm text-muted">Plateforme</p>
              <p class="text-lg font-semibold text-ink">Gestion d'ecole</p>
            </div>
          </div>
          <!-- Badges info -->
          <div class="flex items-center gap-2 text-sm text-muted">
            <span class="pill bg-primary/10 text-primary">Role: {{ labelRole(store.role) }}</span>
            <span class="hidden md:inline">|</span>
            <span class="hidden md:inline font-medium">Demo UX mobile-first</span>
          </div>
        </div>
      </header>

      <!-- Zone de page -->
      <main class="px-4 lg:px-8 py-8 bg-surface">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'; // Composants fournis par vue-router (liens + vue courante).
import { useDemoStore, type Role } from './stores/demo'; // Store de demonstration (role + donnees mock).

const store = useDemoStore(); // Instance du store Pinia.
const roles: Role[] = ['admin', 'prof', 'parent']; // Roles disponibles pour la demo.

const links = [
  { to: '/', label: 'Dashboard', kicker: 'Vue globale' }, // Lien dashboard.
  { to: '/finances', label: 'Finances', kicker: 'Flux + stats' }, // Lien finances.
  { to: '/absences', label: 'Absences', kicker: 'Presence cours' }, // Lien absences.
  { to: '/notes', label: 'Notes', kicker: 'Saisie + lecture' }, // Lien notes.
  { to: '/timetable', label: 'Emplois du temps', kicker: 'Calendrier' }, // Lien emploi du temps.
  { to: '/payments', label: 'Paiements', kicker: 'Stripe mock' }, // Lien paiements.
  { to: '/notifications', label: 'Notifications', kicker: 'Parents' }, // Lien notifications.
  { to: '/correspondence', label: 'Correspondance', kicker: 'Carnet' }, // Lien correspondance.
];

const labelRole = (role: Role) => {
  if (role === 'admin') return 'Admin'; // Libelle pour admin.
  if (role === 'prof') return 'Prof'; // Libelle pour professeur.
  return 'Parent'; // Libelle par defaut: parent.
};
</script>
