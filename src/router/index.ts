import { createRouter, createWebHistory } from "vue-router";
import { useDemoStore } from "../stores/demo";
import DashboardPage from "../pages/DashboardPage.vue";
import FinancePage from "../pages/FinancePage.vue";
import AttendancePage from "../pages/AttendancePage.vue";
import GradesPage from "../pages/GradesPage.vue";
import TimetablePage from "../pages/TimetablePage.vue";
import PaymentsPage from "../pages/PaymentsPage.vue";
import NotificationsPage from "../pages/NotificationsPage.vue";
import CorrespondencePage from "../pages/CorrespondencePage.vue";
import StudentDetailPage from "../pages/StudentDetailPage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "dashboard", component: DashboardPage },
    { path: "/finances", name: "finances", component: FinancePage },
    { path: "/absences", name: "absences", component: AttendancePage },
    { path: "/notes", name: "notes", component: GradesPage },
    { path: "/timetable", name: "timetable", component: TimetablePage },
    { path: "/payments", name: "payments", component: PaymentsPage },
    { path: "/notifications", name: "notifications", component: NotificationsPage },
    { path: "/correspondence", name: "correspondence", component: CorrespondencePage },
    { path: "/students/:id", name: "student-details", component: StudentDetailPage },
  ],
});

// Restriction finance pour role non admin
router.beforeEach((to, _from, next) => {
  const store = useDemoStore();
  if (to.name === "finances" && store.role !== "admin") {
    return next({ name: "dashboard" });
  }
  next();
});

export default router;
