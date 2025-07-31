// Gestionnaire de données local - Remplace le backend
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface DrawLoto {
  id?: number;
  date: string;
  n1: number;
  n2: number;
  n3: number;
  n4: number;
  n5: number;
  n6: number;
  complementaire: number;
}

interface DrawEuromillions {
  id?: number;
  date: string;
  n1: number;
  n2: number;
  n3: number;
  n4: number;
  n5: number;
  e1: number;
  e2: number;
}

interface NumberStat {
  numero: number;
  count: number;
  percentage: number;
}

interface LotoStats {
  total_draws: number;
  numbers: NumberStat[];
  complementaires?: NumberStat[]; // Optionnel car on ne l'utilise pas
  average_sum?: number;
  median_sum?: number;
  recent_draws?: any[];
  recent_date_range?: any;
  last_updated?: string;
  error?: string;
}

interface EuromillionsStats {
  total_draws: number;
  numbers: NumberStat[];
  stars: NumberStat[];
  date_range?: any;
  recent_draws?: any[];
  error?: string;
}

// Types pour les cas d'erreur
type LotoStatsResult = LotoStats | { total_draws: number; error: string; numbers: NumberStat[]; complementaires: NumberStat[] };
type EuromillionsStatsResult = EuromillionsStats | { total_draws: number; error: string; numbers: NumberStat[]; stars: NumberStat[] };

interface LottoDB extends DBSchema {
  draws_loto: {
    key: number;
    value: DrawLoto;
    indexes: { 'by-date': string };
  };
  draws_euromillions: {
    key: number;
    value: DrawEuromillions;
    indexes: { 'by-date': string };
  };
}

class LocalDataManager {
  private db: IDBPDatabase<LottoDB> | null = null;

  async initDB() {
    if (this.db) return this.db;
    
    this.db = await openDB<LottoDB>('lotto-db', 1, {
      upgrade(db) {
        // Table Loto
        const lotoStore = db.createObjectStore('draws_loto', { keyPath: 'id', autoIncrement: true });
        lotoStore.createIndex('by-date', 'date');
        
        // Table Euromillions
        const euromillionsStore = db.createObjectStore('draws_euromillions', { keyPath: 'id', autoIncrement: true });
        euromillionsStore.createIndex('by-date', 'date');
      },
    });
    
    return this.db;
  }

      // Méthodes pour Loto
  async getLotoStats(params?: any): Promise<LotoStatsResult> {
    const db = await this.initDB();
    let draws = await db.getAll('draws_loto');
    
    // Appliquer les filtres si fournis
    if (params) {
      draws = this.filterLotoDraws(draws, params);
    }
    
    if (draws.length === 0) {
      return { 
        total_draws: 0, 
        error: "Aucune donnée disponible",
        numbers: [],
        complementaires: []
      };
    }

    // Calculer les statistiques (seulement les 6 numéros principaux)
    const numeros: number[] = [];
    
    draws.forEach(draw => {
      numeros.push(draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6);
    });

    const numerosFreq = this.calculateFrequency(numeros);

    // Créer la structure attendue par le composant
    const numbers = Array.from({ length: 45 }, (_, i) => {
      const num = i + 1;
      const count = numerosFreq[num] || 0;
      const total = Object.values(numerosFreq).reduce((a, b) => a + b, 0);
      return {
        numero: num,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      };
    });

    return {
      total_draws: draws.length,
      numbers,
      complementaires: [], // Pas de complémentaires pour le Lotto
      average_sum: this.calculateAverageSum(draws),
      median_sum: this.calculateMedianSum(draws),
      recent_draws: this.getRecentDraws(draws, 30),
      recent_date_range: this.getDateRange(draws.slice(0, 30)),
      last_updated: new Date().toISOString()
    };
  }

  async getLotoYears(): Promise<number[]> {
    const db = await this.initDB();
    const draws = await db.getAll('draws_loto');
    
    const years = [...new Set(draws.map(draw => new Date(draw.date).getFullYear()))];
    return years.sort((a, b) => b - a);
  }

      // Méthodes pour Euromillions
  async getEuromillionsStats(params?: any): Promise<EuromillionsStatsResult> {
    const db = await this.initDB();
    let draws = await db.getAll('draws_euromillions');
    
    // Appliquer les filtres si fournis
    if (params) {
      draws = this.filterEuromillionsDraws(draws, params);
    }
    
    if (draws.length === 0) {
      return { 
        total_draws: 0, 
        error: "Aucune donnée disponible",
        numbers: [],
        stars: []
      };
    }

    const numeros: number[] = [];
    const etoiles: number[] = [];
    
    draws.forEach(draw => {
      numeros.push(draw.n1, draw.n2, draw.n3, draw.n4, draw.n5);
      etoiles.push(draw.e1, draw.e2);
    });

    const numerosFreq = this.calculateFrequency(numeros);
    const etoilesFreq = this.calculateFrequency(etoiles);

    // Créer la structure attendue par le composant
    const numbers = Array.from({ length: 50 }, (_, i) => {
      const num = i + 1;
      const count = numerosFreq[num] || 0;
      const total = Object.values(numerosFreq).reduce((a, b) => a + b, 0);
      return {
        numero: num,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      };
    });

    const starsStats = Array.from({ length: 12 }, (_, i) => {
      const num = i + 1;
      const count = etoilesFreq[num] || 0;
      const total = Object.values(etoilesFreq).reduce((a, b) => a + b, 0);
      return {
        numero: num,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      };
    });

    return {
      total_draws: draws.length,
      numbers,
      stars: starsStats,
      date_range: this.getDateRange(draws),
      recent_draws: draws.slice(0, 7).map(draw => ({
        id: draw.id,
        date: draw.date,
        numeros: [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5],
        etoiles: [draw.e1, draw.e2]
      }))
    };
  }

  async getEuromillionsYears(): Promise<number[]> {
    const db = await this.initDB();
    const draws = await db.getAll('draws_euromillions');
    
    const years = [...new Set(draws.map(draw => new Date(draw.date).getFullYear()))];
    return years.sort((a, b) => b - a);
  }

  // Méthodes utilitaires
  private calculateFrequency(numbers: number[]) {
    const freq: { [key: number]: number } = {};
    numbers.forEach(num => {
      freq[num] = (freq[num] || 0) + 1;
    });
    return freq;
  }

  private getTopNumbers(freq: { [key: number]: number }, count: number) {
    return Object.entries(freq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, count)
      .map(([numero, count]) => ({
        numero: parseInt(numero),
        count,
        frequency: count / Object.values(freq).reduce((a, b) => a + b, 0)
      }));
  }

  private getBottomNumbers(freq: { [key: number]: number }, count: number) {
    return Object.entries(freq)
      .sort(([,a], [,b]) => a - b)
      .slice(0, count)
      .map(([numero, count]) => ({
        numero: parseInt(numero),
        count,
        frequency: count / Object.values(freq).reduce((a, b) => a + b, 0)
      }));
  }

  private calculateAverageSum(draws: DrawLoto[]) {
    const sums = draws.map(draw => draw.n1 + draw.n2 + draw.n3 + draw.n4 + draw.n5 + draw.n6);
    return sums.reduce((a, b) => a + b, 0) / sums.length;
  }

  private calculateMedianSum(draws: DrawLoto[]) {
    const sums = draws.map(draw => draw.n1 + draw.n2 + draw.n3 + draw.n4 + draw.n5 + draw.n6).sort((a, b) => a - b);
    const mid = Math.floor(sums.length / 2);
    return sums.length % 2 === 0 ? (sums[mid - 1] + sums[mid]) / 2 : sums[mid];
  }

  private getRecentDraws(draws: DrawLoto[], days: number): any[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return draws.filter(draw => new Date(draw.date) >= cutoff);
  }

  private getDateRange(draws: DrawLoto[] | DrawEuromillions[]) {
    if (draws.length === 0) return { start: null, end: null };
    const dates = draws.map(draw => new Date(draw.date));
    return {
      start: new Date(Math.min(...dates.map(d => d.getTime()))).toISOString().split('T')[0],
      end: new Date(Math.max(...dates.map(d => d.getTime()))).toISOString().split('T')[0]
    };
  }

  private formatFrequencies(freq: { [key: number]: number }) {
    const total = Object.values(freq).reduce((a, b) => a + b, 0);
    const result: { [key: number]: number } = {};
    Object.entries(freq).forEach(([num, count]) => {
      result[parseInt(num)] = count / total;
    });
    return result;
  }

  private formatCounts(freq: { [key: number]: number }) {
    const result: { [key: number]: number } = {};
    Object.entries(freq).forEach(([num, count]) => {
      result[parseInt(num)] = count;
    });
    return result;
  }

  private filterLotoDraws(draws: DrawLoto[], params: any): DrawLoto[] {
    let filteredDraws = [...draws];

    // Filtrer par année
    if (params.year) {
      const year = parseInt(params.year);
      filteredDraws = filteredDraws.filter(draw => new Date(draw.date).getFullYear() === year);
    }

    // Filtrer par mois
    if (params.month) {
      const month = parseInt(params.month);
      filteredDraws = filteredDraws.filter(draw => new Date(draw.date).getMonth() + 1 === month);
    }

    return filteredDraws;
  }

  private filterEuromillionsDraws(draws: DrawEuromillions[], params: any): DrawEuromillions[] {
    let filteredDraws = [...draws];

    // Filtrer par année
    if (params.year) {
      const year = parseInt(params.year);
      filteredDraws = filteredDraws.filter(draw => new Date(draw.date).getFullYear() === year);
    }

    // Filtrer par mois
    if (params.month) {
      const month = parseInt(params.month);
      filteredDraws = filteredDraws.filter(draw => new Date(draw.date).getMonth() + 1 === month);
    }

    return filteredDraws;
  }

  // Import de données (pour migrer depuis le backend)
  async importLotoData(data: DrawLoto[]) {
    const db = await this.initDB();
    const tx = db.transaction('draws_loto', 'readwrite');
    
    // Vider la table avant d'importer
    await tx.store.clear();
    
    for (const draw of data) {
      await tx.store.add(draw);
    }
    await tx.done;
  }

  async importEuromillionsData(data: DrawEuromillions[]) {
    const db = await this.initDB();
    const tx = db.transaction('draws_euromillions', 'readwrite');
    
    // Vider la table avant d'importer
    await tx.store.clear();
    
    for (const draw of data) {
      await tx.store.add(draw);
    }
    await tx.done;
  }
}

export const localDataManager = new LocalDataManager(); 