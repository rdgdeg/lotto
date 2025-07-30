# 🔧 Guide de Résolution des Problèmes d'Import CSV

## 🚨 **Problème identifié : Colonnes manquantes**

D'après l'erreur affichée, vos fichiers CSV ne contiennent pas les colonnes attendues par l'application.

### **Erreur typique :**
```
Colonnes manquantes: Date, Numéro 1, Numéro 2, Numéro 3, Numéro 4, Numéro 5, Numéro 6
```

## 🔍 **Diagnostic automatique**

### **Étape 1 : Analyser vos fichiers**
Utilisez le script d'analyse pour comprendre le format de vos fichiers :

```bash
cd /Users/raphdegand/Documents/DEV/LOTTO/backend
python3 analyze_csv_format.py
```

**Ou directement avec un fichier :**
```bash
python3 analyze_csv_format.py /chemin/vers/votre/fichier.csv
```

### **Étape 2 : Utiliser le validateur amélioré**
```bash
python3 enhanced_upload_validator.py
```

## 🛠️ **Solutions par type de problème**

### **Problème 1 : En-têtes différents**

#### **Vos fichiers ont peut-être :**
- `Jour` au lieu de `Date`
- `Boule 1` au lieu de `Numéro 1`
- `Chance` au lieu de `Complémentaire`
- `N1, N2, N3...` au lieu de `Numéro 1, Numéro 2...`

#### **Solution :**
Utilisez le script de conversion automatique :
```bash
python3 analyze_csv_format.py votre_fichier.csv
```

### **Problème 2 : Format de date différent**

#### **Formats acceptés :**
- `2024-01-01` ✅
- `01/01/2024` ✅
- `01-01-2024` ✅
- `01.01.2024` ✅
- `01/01/24` ✅

#### **Solution :**
Le validateur amélioré gère automatiquement ces formats.

### **Problème 3 : Encodage de caractères**

#### **Encodages supportés :**
- UTF-8 ✅
- Latin-1 ✅
- CP1252 ✅
- ISO-8859-1 ✅

#### **Solution :**
Le validateur détecte automatiquement l'encodage.

## 📋 **Formats de fichiers supportés**

### **Format standard attendu :**
```csv
Date,Numéro 1,Numéro 2,Numéro 3,Numéro 4,Numéro 5,Numéro 6,Complémentaire
2024-01-01,7,13,24,31,42,45,3
```

### **Formats alternatifs acceptés :**

#### **Format avec "Bonus" :**
```csv
Date,Numéro 1,Numéro 2,Numéro 3,Numéro 4,Numéro 5,Numéro 6,Bonus
2024-01-01,7,13,24,31,42,45,3
```

#### **Format avec "Boule" :**
```csv
Date,Boule 1,Boule 2,Boule 3,Boule 4,Boule 5,Boule 6,Chance
2024-01-01,7,13,24,31,42,45,3
```

#### **Format avec "N1, N2..." :**
```csv
Date,N1,N2,N3,N4,N5,N6,Complémentaire
2024-01-01,7,13,24,31,42,45,3
```

## 🔧 **Outils de correction**

### **Script d'analyse automatique :**
```bash
python3 analyze_csv_format.py
```

**Fonctionnalités :**
- ✅ Détection automatique du format
- ✅ Analyse des colonnes présentes
- ✅ Conversion automatique vers le format standard
- ✅ Validation complète

### **Validateur amélioré :**
```bash
python3 enhanced_upload_validator.py
```

**Fonctionnalités :**
- ✅ Détection flexible des formats
- ✅ Support de multiples encodages
- ✅ Validation des dates flexibles
- ✅ Rapport détaillé

## 📝 **Exemples de correction manuelle**

### **Si vos fichiers ont des en-têtes différents :**

#### **Avant (problématique) :**
```csv
Jour,Boule 1,Boule 2,Boule 3,Boule 4,Boule 5,Boule 6,Chance
26/07/25,4,13,18,19,20,45,2
```

#### **Après (corrigé) :**
```csv
Date,Numéro 1,Numéro 2,Numéro 3,Numéro 4,Numéro 5,Numéro 6,Complémentaire
2025-07-26,4,13,18,19,20,45,2
```

### **Script Python pour conversion automatique :**
```python
import pandas as pd

# Lire le fichier original
df = pd.read_csv('votre_fichier.csv')

# Renommer les colonnes
mapping = {
    'Jour': 'Date',
    'Boule 1': 'Numéro 1',
    'Boule 2': 'Numéro 2',
    'Boule 3': 'Numéro 3',
    'Boule 4': 'Numéro 4',
    'Boule 5': 'Numéro 5',
    'Boule 6': 'Numéro 6',
    'Chance': 'Complémentaire'
}

df = df.rename(columns=mapping)

# Convertir les dates
df['Date'] = pd.to_datetime(df['Date']).dt.strftime('%Y-%m-%d')

# Sauvegarder
df.to_csv('fichier_corrige.csv', index=False)
```

## 🚀 **Processus de résolution recommandé**

### **Étape 1 : Diagnostic**
```bash
python3 analyze_csv_format.py votre_fichier.csv
```

### **Étape 2 : Validation**
```bash
python3 enhanced_upload_validator.py
```

### **Étape 3 : Conversion (si nécessaire)**
Le script d'analyse propose automatiquement la conversion.

### **Étape 4 : Test d'import**
```bash
curl -X POST "http://localhost:8000/api/loto/validate-upload" \
  -F "file=@fichier_corrige.csv"
```

### **Étape 5 : Import final**
```bash
curl -X POST "http://localhost:8000/api/loto/import" \
  -F "file=@fichier_corrige.csv"
```

## 📞 **Support et dépannage**

### **Si les scripts ne fonctionnent pas :**
1. **Vérifiez** que pandas est installé : `pip install pandas`
2. **Vérifiez** que le fichier existe et est accessible
3. **Vérifiez** les permissions du fichier

### **Si l'import échoue toujours :**
1. **Utilisez** le validateur amélioré pour un diagnostic détaillé
2. **Vérifiez** que les numéros sont dans les bonnes plages (1-45 pour les numéros, 1-10 pour le complémentaire)
3. **Vérifiez** qu'il n'y a pas de lignes vides ou corrompues

### **Logs utiles :**
- **Validation** : Vérifiez les erreurs spécifiques par ligne
- **Import** : Vérifiez le nombre de tirages ajoutés
- **Format** : Vérifiez que les colonnes sont correctement détectées

---

**🎯 Avec ces outils, vous devriez pouvoir importer vos fichiers CSV Loto sans problème !** 