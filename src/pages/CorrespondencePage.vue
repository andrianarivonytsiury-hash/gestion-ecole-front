<template>
  <div class="space-y-6">
    <div class="section-head">
      <div>
        <p class="eyebrow">Carnet de correspondance</p>
        <h1 class="text-2xl font-semibold text-ink">Parents ↔ Prof / Admin</h1>
      </div>
      <button class="btn-primary">Répondre</button>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <div v-for="message in store.correspondence" :key="message.id" class="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-2">
        <p class="text-xs text-muted">{{ message.fromRole }} · {{ message.createdAt }}</p>
        <p class="text-ink font-medium">{{ message.message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDemoStore } from '../stores/demo'; // Store Pinia avec messages mock.
const store = useDemoStore(); // Instance du store.
</script>
