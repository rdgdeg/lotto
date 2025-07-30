# 🎰 Générateur de Grilles Loto & Euromillions

Une application complète de génération et d'analyse de grilles pour les jeux de loterie Loto et Euromillions, avec des fonctionnalités avancées d'analyse statistique et de prédiction.

## 🚀 Fonctionnalités

### 📊 **Analyses Avancées**
- **Statistiques complètes** : Fréquences, tendances, patterns
- **Analyse chaud/froid** : Identification des numéros en tendance
- **Combinaisons fréquentes** : Paires et triplets populaires
- **Analyse des patterns** : Consécutifs, pair/impair, sommes
- **Tendances par numéro** : Analyse individuelle détaillée
- **Comparaisons de périodes** : Évolution dans le temps
- **Export de données** : Formats JSON/CSV

### 🎲 **Génération de Grilles**
- **Génération intelligente** basée sur les statistiques historiques
- **Stratégies personnalisées** pour différents profils de joueurs
- **Analyse de grilles** avec évaluation des chances
- **Historique des tirages** avec recherche et filtres

### 📁 **Gestion des Données**
- **Import CSV/Excel** avec validation automatique
- **Upload multiple** de fichiers
- **Validation en temps réel** des données
- **Export des analyses** dans différents formats
- **Gestion des doublons** et erreurs

### 🔧 **Interface Utilisateur**
- **Interface moderne** et responsive
- **Dashboard interactif** avec graphiques
- **Diagnostic en temps réel** des données
- **Notifications** et alertes intelligentes
- **Mode sombre/clair** (en développement)

## 🛠️ Technologies Utilisées

### Backend
- **FastAPI** : Framework web moderne et rapide
- **SQLAlchemy** : ORM pour la gestion de base de données
- **Pandas** : Analyse et manipulation de données
- **NumPy** : Calculs scientifiques
- **SQLite** : Base de données légère

### Frontend
- **React** : Interface utilisateur interactive
- **TypeScript** : Typage statique pour la robustesse
- **Tailwind CSS** : Styling moderne et responsive
- **Axios** : Client HTTP pour les appels API

## 📦 Installation

### Prérequis
- Python 3.8+
- Node.js 16+
- npm ou yarn

### Backend

```bash
# Cloner le repository
git clone <votre-repo-url>
cd LOTTO

# Installer les dépendances Python
cd backend
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
pip install -r requirements.txt

# Initialiser la base de données
python -c "from app.database import engine; from app.models import Base; Base.metadata.create_all(bind=engine)"

# Lancer le serveur
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
# Dans un nouveau terminal
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm start
```

## 🎯 Utilisation

### Démarrage Rapide

1. **Lancez le backend** : `uvicorn app.main:app --reload`
2. **Lancez le frontend** : `npm start`
3. **Ouvrez votre navigateur** : http://localhost:3000
4. **Importez vos données** ou utilisez les données de test

### Import de Données

#### Format CSV pour Loto
```csv
Date,Numéro 1,Numéro 2,Numéro 3,Numéro 4,Numéro 5,Numéro 6,Bonus
2024-01-01,1,15,23,34,45,49,10
2024-01-04,7,12,19,28,39,42,5
```

#### Format CSV pour Euromillions
```csv
Date,Numéro 1,Numéro 2,Numéro 3,Numéro 4,Numéro 5,Étoile 1,Étoile 2
2024-01-01,1,15,23,34,45,3,8
2024-01-04,7,12,19,28,39,2,11
```

## 📚 API Documentation

### Endpoints Principaux

#### Loto
- `GET /api/loto/` - Liste des tirages avec pagination
- `GET /api/loto/quick-stats` - Statistiques rapides
- `GET /api/loto/advanced/comprehensive-stats` - Analyses complètes
- `GET /api/loto/advanced/hot-cold-analysis` - Analyse chaud/froid
- `POST /api/loto/import-multiple` - Import de fichiers multiples

#### Euromillions
- `GET /api/euromillions/` - Liste des tirages
- `GET /api/euromillions/quick-stats` - Statistiques rapides
- `GET /api/euromillions/advanced/comprehensive-stats` - Analyses complètes

### Documentation Interactive
- **Swagger UI** : http://localhost:8000/docs
- **ReDoc** : http://localhost:8000/redoc

## 🔍 Diagnostic et Dépannage

### Outils de Diagnostic
- **Composant de diagnostic** : Bouton "🔍 Diagnostic" dans l'interface
- **Script de test** : `python test_frontend_connection.py`
- **Logs détaillés** : Console du navigateur et terminal

### Problèmes Courants

1. **Données ne s'affichent pas**
   - Utilisez le bouton "🔍 Diagnostic"
   - Cliquez sur "🔄 Forcer Rafraîchissement"
   - Vérifiez la console du navigateur

2. **Erreur de connexion API**
   - Vérifiez que le backend tourne sur le port 8000
   - Vérifiez que le frontend tourne sur le port 3000
   - Vérifiez les logs du backend

3. **Import de fichiers échoue**
   - Vérifiez le format CSV
   - Utilisez la validation avant import
   - Consultez les messages d'erreur détaillés

## 📊 Exemples d'Analyses

### Statistiques Actuelles (Données de Test)
- **Loto** : 313 tirages (2023-2025)
- **Euromillions** : 1861 tirages
- **Top numéro Loto** : 8 (16.6% de fréquence)
- **Numéros consécutifs** : 55.91% des tirages
- **Somme moyenne** : 140.6

### Analyses Disponibles
- **Patterns de numéros** : Consécutifs, pair/impair, sommes
- **Tendances temporelles** : Évolution sur différentes périodes
- **Combinaisons fréquentes** : Paires et triplets populaires
- **Analyse de parité** : Distribution pair/impair
- **Métriques de performance** : Indicateurs de qualité

## 🤝 Contribution

### Structure du Projet
```
LOTTO/
├── backend/                 # API FastAPI
│   ├── app/
│   │   ├── routers/        # Endpoints API
│   │   ├── models.py       # Modèles de données
│   │   └── database.py     # Configuration DB
│   ├── requirements.txt    # Dépendances Python
│   └── main.py            # Point d'entrée
├── frontend/               # Application React
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── pages/         # Pages principales
│   │   └── utils/         # Utilitaires
│   └── package.json       # Dépendances Node.js
└── README.md              # Documentation
```

### Ajout de Fonctionnalités
1. **Backend** : Ajoutez les endpoints dans `app/routers/`
2. **Frontend** : Créez les composants dans `src/components/`
3. **Tests** : Ajoutez les tests unitaires
4. **Documentation** : Mettez à jour le README

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
1. Consultez la documentation API
2. Utilisez l'outil de diagnostic intégré
3. Vérifiez les logs d'erreur
4. Ouvrez une issue sur GitHub

---

**🎰 Bonne chance et amusez-vous bien !** 