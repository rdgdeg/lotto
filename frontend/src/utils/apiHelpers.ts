import { localDataManager } from './localDataManager';
import { migrateDataFromBackend, checkMigrationNeeded } from './dataMigration';

// Configuration pour utiliser les données locales
let isInitialized = false;

async function ensureInitialized() {
  if (!isInitialized) {
    const needsMigration = await checkMigrationNeeded();
    if (needsMigration) {
      console.log('🔄 Initialisation des données locales...');
      await migrateDataFromBackend();
    }
    isInitialized = true;
  }
}

// Fonctions utilitaires pour les appels API
export const fetchQuickStats = async (gameType: 'euromillions' | 'lotto', params?: any) => {
  await ensureInitialized();
  try {
    if (gameType === 'lotto') {
      return await localDataManager.getLotoStats(params);
    } else {
      return await localDataManager.getEuromillionsStats(params);
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération des stats pour ${gameType}:`, error);
    throw error;
  }
};

export const fetchStats = async (gameType: 'euromillions' | 'lotto') => {
  await ensureInitialized();
  try {
    if (gameType === 'lotto') {
      return await localDataManager.getLotoStats();
    } else {
      return await localDataManager.getEuromillionsStats();
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération des stats pour ${gameType}:`, error);
    throw error;
  }
};

export const fetchYears = async (gameType: 'euromillions' | 'lotto'): Promise<number[]> => {
  await ensureInitialized();
  try {
    if (gameType === 'lotto') {
      return await localDataManager.getLotoYears();
    } else {
      return await localDataManager.getEuromillionsYears();
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération des années pour ${gameType}:`, error);
    throw error;
  }
};

export const fetchDraws = async (gameType: 'euromillions' | 'lotto', params?: any) => {
  await ensureInitialized();
  try {
    // Pour l'instant, retourner les stats comme fallback
    if (gameType === 'lotto') {
      return { draws: [], pagination: { total: 0, limit: 100, offset: 0, has_more: false } };
    } else {
      return { draws: [], pagination: { total: 0, limit: 100, offset: 0, has_more: false } };
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération des tirages pour ${gameType}:`, error);
    throw error;
  }
};

export const fetchAdvancedStats = async (gameType: 'euromillions' | 'lotto') => {
  await ensureInitialized();
  try {
    if (gameType === 'lotto') {
      return await localDataManager.getLotoStats();
    } else {
      return await localDataManager.getEuromillionsStats();
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération des stats avancées pour ${gameType}:`, error);
    throw error;
  }
};

export const fetchHotColdAnalysis = async (gameType: 'euromillions' | 'lotto', recentDraws = 50) => {
  await ensureInitialized();
  try {
    if (gameType === 'lotto') {
      return await localDataManager.getLotoStats();
    } else {
      return await localDataManager.getEuromillionsStats();
    }
  } catch (error) {
    console.error(`Erreur lors de l'analyse chaud/froid pour ${gameType}:`, error);
    throw error;
  }
};

// Fonction pour forcer le rafraîchissement des données
export const forceRefresh = () => {
  // Vider le cache du navigateur pour cette page
  if (typeof window !== 'undefined') {
    // Vider le cache local
    localStorage.clear();
    sessionStorage.clear();
    
    // Forcer le rechargement sans cache
    window.location.reload();
  }
};

// Fonction pour vider le cache et recharger
export const clearCacheAndReload = () => {
  if (typeof window !== 'undefined') {
    // Vider tous les caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Vider le cache local
    localStorage.clear();
    sessionStorage.clear();
    
    // Forcer le rechargement
    window.location.reload();
  }
};

// Fonction pour vérifier la connectivité API
export const checkApiHealth = async () => {
  try {
    await ensureInitialized();
    const lotoStats = await localDataManager.getLotoStats();
    return lotoStats.total_draws > 0;
  } catch (error) {
    console.error('API non accessible:', error);
    return false;
  }
};

export default localDataManager; 