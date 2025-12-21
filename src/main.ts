import { createApp } from 'vue'; // Fonction pour instancier l'application Vue.
import { createPinia } from 'pinia'; // Store global léger pour l'état partagé.
import App from './App.vue'; // Composant racine.
import router from './router'; // Router configuré (pages / navigation).
import './assets/main.scss'; // Styles globaux (Tailwind + SASS custom).

const app = createApp(App); // Crée l'instance Vue en utilisant le composant racine.

app.use(createPinia()); // Enregistre le store Pinia.
app.use(router); // Enregistre le router.
app.mount('#app'); // Monte l'app sur l'élément #app du DOM.
