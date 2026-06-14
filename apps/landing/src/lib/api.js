import axios from "axios";
export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 15_000,
    headers: { "Content-Type": "application/json" },
});
const get = (url, params) => apiClient.get(url, { params }).then((r) => r.data);
export const publicApi = {
    villes: () => get("/public/villes"),
    stats: () => get("/public/stats"),
    health: () => get("/public/health"),
};
export const voyagesApi = {
    popular: () => get("/voyages/popular"),
    search: (params) => get("/public/voyages/search", params),
};
export const colisApi = {
    publicTrack: (reference) => get(`/public/colis/${reference.toUpperCase()}`),
};
export const chauffeurApi = {
    submitDemande: (data) => apiClient
        .post("/public/demandes-chauffeur", data)
        .then((r) => r.data),
};
