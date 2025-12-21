import { defineStore } from 'pinia'; // Import de l'API Pinia pour créer un store.

// Typage des rôles utilisés dans la démo.
export type Role = 'admin' | 'prof' | 'parent';

// Store principal de démo avec données mock et un exemple d'appel backend.
export const useDemoStore = defineStore('demo', {
  // Etat initial du store.
  state: () => ({
    role: 'admin' as Role, // Rôle courant sélectionné.
    apiMessage: '', // Message récupéré depuis le backend (liaison front/back).
    finances: [
      { id: 1, date: '2025-01-05', reference: 'FAC-2025-001', libelle: 'Ecolage Janvier - Lina', debit: 0, credit: 200, solde: 200 }, // Flux crédité.
      { id: 2, date: '2025-01-06', reference: 'DEP-001', libelle: 'Fournitures labo', debit: 50, credit: 0, solde: 150 }, // Flux débité.
      { id: 3, date: '2025-01-08', reference: 'FAC-2025-002', libelle: 'Ecolage Janvier - Noah', debit: 0, credit: 200, solde: 350 }, // Flux crédité.
      { id: 4, date: '2025-02-02', reference: 'FAC-2025-003', libelle: 'Ecolage Fevrier - Lina', debit: 0, credit: 200, solde: 550 }, // Flux crédité.
      { id: 5, date: '2025-02-04', reference: 'DEP-002', libelle: 'Maintenance reseau', debit: 80, credit: 0, solde: 470 }, // Flux débité.
    ],
    attendance: [
      { id: 1, student: 'Lina Rakoto', courseId: 1, status: 'present', motif: '' }, // Présence.
      { id: 2, student: 'Noah Randrian', courseId: 1, status: 'retard', motif: 'Transport' }, // Retard.
      { id: 3, student: 'Sarina Andry', courseId: 2, status: 'absent', motif: 'Malade' }, // Absence.
    ],
    courses: [
      { id: 1, class: '6eme A', label: 'Mathematiques - Algebre', start: '08:00', room: 'Salle 101', status: 'prevu' }, // Créneau 1.
      { id: 2, class: 'Terminale S', label: 'Physique - Optique', start: '10:30', room: 'Lab 1', status: 'prevu' }, // Créneau 2.
      { id: 3, class: '6eme A', label: 'Anglais - Conversation', start: '14:00', room: 'Salle 202', status: 'prevu' }, // Créneau 3.
    ],
    grades: [
      { id: 1, student: 'Lina Rakoto', valeur: 15, typeEval: 'Devoir', coeff: 1 }, // Note 1.
      { id: 2, student: 'Noah Randrian', valeur: 12, typeEval: 'Interro', coeff: 1 }, // Note 2.
      { id: 3, student: 'Sarina Andry', valeur: 17, typeEval: 'Projet', coeff: 2 }, // Note 3.
    ],
    payments: [
      { id: 1, student: 'Lina Rakoto', amount: 200, status: 'succeeded' }, // Paiement validé.
      { id: 2, student: 'Noah Randrian', amount: 200, status: 'requires_action' }, // Paiement à finaliser.
    ],
    notifications: [
      { id: 1, title: 'Absence Sarina', message: 'Parent notifie par email', channel: 'email' }, // Notification 1.
      { id: 2, title: 'Retard Noah', message: 'SMS envoye (5 min de retard)', channel: 'sms' }, // Notification 2.
      { id: 3, title: 'Ecolage Lina', message: 'Lien de paiement Stripe', channel: 'email' }, // Notification 3.
    ],
    correspondence: [
      { id: 1, fromRole: 'parent', createdAt: '2025-01-07', message: 'Absence prevue le 10/01 pour rendez-vous.' }, // Message 1.
      { id: 2, fromRole: 'prof', createdAt: '2025-01-08', message: 'Controle lundi, merci de signer le carnet.' }, // Message 2.
    ],
    holidays: [
      { id: 1, label: 'Vacances de Noel', startDate: '2024-12-20', endDate: '2025-01-05', type: 'holiday' }, // Période 1.
      { id: 2, label: 'Journee pedagogique', startDate: '2025-02-14', endDate: '2025-02-14', type: 'pause' }, // Période 2.
    ],
  }),
  // Getters calculés à partir de l'état.
  getters: {
    monthlyFinance: (state) => {
      return state.finances.reduce<Record<string, { debit: number; credit: number }>>((acc, f) => {
        const month = f.date.slice(0, 7); // Récupère AAAA-MM.
        acc[month] = acc[month] || { debit: 0, credit: 0 }; // Initialise si absent.
        acc[month].debit += f.debit; // Cumule le débit du mois.
        acc[month].credit += f.credit; // Cumule le crédit du mois.
        return acc; // Retourne l'accumulateur.
      }, {});
    },
  },
  // Actions qui mutent l'état ou appellent le backend.
  actions: {
    setRole(role: Role) {
      this.role = role; // Met à jour le rôle courant.
    },
    async fetchApiMessage(apiBase?: string) {
      const base = apiBase || import.meta.env.VITE_API_URL || 'http://localhost:3000'; // Base API (env ou défaut).
      try {
        const res = await fetch(base); // Appelle le backend (GET /).
        this.apiMessage = res.ok ? await res.text() : `Erreur API ${res.status}`; // Stocke la réponse texte ou l'erreur.
      } catch (err) {
        this.apiMessage = 'API indisponible'; // Message en cas d'échec réseau.
      }
    },
  },
});
