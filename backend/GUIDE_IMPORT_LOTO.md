# 📊 Guide d'Import en Masse - Loto

## 🎯 **Vue d'ensemble**

Ce guide vous explique comment importer en masse vos données de tirages Loto dans l'application.

## 📋 **Format du fichier CSV requis**

### **Colonnes obligatoires :**
```
Date,Numéro 1,Numéro 2,Numéro 3,Numéro 4,Numéro 5,Numéro 6,Complémentaire
```

### **Exemple de fichier CSV :**
```csv
Date,Numéro 1,Numéro 2,Numéro 3,Numéro 4,Numéro 5,Numéro 6,Complémentaire
2024-01-01,7,13,24,31,42,45,3
2024-01-03,2,8,15,28,36,44,7
2024-01-06,1,12,19,25,38,43,2
2024-01-08,5,11,22,29,35,41,9
2024-01-10,3,9,16,27,33,40,1
```

## 📏 **Règles de validation**

### **Format des dates :**
- **Format requis :** `YYYY-MM-DD` (ex: 2024-01-15)
- **Exemples valides :**
  - `2024-01-01`
  - `2023-12-31`
  - `2022-06-15`

### **Règles des numéros :**
- **Numéros principaux (1-6) :** Entre 1 et 45
- **Complémentaire :** Entre 1 et 10
- **Pas de doublons** dans les numéros principaux
- **Pas de numéros manquants**

### **Exemples de validation :**
✅ **Valide :**
```csv
2024-01-01,7,13,24,31,42,45,3
```

❌ **Invalide (numéro hors plage) :**
```csv
2024-01-01,7,13,24,31,42,50,3
```

❌ **Invalide (doublon) :**
```csv
2024-01-01,7,13,24,31,42,7,3
```

❌ **Invalide (complémentaire hors plage) :**
```csv
2024-01-01,7,13,24,31,42,45,15
```

## 🚀 **Processus d'import**

### **Étape 1 : Validation**
1. **Ouvrir l'application** sur http://localhost:3000
2. **Aller sur la page Loto**
3. **Cliquer sur "📁 Upload Fichier"**
4. **Sélectionner votre fichier CSV**
5. **Cliquer sur "Valider"**

### **Étape 2 : Vérification**
Le système vérifie automatiquement :
- ✅ Format des colonnes
- ✅ Validité des dates
- ✅ Plage des numéros (1-45 pour principaux, 1-10 pour complémentaire)
- ✅ Absence de doublons
- ✅ Doublons avec la base existante

### **Étape 3 : Import**
1. **Si la validation réussit**, cliquer sur "Importer"
2. **Le système importe** tous les tirages valides
3. **Confirmation** avec le nombre de tirages ajoutés

## 📊 **Fonctionnalités disponibles après import**

### **Statistiques automatiques :**
- 📊 **Stats rapides** : Fréquence de chaque numéro
- 📈 **Historique des numéros** : Détail des apparitions
- 📅 **Stats par année** : Analyse temporelle
- 🔍 **Recherche avancée** : Filtres multiples

### **Génération de grilles :**
- 🎲 **Génération simple** : Grilles aléatoires
- 🎯 **Génération pondérée** : Basée sur les statistiques
- 🔍 **Analyse de grilles** : Score et probabilités

### **Export des données :**
- 📥 **Export CSV** : Toutes les données ou par année
- 📊 **Export Excel** : Format .xlsx avec mise en forme
- 🔍 **Filtres d'export** : Par période, par numéros

## 🛠️ **Résolution des problèmes**

### **Erreur : "Colonnes manquantes"**
**Solution :** Vérifiez que votre CSV contient exactement ces colonnes :
```
Date,Numéro 1,Numéro 2,Numéro 3,Numéro 4,Numéro 5,Numéro 6,Complémentaire
```

### **Erreur : "Format de date invalide"**
**Solution :** Assurez-vous que les dates sont au format `YYYY-MM-DD`

### **Erreur : "Numéro hors plage"**
**Solution :** Vérifiez que :
- Les numéros principaux sont entre 1 et 45
- Le complémentaire est entre 1 et 10

### **Erreur : "Doublons détectés"**
**Solution :** Vérifiez qu'il n'y a pas :
- De numéros identiques dans la même ligne
- De dates déjà présentes dans la base

## 📈 **Conseils pour un import optimal**

### **Préparation des données :**
1. **Vérifiez le format** de votre fichier source
2. **Nettoyez les données** avant import
3. **Testez avec un petit échantillon** d'abord
4. **Sauvegardez** votre fichier original

### **Organisation :**
1. **Importez par années** pour une meilleure organisation
2. **Vérifiez les statistiques** après chaque import
3. **Exportez régulièrement** pour sauvegarde

### **Performance :**
- **Fichiers de moins de 1000 lignes** : Import instantané
- **Fichiers de 1000-10000 lignes** : Quelques secondes
- **Fichiers de plus de 10000 lignes** : Peut prendre quelques minutes

## 🔧 **Commandes utiles**

### **Nettoyer la base de données :**
```bash
cd backend
python3 clean_loto_data.py
```

### **Vérifier les données :**
```bash
curl -s "http://localhost:8000/api/loto/quick-stats" | python3 -m json.tool
```

### **Exporter les données :**
```bash
# Export CSV de toutes les données
curl -s "http://localhost:8000/api/loto/export?format=csv" > loto_export.csv

# Export CSV d'une année spécifique
curl -s "http://localhost:8000/api/loto/export?format=csv&year=2024" > loto_2024.csv
```

## 📞 **Support**

Si vous rencontrez des problèmes :
1. **Vérifiez ce guide** en premier
2. **Testez avec un petit fichier** d'exemple
3. **Vérifiez les logs** de l'application
4. **Contactez l'équipe** de développement

---

**🎯 Vous êtes maintenant prêt à importer vos données Loto en masse !** 