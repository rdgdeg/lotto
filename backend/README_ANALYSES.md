# 🎰 Guide des Analyses Avancées - Loto

## 📊 Vue d'ensemble

Suite à l'import de vos données, nous avons mis en place un système complet d'analyses avancées pour le Loto avec **313 tirages de test** couvrant la période **2023-07-31 à 2025-07-28**.

## 🚀 Fonctionnalités Disponibles

### 1. **Statistiques Complètes** 
**Endpoint:** `GET /api/loto/advanced/comprehensive-stats`

Analyse complète de toutes les données avec :
- Statistiques de base (fréquences, top/bottom numéros)
- Combinaisons fréquentes (paires, triplets)
- Patterns de numéros
- Analyse chaud/froid
- Statistiques par année
- Analyse des séquences
- Analyse de parité
- Analyse des sommes

### 2. **Analyse Chaud/Froid**
**Endpoint:** `GET /api/loto/advanced/hot-cold-analysis`

Identifie les numéros en tendance :
- **Numéros chauds** : Plus fréquents récemment
- **Numéros froids** : Moins fréquents récemment
- Analyse des complémentaires
- Comparaison entre périodes récentes et anciennes

**Exemple de résultats :**
- 11 numéros chauds identifiés
- 10 numéros froids identifiés
- Top 3 chauds : [23, 34, 40]

### 3. **Combinaisons Fréquentes**
**Endpoint:** `GET /api/loto/advanced/frequent-combinations`

Trouve les paires et triplets de numéros qui sortent souvent ensemble :
- Paires de numéros fréquentes
- Triplets de numéros fréquents
- Fréquence d'apparition
- Seuil de fréquence configurable

### 4. **Analyse des Patterns**
**Endpoint:** `GET /api/loto/advanced/patterns`

Analyse les motifs dans les tirages :
- **Nombres consécutifs** : 55.91% des tirages
- **Distribution pair/impair** : 4E/2I (65 tirages), 3E/3I (102 tirages)
- **Distribution haut/bas** (1-22 vs 23-45)
- **Somme des numéros** : moyenne 140.6
- **Analyse des écarts** entre numéros

### 5. **Analyse des Séquences**
**Endpoint:** `GET /api/loto/advanced/sequences`

Identifie les séquences mathématiques :
- Séquences consécutives
- Séquences arithmétiques
- Séquences géométriques
- Statistiques de séquences

### 6. **Analyse de Parité**
**Endpoint:** `GET /api/loto/advanced/parity`

Analyse la répartition pair/impair :
- Distribution des numéros pairs vs impairs
- Patterns de parité les plus fréquents
- Statistiques de parité

### 7. **Analyse des Sommes**
**Endpoint:** `GET /api/loto/advanced/sums`

Analyse statistique des sommes :
- Somme minimale, maximale, moyenne
- Distribution des sommes (faible, moyenne, élevée)
- Sommes les plus fréquentes
- Écart-type et médiane

### 8. **Tendances par Numéro**
**Endpoint:** `GET /api/loto/advanced/number-trends/{number}`

Analyse les tendances d'un numéro spécifique :
- Fréquence récente vs ancienne
- Tendance (croissante, décroissante, stable)
- Période d'analyse configurable
- Statistiques détaillées

### 9. **Répartition Annuelle**
**Endpoint:** `GET /api/loto/advanced/yearly-breakdown`

Statistiques par année :
- Top numéros par année
- Top complémentaires par année
- Nombre de tirages par année
- Moyenne des sommes par année

### 10. **Métriques de Performance**
**Endpoint:** `GET /api/loto/advanced/performance-metrics`

Métriques globales :
- Total de tirages
- Plage de dates
- Somme moyenne et médiane
- Top numéro et complémentaire
- Timestamp de dernière analyse

### 11. **Comparaison de Périodes**
**Endpoint:** `GET /api/loto/advanced/comparison`

Compare deux périodes :
- Période 1 vs Période 2
- Changements de fréquences
- Pourcentages de variation
- Analyse des complémentaires

### 12. **Export d'Analyses**
**Endpoint:** `GET /api/loto/advanced/export-analysis`

Export des données d'analyse :
- Format JSON/CSV
- Filtres configurables
- Inclusion/exclusion de sections
- Timestamp d'export

## 📈 Endpoints de Base Améliorés

### **Historique avec Pagination**
**Endpoint:** `GET /api/loto/`

Nouvelles fonctionnalités :
- Pagination (limit, offset)
- Tri par date ou ID
- Filtres par année et mois
- Informations de pagination

### **Statistiques en Temps Réel**
**Endpoint:** `GET /api/loto/stats`

Statistiques améliorées :
- Données en temps réel
- Statistiques des 30 derniers jours
- Timestamp de dernière mise à jour

### **Statistiques Détaillées**
**Endpoint:** `GET /api/loto/detailed-stats`

Utilise maintenant les analyses avancées pour des statistiques complètes.

## 🔧 Utilisation

### **Exemple d'utilisation :**

```bash
# Statistiques complètes
curl "http://localhost:8000/api/loto/advanced/comprehensive-stats"

# Analyse chaud/froid
curl "http://localhost:8000/api/loto/advanced/hot-cold-analysis"

# Patterns avec paramètres
curl "http://localhost:8000/api/loto/advanced/patterns"

# Tendances d'un numéro
curl "http://localhost:8000/api/loto/advanced/number-trends/7"

# Comparaison de périodes
curl "http://localhost:8000/api/loto/advanced/comparison?period1_days=30&period2_days=90"
```

### **Paramètres disponibles :**

- `recent_draws` : Nombre de tirages récents (défaut: 50)
- `min_frequency` : Fréquence minimale pour combinaisons (défaut: 0.05)
- `days` : Période d'analyse en jours (défaut: 365)
- `period1_days` / `period2_days` : Périodes de comparaison
- `format` : Format d'export (json/csv)
- `include_patterns` : Inclure l'analyse des patterns
- `include_combinations` : Inclure les combinaisons fréquentes

## 📊 Résultats Actuels

Avec les **313 tirages de test** :

- **Période** : 2023-07-31 à 2025-07-28
- **Top numéro** : 8 (52 apparitions, 16.6% de fréquence)
- **Numéros consécutifs** : 55.91% des tirages
- **Somme moyenne** : 140.6
- **Distribution pair/impair** : 4E/2I (65 tirages)
- **Numéros chauds** : 11 identifiés
- **Numéros froids** : 10 identifiés

## 🎯 Prochaines Étapes

1. **Import de vos vraies données** : Remplacer les données de test par vos données réelles
2. **Interface utilisateur** : Intégrer ces analyses dans le frontend
3. **Alertes** : Système d'alertes pour tendances importantes
4. **Prédictions** : Modèles de prédiction basés sur les analyses
5. **Rapports** : Génération de rapports PDF/Excel

## 🔗 Documentation API

Accédez à la documentation interactive :
- **Swagger UI** : http://localhost:8000/docs
- **ReDoc** : http://localhost:8000/redoc

Tous les endpoints sont documentés avec exemples et paramètres. 