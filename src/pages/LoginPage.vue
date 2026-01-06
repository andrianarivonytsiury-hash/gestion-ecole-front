<template>
  <div class="min-h-screen bg-surface text-ink flex items-center justify-center relative overflow-hidden">
    <div class="auth-glow" aria-hidden="true"></div>
    <div class="auth-orb auth-orb-primary" aria-hidden="true"></div>
    <div class="auth-orb auth-orb-secondary" aria-hidden="true"></div>

    <div class="relative z-10 w-full max-w-6xl px-4 py-10">
      <div class="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section class="space-y-6 text-ink">
          <div class="flex items-center gap-3 reveal">
            <span class="h-12 w-12 rounded-2xl bg-primary text-white grid place-items-center font-semibold">E</span>
            <div>
              <p class="text-xs uppercase text-muted">Plateforme</p>
              <p class="text-xl font-semibold text-ink">Gestion d'ecole</p>
            </div>
          </div>
          <div class="space-y-3 reveal delay-1">
            <h1 class="text-3xl md:text-4xl font-semibold leading-tight">Connexion rapide, suivi en temps reel.</h1>
            <p class="text-muted max-w-xl">
              Accedez aux absences, notes et finances en un seul tableau de bord.
              Une interface claire pour les equipes educatives.
            </p>
          </div>
          <div class="grid gap-4 sm:grid-cols-2 reveal delay-2">
            <div class="card bg-white/80 backdrop-blur border border-white/70">
              <p class="eyebrow">Vue temps reel</p>
              <p class="text-lg font-semibold text-ink">Absences + alertes</p>
              <p class="hint">Suivi des presences en continu.</p>
            </div>
            <div class="card bg-white/80 backdrop-blur border border-white/70">
              <p class="eyebrow">Pilotage</p>
              <p class="text-lg font-semibold text-ink">Finances clarifiees</p>
              <p class="hint">Flux par periode et par eleve.</p>
            </div>
          </div>
        </section>

        <section class="reveal delay-3">
          <div class="rounded-3xl bg-white/95 border border-slate-100 shadow-xl p-6 sm:p-8">
            <div class="space-y-2">
              <p class="text-sm uppercase text-muted tracking-wide">Espace securise</p>
              <h2 class="text-2xl font-semibold text-ink">Se connecter</h2>
              <p class="text-sm text-muted">Utilisez vos identifiants de l'etablissement.</p>
            </div>
            <form class="mt-6 space-y-4" @submit.prevent="handleLogin">
              <div class="space-y-2">
                <label class="text-sm font-medium text-ink" for="email">Email</label>
                <input
                  id="email"
                  v-model.trim="email"
                  type="email"
                  autocomplete="email"
                  required
                  placeholder="nom@ecole.fr"
                  class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-ink" for="password">Mot de passe</label>
                <input
                  id="password"
                  v-model.trim="password"
                  type="password"
                  autocomplete="current-password"
                  required
                  placeholder="********"
                  class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div class="flex items-center justify-between gap-4 text-sm">
                <label class="flex items-center gap-2 text-muted">
                  <input v-model="remember" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/30" />
                  Se souvenir de moi
                </label>
                <button type="button" class="link">Mot de passe oublie</button>
              </div>
              <p v-if="error" class="text-sm text-red-600" role="alert">{{ error }}</p>
              <button class="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70" type="submit" :disabled="loading">
                <span v-if="loading">Connexion...</span>
                <span v-else>Se connecter</span>
              </button>
            </form>
            <p class="mt-6 text-xs text-muted">
              Besoin d'un acces ? Contactez l'administration pour activer votre compte.
            </p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useDemoStore, type Role } from "../stores/demo";

interface LoginResponse {
  accessToken?: string;
  user?: { role?: Role };
}

const router = useRouter();
const store = useDemoStore();

const email = ref("");
const password = ref("");
const remember = ref(true);
const loading = ref(false);
const error = ref("");

const handleLogin = async () => {
  error.value = "";
  loading.value = true;
  try {
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const res = await fetch(`${apiBase}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.value, password: password.value }),
    });
    if (!res.ok) {
      const message = res.status === 401 ? "Identifiants invalides." : `Erreur connexion (${res.status}).`;
      throw new Error(message);
    }
    const data = (await res.json()) as LoginResponse;
    if (data.accessToken) {
      if (remember.value) {
        localStorage.setItem("auth_token", data.accessToken);
      } else {
        sessionStorage.setItem("auth_token", data.accessToken);
      }
    }
    if (data.user?.role) {
      store.setRole(data.user.role);
    }
    await router.push({ name: "dashboard" });
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Erreur connexion.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(600px circle at 15% 20%, rgba(15, 118, 110, 0.12), transparent 60%),
    radial-gradient(520px circle at 80% 10%, rgba(30, 58, 138, 0.12), transparent 55%),
    radial-gradient(700px circle at 70% 85%, rgba(245, 158, 11, 0.14), transparent 60%);
  pointer-events: none;
}

.auth-orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(40px);
  opacity: 0.7;
  pointer-events: none;
}

.auth-orb-primary {
  width: 280px;
  height: 280px;
  top: -120px;
  right: -80px;
  background: rgba(15, 118, 110, 0.35);
}

.auth-orb-secondary {
  width: 320px;
  height: 320px;
  bottom: -160px;
  left: -140px;
  background: rgba(30, 58, 138, 0.25);
}

.reveal {
  animation: fadeUp 0.6s ease-out both;
}

.delay-1 {
  animation-delay: 0.08s;
}

.delay-2 {
  animation-delay: 0.16s;
}

.delay-3 {
  animation-delay: 0.24s;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
