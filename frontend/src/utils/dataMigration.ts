// Script de migration des données du backend vers le frontend
import { localDataManager } from './localDataManager';

export async function migrateDataFromBackend() {
  try {
    console.log('🔄 Début de la migration des données...');
    
    // Migrer les données Loto
    console.log('📊 Migration des données Loto...');
    const lotoResponse = await fetch('http://localhost:8000/api/loto/?limit=3000');
    if (lotoResponse.ok) {
      const lotoData = await lotoResponse.json();
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
      console.log(`✅ ${lotoDraws.length} tirages Loto migrés`);
    } else {
      console.log('⚠️ Impossible de récupérer les données Loto du backend');
    }
    
    // Migrer les données Euromillions
    console.log('⭐ Migration des données Euromillions...');
    const euromillionsResponse = await fetch('http://localhost:8000/api/euromillions/?limit=3000');
    if (euromillionsResponse.ok) {
      const euromillionsData = await euromillionsResponse.json();
      const euromillionsDraws = euromillionsData.draws.map((draw: any) => ({
        date: draw.date,
        n1: draw.numeros[0],
        n2: draw.numeros[1],
        n3: draw.numeros[2],
        n4: draw.numeros[3],
        n5: draw.numeros[4],
        e1: draw.etoiles[0],
        e2: draw.etoiles[1]
      }));
      
      await localDataManager.importEuromillionsData(euromillionsDraws);
      console.log(`✅ ${euromillionsDraws.length} tirages Euromillions migrés`);
    } else {
      console.log('⚠️ Impossible de récupérer les données Euromillions du backend');
    }
    
    console.log('🎉 Migration terminée avec succès !');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    return false;
  }
}

// Fonction pour vérifier si la migration est nécessaire
export async function checkMigrationNeeded() {
  try {
    const lotoStats = await localDataManager.getLotoStats();
    const euromillionsStats = await localDataManager.getEuromillionsStats();
    
    const needsMigration = 
      lotoStats.total_draws === 0 || 
      euromillionsStats.total_draws === 0;
    
    return needsMigration;
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    return true; // En cas d'erreur, on suppose qu'il faut migrer
  }
} 