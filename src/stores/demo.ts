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

export interface AttendanceRecord {
  id: number;
  student: string;
  studentId?: number;
  courseId: number;
  status: string;
  motif?: string;
}

export interface CourseRecord {
  id: number;
  class: string;
  label: string;
  start: string;
  room: string;
  status: string;
}

export interface GradeRecord {
  id: number;
  student: string;
  valeur: number;
  typeEval: string;
  coeff: number;
  courseId: number;
}

export interface PaymentRecord {
  id: number;
  student: string;
  amount: number;
  status: string;
}

export interface NotificationRecord {
  id: number;
  title: string;
  message: string;
  channel: string;
}

export interface CorrespondenceRecord {
  id: number;
  fromRole: string;
  message: string;
  createdAt: string;
  studentId: number;
}

export interface HolidayRecord {
  id: number;
  label: string;
  startDate: string;
  endDate: string;
  type: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const financeSeed: FinanceFlow[] = [
  { id: 1, date: '2025-01-05', reference: 'FAC-2025-001', libelle: 'Ecolage Janvier - Lina', debit: 0, credit: 200, solde: 200 },
  { id: 2, date: '2025-01-06', reference: 'DEP-001', libelle: 'Fournitures labo', debit: 50, credit: 0, solde: 150 },
  { id: 3, date: '2025-01-08', reference: 'FAC-2025-002', libelle: 'Ecolage Janvier - Noah', debit: 0, credit: 200, solde: 350 },
  { id: 4, date: '2025-02-02', reference: 'FAC-2025-003', libelle: 'Ecolage Fevrier - Lina', debit: 0, credit: 200, solde: 550 },
  { id: 5, date: '2025-02-04', reference: 'DEP-002', libelle: 'Maintenance reseau', debit: 80, credit: 0, solde: 470 },
];

const attendanceSeed: AttendanceRecord[] = [
  { id: 1, studentId: 1, student: 'Lina Rakoto', courseId: 1, status: 'present', motif: '' },
  { id: 2, studentId: 2, student: 'Noah Randrian', courseId: 1, status: 'retard', motif: 'Transport' },
  { id: 3, studentId: 3, student: 'Sarina Andry', courseId: 2, status: 'absent', motif: 'Malade' },
];

const coursesSeed: CourseRecord[] = [
  { id: 1, class: '6eme A', label: 'Mathematiques - Algebre', start: '08:00', room: 'Salle 101', status: 'prevu' },
  { id: 2, class: 'Terminale S', label: 'Physique - Optique', start: '10:30', room: 'Lab 1', status: 'prevu' },
  { id: 3, class: '6eme A', label: 'Anglais - Conversation', start: '14:00', room: 'Salle 202', status: 'prevu' },
];

const gradesSeed: GradeRecord[] = [
  { id: 1, student: 'Lina Rakoto', valeur: 15, typeEval: 'Devoir', coeff: 1, courseId: 1 },
  { id: 2, student: 'Noah Randrian', valeur: 12, typeEval: 'Interro', coeff: 1, courseId: 1 },
  { id: 3, student: 'Sarina Andry', valeur: 17, typeEval: 'Projet', coeff: 2, courseId: 2 },
];

const paymentsSeed: PaymentRecord[] = [
  { id: 1, student: 'Lina Rakoto', amount: 200, status: 'succeeded' },
  { id: 2, student: 'Noah Randrian', amount: 200, status: 'requires_action' },
];

const notificationsSeed: NotificationRecord[] = [
  { id: 1, title: 'Absence Sarina', message: 'Parent notifie par email', channel: 'email' },
  { id: 2, title: 'Retard Noah', message: 'SMS envoye (5 min de retard)', channel: 'sms' },
  { id: 3, title: 'Ecolage Lina', message: 'Lien de paiement Stripe', channel: 'email' },
];

const correspondenceSeed: CorrespondenceRecord[] = [
  { id: 1, fromRole: 'parent', createdAt: '2025-01-07', message: 'Absence prevue le 10/01 pour rendez-vous.', studentId: 1 },
  { id: 2, fromRole: 'prof', createdAt: '2025-01-08', message: 'Controle lundi, merci de signer le carnet.', studentId: 2 },
];

const holidaysSeed: HolidayRecord[] = [
  { id: 1, label: 'Vacances de Noel', startDate: '2024-12-20', endDate: '2025-01-05', type: 'holiday' },
  { id: 2, label: 'Journee pedagogique', startDate: '2025-02-14', endDate: '2025-02-14', type: 'pause' },
];

export const useDemoStore = defineStore('demo', {
  state: () => ({
    role: 'admin' as Role,
    apiMessage: '',
    financeError: '',
    financesLoading: false,
    finances: [] as FinanceFlow[],
    attendance: [] as AttendanceRecord[],
    courses: [] as CourseRecord[],
    grades: [] as GradeRecord[],
    payments: [] as PaymentRecord[],
    notifications: [] as NotificationRecord[],
    correspondence: [] as CorrespondenceRecord[],
    holidays: [] as HolidayRecord[],
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
    async fetchApiMessage(apiBase: string = API_BASE) {
      try {
        const res = await fetch(apiBase);
        this.apiMessage = res.ok ? await res.text() : `Erreur API ${res.status}`;
      } catch (err) {
        this.apiMessage = 'API indisponible';
      }
    },
    async fetchFinances(apiBase: string = API_BASE) {
      this.financesLoading = true;
      this.financeError = '';
      try {
        const res = await fetch(`${apiBase}/finance/flows`);
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
    async fetchAttendance(apiBase: string = API_BASE) {
      try {
        const res = await fetch(`${apiBase}/attendance`);
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = (await res.json()) as Partial<AttendanceRecord>[];
        this.attendance = data.map((item, idx) => ({
          id: item.id ?? idx,
          student: item.student ?? `Etudiant ${item.studentId ?? idx}`,
          courseId: Number(item.courseId) || 0,
          status: item.status ?? 'present',
          motif: item.motif ?? '',
        }));
        if (!this.attendance.length) this.attendance = attendanceSeed;
      } catch (err) {
        if (!this.attendance.length) this.attendance = attendanceSeed;
      }
    },
    async fetchCourses(apiBase: string = API_BASE) {
      try {
        const res = await fetch(`${apiBase}/courses`);
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = (await res.json()) as Partial<CourseRecord>[];
        this.courses = data.map((item, idx) => ({
          id: item.id ?? idx,
          class: item.class ?? 'Classe',
          label: item.label ?? 'Cours',
          start: item.start ?? '',
          room: item.room ?? '',
          status: item.status ?? 'prevu',
        }));
        if (!this.courses.length) this.courses = coursesSeed;
      } catch (err) {
        if (!this.courses.length) this.courses = coursesSeed;
      }
    },
    async fetchGrades(apiBase: string = API_BASE) {
      try {
        const res = await fetch(`${apiBase}/grades`);
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = (await res.json()) as Partial<GradeRecord>[];
        this.grades = data.map((item, idx) => ({
          id: item.id ?? idx,
          student: item.student ?? `Etudiant ${item.courseId ?? ''}`,
          valeur: Number(item.valeur) || 0,
          typeEval: item.typeEval ?? 'Evaluation',
          coeff: Number(item.coeff) || 1,
          courseId: Number(item.courseId) || 0,
        }));
        if (!this.grades.length) this.grades = gradesSeed;
      } catch (err) {
        if (!this.grades.length) this.grades = gradesSeed;
      }
    },
    async fetchPayments(apiBase: string = API_BASE) {
      try {
        const res = await fetch(`${apiBase}/payments`);
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = (await res.json()) as Partial<PaymentRecord>[];
        this.payments = data.map((item, idx) => ({
          id: item.id ?? idx,
          student: item.student ?? 'Etudiant',
          amount: Number(item.amount) || 0,
          status: item.status ?? 'succeeded',
        }));
        if (!this.payments.length) this.payments = paymentsSeed;
      } catch (err) {
        if (!this.payments.length) this.payments = paymentsSeed;
      }
    },
    async fetchNotifications(apiBase: string = API_BASE) {
      try {
        const res = await fetch(`${apiBase}/notifications`);
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = (await res.json()) as Partial<NotificationRecord>[];
        this.notifications = data.map((item, idx) => ({
          id: item.id ?? idx,
          title: item.title ?? 'Notification',
          message: item.message ?? '',
          channel: item.channel ?? 'email',
        }));
        if (!this.notifications.length) this.notifications = notificationsSeed;
      } catch (err) {
        if (!this.notifications.length) this.notifications = notificationsSeed;
      }
    },
    async fetchCorrespondence(apiBase: string = API_BASE, studentId?: number) {
      try {
        const query = studentId ? `?studentId=${studentId}` : '';
        const res = await fetch(`${apiBase}/correspondence${query}`);
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = (await res.json()) as Partial<CorrespondenceRecord>[];
        this.correspondence = data.map((item, idx) => ({
          id: item.id ?? idx,
          fromRole: item.fromRole ?? 'parent',
          message: item.message ?? '',
          createdAt: item.createdAt ?? '',
          studentId: Number(item.studentId) || 0,
        }));
        if (!this.correspondence.length) this.correspondence = correspondenceSeed;
      } catch (err) {
        if (!this.correspondence.length) this.correspondence = correspondenceSeed;
      }
    },
    async fetchHolidays(apiBase: string = API_BASE) {
      try {
        const res = await fetch(`${apiBase}/calendar/holidays`);
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = (await res.json()) as Partial<HolidayRecord>[];
        this.holidays = data.map((item, idx) => ({
          id: item.id ?? idx,
          label: item.label ?? 'Conge',
          startDate: item.startDate ?? '',
          endDate: item.endDate ?? '',
          type: item.type ?? 'holiday',
        }));
        if (!this.holidays.length) this.holidays = holidaysSeed;
      } catch (err) {
        if (!this.holidays.length) this.holidays = holidaysSeed;
      }
    },
    async bootstrap(apiBase: string = API_BASE) {
      await Promise.all([
        this.fetchFinances(apiBase),
        this.fetchAttendance(apiBase),
        this.fetchCourses(apiBase),
        this.fetchGrades(apiBase),
        this.fetchPayments(apiBase),
        this.fetchNotifications(apiBase),
        this.fetchCorrespondence(apiBase),
        this.fetchHolidays(apiBase),
      ]);
    },
  },
});
