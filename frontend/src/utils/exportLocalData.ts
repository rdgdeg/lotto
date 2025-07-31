import { localDataManager } from './localDataManager';

export const exportLocalData = async (): Promise<string> => {
  try {
    await localDataManager.ensureInitialized();
    
    // Récupérer toutes les données
    const lotoDraws = await localDataManager.getAllLotoDraws();
    const euromillionsDraws = await localDataManager.getAllEuromillionsDraws();
    
    const exportData = {
      loto: lotoDraws,
      euromillions: euromillionsDraws,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    // Créer le fichier de téléchargement
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lotto-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return `Export réussi : ${lotoDraws.length} tirages Lotto, ${euromillionsDraws.length} tirages Euromillions`;
  } catch (error) {
    console.error('Erreur lors de l\'export:', error);
    throw new Error('Erreur lors de l\'export des données');
  }
};

export const importLocalData = async (file: File): Promise<string> => {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    await localDataManager.ensureInitialized();
    
    // Importer les données Lotto
    if (data.loto && Array.isArray(data.loto)) {
      for (const draw of data.loto) {
        await localDataManager.addLotoDraw(draw);
      }
    }
    
    // Importer les données Euromillions
    if (data.euromillions && Array.isArray(data.euromillions)) {
      for (const draw of data.euromillions) {
        await localDataManager.addEuromillionsDraw(draw);
      }
    }
    
    return `Import réussi : ${data.loto?.length || 0} tirages Lotto, ${data.euromillions?.length || 0} tirages Euromillions`;
  } catch (error) {
    console.error('Erreur lors de l\'import:', error);
    throw new Error('Erreur lors de l\'import des données');
  }
}; 