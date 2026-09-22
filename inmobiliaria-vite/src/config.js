// Unica fuente de la URL de la API. Su valor viene de la variable VITE_BASE_URL, que se fija al compilar
// (ver .env.example en local y las variables del workflow en GitHub). Nunca pongas secretos aqui: todo lo
// que empieza por VITE_ queda visible en el navegador.
export const API_URL = import.meta.env.VITE_BASE_URL;
