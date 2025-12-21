<template>
  <div class="space-y-6">
    <div class="section-head">
      <div>
        <p class="eyebrow">Notes</p>
        <h1 class="text-2xl font-semibold text-ink">Saisie et consultation</h1>
      </div>
      <button class="btn-primary">Ajouter une note</button>
    </div>

    <div class="panel overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead class="bg-slate-50 text-muted uppercase text-xs">
          <tr>
            <th class="cell text-left">Élève</th>
            <th class="cell text-left">Évaluation</th>
            <th class="cell text-left">Coeff</th>
            <th class="cell text-left">Note</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="grade in store.grades" :key="grade.id" class="border-t border-slate-100 hover:bg-slate-50/40">
            <td class="cell font-semibold text-ink">{{ grade.student }}</td>
            <td class="cell">{{ grade.typeEval }}</td>
            <td class="cell">{{ grade.coeff }}</td>
            <td class="cell">
              <span class="pill bg-primary/10 text-primary">{{ grade.valeur }}/20</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDemoStore } from '../stores/demo'; // Store Pinia de démo.
const store = useDemoStore(); // Instance du store.
</script>
