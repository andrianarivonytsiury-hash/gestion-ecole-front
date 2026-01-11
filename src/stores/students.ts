import { defineStore } from "pinia";
import { apiJson, apiRequest } from "../api/http";

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

export interface GradeRecord {
  id: number;
  student: string;
  studentId?: number;
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

export interface CorrespondenceRecord {
  id: number;
  fromRole: string;
  message: string;
  createdAt: string;
  studentId: number;
}

export interface StudentRecord {
  id: number;
  matricule: string;
  firstName: string;
  lastName: string;
  class?: { id?: number; label?: string };
}

export interface StudentDetail {
  student: StudentRecord & { guardians?: { id: number; email?: string; phone?: string }[] };
  attendance: AttendanceRecord[];
  payments: PaymentRecord[];
  grades: GradeRecord[];
  correspondence: CorrespondenceRecord[];
  finance: FinanceFlow[];
}

export interface StudentCreatePayload {
  matricule: string;
  firstName: string;
  lastName: string;
  classId: number;
  guardianIds?: number[];
}

export interface StudentUpdatePayload {
  id: number;
  matricule?: string;
  firstName?: string;
  lastName?: string;
  classId?: number;
  guardianIds?: number[];
}

export const useStudentsStore = defineStore("students", {
  state: () => ({
    students: [] as StudentRecord[],
    studentDetails: {} as Record<number, StudentDetail>,
    studentsLoading: false,
    studentsError: "",
  }),
  actions: {
    async fetchStudents() {
      this.studentsLoading = true;
      this.studentsError = "";
      try {
        const data = await apiRequest<Array<any>>("/students");
        this.students = data.map((s, idx) => ({
          id: s.id ?? idx,
          matricule: s.matricule ?? "",
          firstName: s.firstName ?? "",
          lastName: s.lastName ?? "",
          class: s.class,
        }));
      } catch (err) {
        this.studentsError = err instanceof Error ? err.message : "Erreur students";
        this.students = [];
      } finally {
        this.studentsLoading = false;
      }
    },
    async fetchStudentDetails(id: number) {
      const data = await apiRequest<any>(`/students/${id}/details`);
      const detail: StudentDetail = {
        student: {
          id: data.id,
          matricule: data.matricule,
          firstName: data.firstName,
          lastName: data.lastName,
          class: data.class,
          guardians: data.guardians,
        },
        attendance: (data.attendance || []).map((a: any, idx: number) => ({
          id: a.id ?? idx,
          student: `${data.firstName} ${data.lastName}`,
          studentId: a.studentId,
          courseId: a.courseId,
          status: a.status,
          motif: a.motif,
        })),
        payments: (data.payments || []).map((p: any, idx: number) => ({
          id: p.id ?? idx,
          student: `${data.firstName} ${data.lastName}`,
          amount: Number(p.amount) || 0,
          status: p.status ?? "",
        })),
        grades: (data.grades || []).map((g: any, idx: number) => ({
          id: g.id ?? idx,
          student: `${data.firstName} ${data.lastName}`,
          valeur: Number(g.valeur) || 0,
          typeEval: g.typeEval ?? "",
          coeff: Number(g.coeff) || 1,
          courseId: g.courseId ?? 0,
        })),
        correspondence: (data.correspondence || []).map((c: any, idx: number) => ({
          id: c.id ?? idx,
          fromRole: c.fromRole ?? "",
          message: c.message ?? "",
          createdAt: c.createdAt ?? "",
          studentId: c.studentId ?? id,
        })),
        finance: (data.finance || []).map((f: any, idx: number) => ({
          id: f.id ?? idx,
          date: f.date?.slice(0, 10) ?? "",
          reference: f.reference ?? "",
          libelle: f.libelle ?? "",
          debit: Number(f.debit) || 0,
          credit: Number(f.credit) || 0,
          solde: Number(f.solde) || 0,
          studentId: f.studentId,
          moyen: f.moyen,
          statut: f.statut,
        })),
      };
      this.studentDetails[id] = detail;
      return detail;
    },
    async addStudent(payload: StudentCreatePayload) {
      await apiJson("POST", "/students", payload);
      await this.fetchStudents();
    },
    async updateStudent(payload: StudentUpdatePayload) {
      const { id, ...update } = payload;
      await apiJson("PUT", `/students/${id}`, update);
      await this.fetchStudents();
      if (id && this.studentDetails[id]) {
        await this.fetchStudentDetails(id);
      }
    },
    async deleteStudent(id: number) {
      await apiJson("DELETE", `/students/${id}`);
      await this.fetchStudents();
      delete this.studentDetails[id];
    },
  },
});
