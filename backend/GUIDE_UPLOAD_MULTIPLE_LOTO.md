# 📚 Guide d'Upload Multiple - Loto

## 🎯 **Vue d'ensemble**

Ce guide vous explique comment importer plusieurs fichiers CSV en une seule fois pour le Loto.

## 🚀 **Fonctionnalités de l'Upload Multiple**

### **Avantages :**
- ✅ **Import en lot** : Plusieurs fichiers en une seule opération
- ✅ **Validation globale** : Vérification de tous les fichiers avant import
- ✅ **Gestion des erreurs** : Traitement sélectif des fichiers valides
- ✅ **Rapport détaillé** : Résumé complet de l'opération
- ✅ **Drag & Drop** : Interface intuitive

## 📋 **Processus d'Upload Multiple**

### **Étape 1 : Sélection des fichiers**
1. **Ouvrir l'application** sur http://localhost:3000
2. **Aller sur la page Loto**
3. **Cliquer sur "📚 Upload Multiple"**
4. **Sélectionner plusieurs fichiers CSV** ou les glisser-déposer

### **Étape 2 : Validation**
1. **Cliquer sur "🔍 Valider"**
2. **Le système analyse** tous les fichiers
3. **Rapport détaillé** pour chaque fichier
4. **Résumé global** de la validation

### **Étape 3 : Import**
1. **Si des fichiers sont valides**, cliquer sur "📥 Importer"
2. **Le système importe** seulement les fichiers valides
3. **Confirmation** avec le nombre total de tirages ajoutés

## 📊 **Rapport de Validation**

### **Résumé global :**
- **Fichiers traités** : Nombre total de fichiers
- **Fichiers valides** : Nombre de fichiers sans erreurs
- **Fichiers invalides** : Nombre de fichiers avec erreurs
- **Lignes totales** : Nombre total de lignes dans tous les fichiers
- **Lignes valides** : Nombre de lignes sans erreurs
- **Doublons détectés** : Nombre de tirages en doublon

### **Détails par fichier :**
- ✅ **Statut** : Valide ou invalide
- 📊 **Lignes** : Nombre de lignes valides/total
- 📅 **Période** : Plage de dates couverte
- ❌ **Erreurs** : Liste des erreurs détectées
- ⚠️ **Avertissements** : Problèmes mineurs détectés

## 🛠️ **Gestion des Erreurs**

### **Types d'erreurs courantes :**
- **Format de fichier** : Colonnes manquantes ou incorrectes
- **Format de date** : Dates au mauvais format
- **Numéros hors plage** : Numéros > 45 ou complémentaire > 10
- **Doublons** : Tirages déjà présents dans la base
- **Fichier corrompu** : Problème de lecture du fichier

### **Stratégie de traitement :**
- ✅ **Fichiers valides** : Importés automatiquement
- ❌ **Fichiers invalides** : Ignorés avec rapport d'erreurs
- ⚠️ **Fichiers partiellement valides** : Importés avec avertissements

## 📈 **Exemples d'utilisation**

### **Import par années :**
```
📁 loto_2024.csv (5 tirages)
📁 loto_2023.csv (5 tirages)
📁 loto_2022.csv (5 tirages)
→ Import multiple : 15 tirages ajoutés
```

### **Import avec erreurs :**
```
📁 loto_2024.csv (5 tirages) ✅ Valide
📁 loto_2023.csv (5 tirages) ✅ Valide
📁 loto_erreur.csv (3 tirages) ❌ Invalide
→ Import multiple : 10 tirages ajoutés (2 fichiers)
```

## 🔧 **Commandes API**

### **Validation multiple :**
```bash
curl -X POST "http://localhost:8000/api/loto/validate-multiple" \
  -F "files=@fichier1.csv" \
  -F "files=@fichier2.csv" \
  -F "files=@fichier3.csv"
```

### **Import multiple :**
```bash
curl -X POST "http://localhost:8000/api/loto/import-multiple" \
  -F "files=@fichier1.csv" \
  -F "files=@fichier2.csv" \
  -F "files=@fichier3.csv"
```

## 📊 **Format des fichiers**

### **Structure requise :**
```csv
Date,Numéro 1,Numéro 2,Numéro 3,Numéro 4,Numéro 5,Numéro 6,Complémentaire
2024-01-01,7,13,24,31,42,45,3
2024-01-03,2,8,15,28,36,44,7
```

### **Règles de validation :**
- **Dates** : Format YYYY-MM-DD
- **Numéros principaux** : Entre 1 et 45
- **Complémentaire** : Entre 1 et 10
- **Pas de doublons** dans la même ligne
- **Pas de lignes vides**

## 🎯 **Conseils d'utilisation**

### **Organisation des fichiers :**
1. **Nommez clairement** vos fichiers (ex: `loto_2024.csv`)
2. **Groupez par année** pour une meilleure organisation
3. **Vérifiez le format** avant l'upload
4. **Sauvegardez** vos fichiers originaux

### **Performance :**
- **Fichiers de < 1000 lignes** : Validation instantanée
- **Fichiers de 1000-10000 lignes** : Quelques secondes
- **Fichiers de > 10000 lignes** : Peut prendre quelques minutes

### **Gestion des erreurs :**
1. **Corrigez les erreurs** dans les fichiers invalides
2. **Réessayez l'upload** avec les fichiers corrigés
3. **Vérifiez les statistiques** après chaque import
4. **Exportez régulièrement** pour sauvegarde

## 📞 **Support**

### **En cas de problème :**
1. **Vérifiez ce guide** en premier
2. **Testez avec un petit fichier** d'abord
3. **Vérifiez les logs** de l'application
4. **Contactez l'équipe** de développement

### **Logs utiles :**
- **Validation** : Vérifiez les erreurs par fichier
- **Import** : Vérifiez le nombre de tirages ajoutés
- **Performance** : Surveillez le temps de traitement

---

**🎯 Vous êtes maintenant prêt à utiliser l'upload multiple pour importer vos données Loto en masse !** 