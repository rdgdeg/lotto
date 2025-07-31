# 🎰 Application Lotto - Gestionnaire de Tirages

Application web complète pour la gestion et l'analyse des tirages de loterie (Lotto belge et Euromillions).

## 🚀 Déploiement

L'application est déployée sur Vercel : [https://lotto-rdgdeg.vercel.app](https://lotto-rdgdeg.vercel.app)

## 📋 Fonctionnalités

### 🎯 Lotto Belge
- **Gestion des tirages** : Ajout manuel avec validation des jours (mercredi/samedi)
- **Statistiques avancées** : Analyse des numéros les plus/moins fréquents
- **Générateur de grilles** : 6 stratégies différentes de génération
- **Validation** : Numéros 1-45, numéro complémentaire unique

### ⭐ Euromillions
- **Gestion des tirages** : Ajout manuel avec validation des jours (mardi/vendredi)
- **Statistiques complètes** : Analyse des numéros et étoiles
- **Générateur avancé** : Stratégies multiples de génération
- **Validation** : 5 numéros (1-50) + 2 étoiles (1-12)

### 🔧 Fonctionnalités générales
- **Interface moderne** : Design responsive avec Tailwind CSS
- **Gestion locale** : Stockage IndexedDB pour les données
- **Migration de données** : Import depuis CSV et API backend
- **Validation en temps réel** : Contrôles de saisie et avertissements

## 🛠️ Technologies

### Frontend
- **React 18** avec TypeScript
- **Tailwind CSS** pour le styling
- **IndexedDB** pour le stockage local
- **Vite** pour le build

### Backend (optionnel)
- **FastAPI** (Python)
- **SQLAlchemy** pour la base de données
- **Uvicorn** serveur ASGI

## 📦 Installation

### Prérequis
- Node.js 18+
- npm ou yarn

### Installation locale
```bash
# Cloner le repository
git clone https://github.com/rdgdeg/lotto.git
cd lotto

# Installer les dépendances frontend
cd frontend
npm install

# Démarrer l'application
npm start
```

### Backend (optionnel)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # ou `venv\Scripts\activate` sur Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 🎮 Utilisation

### Ajout de tirages
1. Cliquez sur "✏️ Ajout Quotidien"
2. Sélectionnez une date valide (jours de tirage uniquement)
3. Remplissez les numéros ou utilisez "🎲 Aléatoire"
4. Validez le formulaire

### Statistiques
1. Accédez aux "Stats Rapides"
2. Filtrez par année/mois si nécessaire
3. Analysez les fréquences et pourcentages

### Générateur de grilles
1. Ouvrez le "🎰 Générateur Avancé"
2. Choisissez une stratégie ou générez toutes les stratégies
3. Analysez les grilles générées

## 🔄 Migration de données

L'application peut migrer les données depuis :
- **Fichiers CSV** : Format standardisé
- **API backend** : Si disponible
- **Données de test** : Pour les démonstrations

## 📊 Structure du projet

```
LOTTO/
├── frontend/                 # Application React
│   ├── src/
│   │   ├── components/      # Composants React
│   │   ├── pages/          # Pages principales
│   │   └── utils/          # Utilitaires et gestionnaires
│   └── package.json
├── backend/                 # API FastAPI (optionnel)
│   ├── app/
│   │   ├── routers/        # Routes API
│   │   └── models.py       # Modèles de données
│   └── requirements.txt
└── vercel.json             # Configuration Vercel
```

## 🚀 Déploiement

### Vercel (recommandé)
1. Connectez votre repository GitHub à Vercel
2. Configurez le dossier racine : `frontend`
3. Déployez automatiquement

### Autres plateformes
- **Netlify** : Compatible avec la configuration actuelle
- **GitHub Pages** : Nécessite une configuration SPA
- **Heroku** : Pour le backend + frontend

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Contactez l'équipe de développement

---

**Développé avec ❤️ pour les passionnés de loterie** 