<template>
  <div class="space-y-6">
    <div class="section-head">
      <div>
        <p class="eyebrow">Notifications</p>
        <h1 class="text-2xl font-semibold text-ink">Parents & utilisateurs</h1>
      </div>
      <button class="btn-primary">Envoyer</button>
    </div>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div v-for="notif in store.notifications" :key="notif.id" class="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-2">
        <div class="flex items-center justify-between">
          <p class="font-semibold text-ink">{{ notif.title }}</p>
          <span class="pill bg-ink/10 text-ink">{{ notif.channel }}</span>
        </div>
        <p class="text-sm text-muted">{{ notif.message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDemoStore } from '../stores/demo'; // Store Pinia avec notifications mock.
const store = useDemoStore(); // Instance du store.
</script>
