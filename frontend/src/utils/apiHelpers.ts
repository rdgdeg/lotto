import axios from 'axios';

// Configuration de base pour axios
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter un timestamp pour éviter le cache
api.interceptors.request.use((config) => {
  // Ajouter un timestamp pour éviter le cache
  if (config.method === 'get') {
    config.params = {
      ...config.params,
      _t: Date.now(),
    };
  }
  return config;
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response?.status === 404) {
      console.error('Endpoint not found:', error.config.url);
    }
    return Promise.reject(error);
  }
);

// Fonctions utilitaires pour les appels API
export const fetchQuickStats = async (gameType: 'euromillions' | 'lotto', params?: any) => {
  try {
    const response = await api.get(`/${gameType}/quick-stats`, { params });
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des stats pour ${gameType}:`, error);
    throw error;
  }
};

export const fetchYears = async (gameType: 'euromillions' | 'lotto') => {
  try {
    const response = await api.get(`/${gameType}/years`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des années pour ${gameType}:`, error);
    throw error;
  }
};

export const fetchDraws = async (gameType: 'euromillions' | 'lotto', params?: any) => {
  try {
    const response = await api.get(`/${gameType}/`, { params });
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des tirages pour ${gameType}:`, error);
    throw error;
  }
};

export const fetchAdvancedStats = async (gameType: 'euromillions' | 'lotto') => {
  try {
    const response = await api.get(`/${gameType}/advanced/comprehensive-stats`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des stats avancées pour ${gameType}:`, error);
    throw error;
  }
};

export const fetchHotColdAnalysis = async (gameType: 'euromillions' | 'lotto', recentDraws = 50) => {
  try {
    const response = await api.get(`/${gameType}/advanced/hot-cold-analysis`, {
      params: { recent_draws: recentDraws }
    });
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de l'analyse chaud/froid pour ${gameType}:`, error);
    throw error;
  }
};

// Fonction pour forcer le rafraîchissement des données
export const forceRefresh = () => {
  // Vider le cache du navigateur pour cette page
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
};

// Fonction pour vérifier la connectivité API
export const checkApiHealth = async () => {
  try {
    const response = await api.get('/loto/');
    return response.status === 200;
  } catch (error) {
    console.error('API non accessible:', error);
    return false;
  }
};

export default api; 