import { createRouter, createWebHistory } from 'vue-router'; // Importe le router Vue et l'historique HTML5.
import DashboardPage from '../pages/DashboardPage.vue'; // Vue Dashboard.
import FinancePage from '../pages/FinancePage.vue'; // Vue Finances.
import AttendancePage from '../pages/AttendancePage.vue'; // Vue Absences/Présence.
import GradesPage from '../pages/GradesPage.vue'; // Vue Notes.
import TimetablePage from '../pages/TimetablePage.vue'; // Vue Emplois du temps.
import PaymentsPage from '../pages/PaymentsPage.vue'; // Vue Paiements.
import NotificationsPage from '../pages/NotificationsPage.vue'; // Vue Notifications.
import CorrespondencePage from '../pages/CorrespondencePage.vue'; // Vue Correspondance.

const router = createRouter({
  history: createWebHistory(), // Utilise l'historique navigateur standard (URLs propres).
  routes: [
    { path: '/', name: 'dashboard', component: DashboardPage }, // Route Dashboard.
    { path: '/finances', name: 'finances', component: FinancePage }, // Route Finances.
    { path: '/absences', name: 'absences', component: AttendancePage }, // Route Absences.
    { path: '/notes', name: 'notes', component: GradesPage }, // Route Notes.
    { path: '/timetable', name: 'timetable', component: TimetablePage }, // Route Emplois du temps.
    { path: '/payments', name: 'payments', component: PaymentsPage }, // Route Paiements.
    { path: '/notifications', name: 'notifications', component: NotificationsPage }, // Route Notifications.
    { path: '/correspondence', name: 'correspondence', component: CorrespondencePage }, // Route Correspondance.
  ],
});

export default router; // Exporte le router configuré.
