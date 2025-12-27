import { defineStore } from 'pinia';

export type Role = 'admin' | 'prof' | 'parent';

export interface FinanceFlow {
  id: number;
  date: string;
  reference: string;
  libelle: string;
  debit: number;
  credit: number;
  solde: number;
  studentId?: number;
  moyen?: string;
  statut?: string;
}

const financeSeed: FinanceFlow[] = [
  { id: 1, date: '2025-01-05', reference: 'FAC-2025-001', libelle: 'Ecolage Janvier - Lina', debit: 0, credit: 200, solde: 200 },
  { id: 2, date: '2025-01-06', reference: 'DEP-001', libelle: 'Fournitures labo', debit: 50, credit: 0, solde: 150 },
  { id: 3, date: '2025-01-08', reference: 'FAC-2025-002', libelle: 'Ecolage Janvier - Noah', debit: 0, credit: 200, solde: 350 },
  { id: 4, date: '2025-02-02', reference: 'FAC-2025-003', libelle: 'Ecolage Fevrier - Lina', debit: 0, credit: 200, solde: 550 },
  { id: 5, date: '2025-02-04', reference: 'DEP-002', libelle: 'Maintenance reseau', debit: 80, credit: 0, solde: 470 },
];

export const useDemoStore = defineStore('demo', {
  state: () => ({
    role: 'admin' as Role,
    apiMessage: '',
    financeError: '',
    financesLoading: false,
    finances: [] as FinanceFlow[],
    attendance: [
      { id: 1, student: 'Lina Rakoto', courseId: 1, status: 'present', motif: '' },
      { id: 2, student: 'Noah Randrian', courseId: 1, status: 'retard', motif: 'Transport' },
      { id: 3, student: 'Sarina Andry', courseId: 2, status: 'absent', motif: 'Malade' },
    ],
    courses: [
      { id: 1, class: '6eme A', label: 'Mathematiques - Algebre', start: '08:00', room: 'Salle 101', status: 'prevu' },
      { id: 2, class: 'Terminale S', label: 'Physique - Optique', start: '10:30', room: 'Lab 1', status: 'prevu' },
      { id: 3, class: '6eme A', label: 'Anglais - Conversation', start: '14:00', room: 'Salle 202', status: 'prevu' },
    ],
    grades: [
      { id: 1, student: 'Lina Rakoto', valeur: 15, typeEval: 'Devoir', coeff: 1 },
      { id: 2, student: 'Noah Randrian', valeur: 12, typeEval: 'Interro', coeff: 1 },
      { id: 3, student: 'Sarina Andry', valeur: 17, typeEval: 'Projet', coeff: 2 },
    ],
    payments: [
      { id: 1, student: 'Lina Rakoto', amount: 200, status: 'succeeded' },
      { id: 2, student: 'Noah Randrian', amount: 200, status: 'requires_action' },
    ],
    notifications: [
      { id: 1, title: 'Absence Sarina', message: 'Parent notifie par email', channel: 'email' },
      { id: 2, title: 'Retard Noah', message: 'SMS envoye (5 min de retard)', channel: 'sms' },
      { id: 3, title: 'Ecolage Lina', message: 'Lien de paiement Stripe', channel: 'email' },
    ],
    correspondence: [
      { id: 1, fromRole: 'parent', createdAt: '2025-01-07', message: 'Absence prevue le 10/01 pour rendez-vous.' },
      { id: 2, fromRole: 'prof', createdAt: '2025-01-08', message: 'Controle lundi, merci de signer le carnet.' },
    ],
    holidays: [
      { id: 1, label: 'Vacances de Noel', startDate: '2024-12-20', endDate: '2025-01-05', type: 'holiday' },
      { id: 2, label: 'Journee pedagogique', startDate: '2025-02-14', endDate: '2025-02-14', type: 'pause' },
    ],
  }),
  getters: {
    monthlyFinance: (state) => {
      return state.finances.reduce<Record<string, { debit: number; credit: number }>>((acc, f) => {
        const month = f.date.slice(0, 7);
        acc[month] = acc[month] || { debit: 0, credit: 0 };
        acc[month].debit += f.debit;
        acc[month].credit += f.credit;
        return acc;
      }, {});
    },
  },
  actions: {
    setRole(role: Role) {
      this.role = role;
    },
    async fetchApiMessage(apiBase?: string) {
      const base = apiBase || import.meta.env.VITE_API_URL || 'http://localhost:3000';
      try {
        const res = await fetch(base);
        this.apiMessage = res.ok ? await res.text() : `Erreur API ${res.status}`;
      } catch (err) {
        this.apiMessage = 'API indisponible';
      }
    },
    async fetchFinances(apiBase?: string) {
      const base = apiBase || import.meta.env.VITE_API_URL || 'http://localhost:3000';
      this.financesLoading = true;
      this.financeError = '';
      try {
        const res = await fetch(`${base}/finance/flows`);
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = (await res.json()) as Partial<FinanceFlow>[];
        this.finances = data.map((item, idx) => ({
          id: item.id ?? idx,
          date: item.date ? String(item.date).slice(0, 10) : '',
          reference: item.reference ?? 'Sans ref',
          libelle: item.libelle ?? '',
          debit: Number(item.debit) || 0,
          credit: Number(item.credit) || 0,
          solde: Number(item.solde) || 0,
          studentId: item.studentId,
          moyen: item.moyen,
          statut: item.statut,
        }));
        if (!this.finances.length) this.finances = financeSeed;
      } catch (err) {
        this.financeError = err instanceof Error ? err.message : 'Erreur finance';
        if (!this.finances.length) this.finances = financeSeed;
      } finally {
        this.financesLoading = false;
      }
    },
  },
});
