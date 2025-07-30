# 📊 Guide des Formats CSV - Loto

## 🎯 **Formats acceptés pour l'import Loto**

L'application accepte maintenant **deux formats** pour les fichiers CSV de Loto :

### **Format 1 : Avec "Complémentaire"**
```csv
Date,Numéro 1,Numéro 2,Numéro 3,Numéro 4,Numéro 5,Numéro 6,Complémentaire
2024-01-01,7,13,24,31,42,45,3
2024-01-03,2,8,15,28,36,44,7
2024-01-06,1,12,19,25,38,43,2
```

### **Format 2 : Avec "Bonus"**
```csv
Date,Numéro 1,Numéro 2,Numéro 3,Numéro 4,Numéro 5,Numéro 6,Bonus
2024-01-01,7,13,24,31,42,45,3
2024-01-03,2,8,15,28,36,44,7
2024-01-06,1,12,19,25,38,43,2
```

## 📋 **Règles de validation**

### **Colonnes obligatoires :**
- ✅ **Date** : Format YYYY-MM-DD
- ✅ **Numéro 1** : Entre 1 et 45
- ✅ **Numéro 2** : Entre 1 et 45
- ✅ **Numéro 3** : Entre 1 et 45
- ✅ **Numéro 4** : Entre 1 et 45
- ✅ **Numéro 5** : Entre 1 et 45
- ✅ **Numéro 6** : Entre 1 et 45
- ✅ **Complémentaire OU Bonus** : Entre 1 et 10

### **Règles de validation :**
- 🎯 **Numéros principaux** : 6 numéros uniques entre 1 et 45
- 🎯 **Complémentaire/Bonus** : 1 numéro entre 1 et 10
- 🎯 **Pas de doublons** dans la même ligne
- 🎯 **Format de date** : YYYY-MM-DD obligatoire
- 🎯 **Pas de lignes vides**

## 🔧 **Conversion de formats**

### **Si vos fichiers utilisent "Bonus" :**
✅ **Aucune action requise** - L'application accepte maintenant ce format

### **Si vos fichiers utilisent "Complémentaire" :**
✅ **Aucune action requise** - L'application accepte maintenant ce format

### **Si vos fichiers ont un autre format :**
🔄 **Conversion nécessaire** - Voir les exemples ci-dessous

## 📝 **Exemples de conversion**

### **Format Excel avec "Bonus" :**
```
Date        | Numéro 1 | Numéro 2 | Numéro 3 | Numéro 4 | Numéro 5 | Numéro 6 | Bonus
26/07/25    | 4        | 13       | 18       | 19       | 20       | 45       | 2
23/07/25    | 1        | 9        | 22       | 37       | 42       | 44       | 14
```

**Conversion en CSV :**
```csv
Date,Numéro 1,Numéro 2,Numéro 3,Numéro 4,Numéro 5,Numéro 6,Bonus
2025-07-26,4,13,18,19,20,45,2
2025-07-23,1,9,22,37,42,44,14
```

### **Format avec "Complémentaire" :**
```csv
Date,Numéro 1,Numéro 2,Numéro 3,Numéro 4,Numéro 5,Numéro 6,Complémentaire
2024-01-01,7,13,24,31,42,45,3
2024-01-03,2,8,15,28,36,44,7
```

## 🛠️ **Outils de conversion**

### **Script Python pour convertir les dates :**
```python
import pandas as pd
from datetime import datetime

# Lire le fichier Excel
df = pd.read_excel('votre_fichier.xlsx')

# Convertir les dates
df['Date'] = pd.to_datetime(df['Date']).dt.strftime('%Y-%m-%d')

# Sauvegarder en CSV
df.to_csv('fichier_converti.csv', index=False)
```

### **Script Python pour renommer les colonnes :**
```python
import pandas as pd

# Lire le fichier CSV
df = pd.read_csv('votre_fichier.csv')

# Renommer la colonne si nécessaire
if 'Bonus' in df.columns:
    df = df.rename(columns={'Bonus': 'Complémentaire'})

# Sauvegarder
df.to_csv('fichier_renommé.csv', index=False)
```

## 🚀 **Upload multiple**

### **Vous pouvez maintenant uploader :**
- ✅ **Fichiers avec "Complémentaire"**
- ✅ **Fichiers avec "Bonus"**
- ✅ **Mélange des deux formats** dans le même upload multiple

### **Exemple d'upload multiple :**
```
📁 loto_2024_complementaire.csv (Format 1)
📁 loto_2023_bonus.csv (Format 2)
📁 loto_2022_complementaire.csv (Format 1)
→ Import multiple : Tous les formats acceptés !
```

## 🔍 **Vérification des formats**

### **Avant l'upload :**
1. **Vérifiez les en-têtes** de vos fichiers CSV
2. **Assurez-vous** que les dates sont au format YYYY-MM-DD
3. **Vérifiez** que les numéros sont dans les bonnes plages
4. **Testez** avec un petit fichier d'abord

### **Après l'upload :**
1. **Vérifiez** le rapport de validation
2. **Consultez** les statistiques pour confirmer l'import
3. **Exportez** les données pour vérification

## 📞 **Support**

### **En cas de problème :**
1. **Vérifiez** que vos en-têtes correspondent exactement
2. **Assurez-vous** que les dates sont au bon format
3. **Vérifiez** que les numéros sont dans les bonnes plages
4. **Testez** avec un fichier d'exemple fourni

### **Fichiers d'exemple disponibles :**
- `exemple_loto_test.csv` - Format avec "Complémentaire"
- `test_loto_bonus.csv` - Format avec "Bonus"

---

**🎯 Vous pouvez maintenant importer vos fichiers CSV Loto quel que soit le format utilisé (Complémentaire ou Bonus) !** 