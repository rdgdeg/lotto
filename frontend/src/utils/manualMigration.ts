// Migration manuelle avec données de test
import { localDataManager } from './localDataManager';

// Données de test pour Loto
const testLotoData = [
  {
    date: '2025-07-26',
    n1: 4, n2: 13, n3: 18, n4: 19, n5: 20, n6: 45,
    complementaire: 2
  },
  {
    date: '2025-07-23',
    n1: 4, n2: 7, n3: 9, n4: 22, n5: 35, n6: 37,
    complementaire: 30
  },
  {
    date: '2025-07-19',
    n1: 2, n2: 14, n3: 18, n4: 23, n5: 28, n6: 45,
    complementaire: 5
  },
  {
    date: '2025-07-16',
    n1: 1, n2: 10, n3: 15, n4: 17, n5: 25, n6: 27,
    complementaire: 7
  },
  {
    date: '2025-07-12',
    n1: 2, n2: 4, n3: 26, n4: 36, n5: 42, n6: 45,
    complementaire: 18
  }
];

// Données de test pour Euromillions
const testEuromillionsData = [
  {
    date: '2025-07-29',
    n1: 5, n2: 6, n3: 42, n4: 44, n5: 46,
    e1: 4, e2: 8
  },
  {
    date: '2025-07-25',
    n1: 6, n2: 7, n3: 23, n4: 32, n5: 36,
    e1: 11, e2: 12
  },
  {
    date: '2025-07-22',
    n1: 8, n2: 15, n3: 26, n4: 33, n5: 41,
    e1: 9, e2: 10
  },
  {
    date: '2025-07-18',
    n1: 13, n2: 19, n3: 25, n4: 42, n5: 45,
    e1: 2, e2: 9
  },
  {
    date: '2025-07-15',
    n1: 24, n2: 38, n3: 41, n4: 45, n5: 49,
    e1: 1, e2: 6
  }
];

export async function manualMigration() {
  try {
    console.log('🔄 Migration manuelle avec données de test...');
    
    // Migrer les données Loto de test
    await localDataManager.importLotoData(testLotoData);
    console.log(`✅ ${testLotoData.length} tirages Loto de test migrés`);
    
    // Migrer les données Euromillions de test
    await localDataManager.importEuromillionsData(testEuromillionsData);
    console.log(`✅ ${testEuromillionsData.length} tirages Euromillions de test migrés`);
    
    console.log('🎉 Migration manuelle terminée avec succès !');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration manuelle:', error);
    return false;
  }
}

// Fonction pour migrer depuis le backend si disponible
export async function migrateFromBackend() {
  try {
    console.log('🔄 Tentative de migration depuis le backend...');
    
    // Test de connectivité au backend
    const response = await fetch('http://localhost:8000/api/loto/?limit=3000', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`Backend non accessible: ${response.status}`);
    }
    
    const lotoData = await response.json();
    const lotoDraws = lotoData.draws.map((draw: any) => ({
      date: draw.date,
      n1: draw.numeros[0],
      n2: draw.numeros[1],
      n3: draw.numeros[2],
      n4: draw.numeros[3],
      n5: draw.numeros[4],
      n6: draw.numeros[5],
      complementaire: draw.complementaire
    }));
    
    await localDataManager.importLotoData(lotoDraws);
    console.log(`✅ ${lotoDraws.length} tirages Loto migrés depuis le backend`);
    
    // Migrer Euromillions
    const euromillionsResponse = await fetch('http://localhost:8000/api/euromillions/?limit=3000');
    if (euromillionsResponse.ok) {
      const euromillionsData = await euromillionsResponse.json();
      const euromillionsDraws = euromillionsData.draws.map((draw: any) => ({
        date: draw.date,
        n1: draw.n1,
        n2: draw.n2,
        n3: draw.n3,
        n4: draw.n4,
        n5: draw.n5,
        e1: draw.e1,
        e2: draw.e2
      }));
      
      await localDataManager.importEuromillionsData(euromillionsDraws);
      console.log(`✅ ${euromillionsDraws.length} tirages Euromillions migrés depuis le backend`);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration depuis le backend:', error);
    console.log('🔄 Fallback vers la migration manuelle...');
    return await manualMigration();
  }
} 