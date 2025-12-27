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
  end: string;
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
      } catch (err) {
        this.financeError = err instanceof Error ? err.message : 'Erreur finance';
        this.finances = [];
      } finally {
        this.financesLoading = false;
      }
    },
    async fetchAttendance(apiBase: string = API_BASE) {
      try {
        const res = await fetch(`${apiBase}/attendance`);
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = (await res.json()) as Array<Partial<AttendanceRecord> & { student?: { firstName?: string; lastName?: string; id?: number } }>;
        this.attendance = data.map((item, idx) => {
          const studentName = item.student
            ? `${item.student.firstName ?? ''} ${item.student.lastName ?? ''}`.trim()
            : item.student ?? '';
          return {
            id: item.id ?? idx,
            student: studentName || `Etudiant ${item.studentId ?? idx}`,
            studentId: item.studentId ?? item.student?.id,
            courseId: Number(item.courseId) || 0,
            status: item.status ?? 'present',
            motif: item.motif ?? '',
          };
        });
      } catch (err) {
        this.attendance = [];
      }
    },
    async addAttendance(payload: { courseId: number; studentId: number; status: string; motif?: string; student?: string }, apiBase: string = API_BASE) {
      await fetch(`${apiBase}/attendance/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: payload.courseId, records: [payload] }),
      });
      await this.fetchAttendance(apiBase);
    },
    async fetchCourses(apiBase: string = API_BASE) {
      try {
        const res = await fetch(`${apiBase}/timetable`);
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = (await res.json()) as Array<Partial<CourseRecord> & { course?: { subject?: string }; class?: { label?: string } } & { start?: string; end?: string; room?: string; status?: string }>;
        this.courses = data.map((item, idx) => ({
          id: item.id ?? idx,
          class: item.class?.label ?? item.class ?? 'Classe',
          label: item.course?.subject ?? item.label ?? 'Cours',
          start: item.start ? new Date(item.start).toISOString().slice(11, 16) : '',
          end: item.end ? new Date(item.end).toISOString().slice(11, 16) : '',
          room: item.room ?? 'Salle',
          status: item.status ?? 'prevu',
        }));
      } catch (err) {
        this.courses = [];
      }
    },
    async fetchGrades(apiBase: string = API_BASE) {
      try {
        const res = await fetch(`${apiBase}/grades`);
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = (await res.json()) as Array<Partial<GradeRecord> & { student?: { firstName?: string; lastName?: string }; course?: { subject?: string } }>;
        this.grades = data.map((item, idx) => ({
          id: item.id ?? idx,
          student: item.student ? `${item.student.firstName ?? ''} ${item.student.lastName ?? ''}`.trim() : item.student ?? 'Etudiant',
          valeur: Number(item.valeur) || 0,
          typeEval: item.typeEval ?? 'Evaluation',
          coeff: Number(item.coeff) || 1,
          courseId: Number(item.courseId) || 0,
        }));
      } catch (err) {
        this.grades = [];
      }
    },
    async fetchPayments(apiBase: string = API_BASE) {
      try {
        const res = await fetch(`${apiBase}/payments`);
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = (await res.json()) as Array<Partial<PaymentRecord> & { student?: { firstName?: string; lastName?: string } }>;
        this.payments = data.map((item, idx) => ({
          id: item.id ?? idx,
          student: item.student ? `${item.student.firstName ?? ''} ${item.student.lastName ?? ''}`.trim() : item.student ?? 'Etudiant',
          amount: Number(item.amount) || 0,
          status: item.status ?? 'succeeded',
        }));
      } catch (err) {
        this.payments = [];
      }
    },
    async createPayment(payload: { studentId: number; amount: number; currency?: string; method?: string }, apiBase: string = API_BASE) {
      await fetch(`${apiBase}/payments/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      await this.fetchPayments(apiBase);
    },
    async fetchNotifications(apiBase: string = API_BASE) {
      try {
        const res = await fetch(`${apiBase}/notifications`);
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = (await res.json()) as Array<Partial<NotificationRecord> & { payload?: any }>;
        this.notifications = data.map((item, idx) => ({
          id: item.id ?? idx,
          title: item.payload?.title ?? item.title ?? (item as any).type ?? 'Notification',
          message: item.payload?.message ?? item.message ?? '',
          channel: item.channel ?? 'email',
        }));
      } catch (err) {
        this.notifications = [];
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
      } catch (err) {
        this.correspondence = [];
      }
    },
    async addCorrespondence(payload: { studentId: number; fromRole: string; message: string }, apiBase: string = API_BASE) {
      await fetch(`${apiBase}/correspondence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      await this.fetchCorrespondence(apiBase);
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
      } catch (err) {
        this.holidays = [];
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
