# Backend - Générateur de Grilles Loto & Euromillions

## 🚀 Configuration Supabase

L'application utilise **Supabase** comme base de données PostgreSQL hébergée.

### Configuration automatique

Les credentials Supabase sont déjà configurés dans `config.py` :
- **URL** : https://njmwuyirykeywdiwcgtv.supabase.co
- **Clés** : Configurées automatiquement

## Installation

1. **Créer un environnement virtuel :**
```bash
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
```

2. **Installer les dépendances :**
```bash
pip install -r requirements.txt
```

3. **Tester la connexion Supabase :**
```bash
python test_supabase.py
```

4. **Créer les tables (si nécessaire) :**
```bash
python create_tables.py
```

## Lancement

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Structure de la Base de Données

### Tables créées automatiquement :

#### `draws_euromillions`
- `id` : Clé primaire
- `date` : Date du tirage
- `n1, n2, n3, n4, n5` : Numéros (1-50)
- `e1, e2` : Étoiles (1-12)

#### `draws_loto`
- `id` : Clé primaire
- `date` : Date du tirage
- `n1, n2, n3, n4, n5, n6` : Numéros (1-45)
- `complementaire` : Numéro complémentaire (1-45)

#### `stats`
- `id` : Clé primaire
- `jeu` : 'euromillions' ou 'loto'
- `numero` : Numéro analysé
- `type` : 'numero', 'etoile', 'complementaire'
- `frequence` : Fréquence calculée
- `periode` : Période d'analyse

## Endpoints API

### Import de données
- `POST /api/import/` - Importer des fichiers CSV (tirages ou statistiques)

### Euromillions
- `GET /api/euromillions/generate` - Générer des grilles
- `GET /api/euromillions/stats` - Obtenir les statistiques
- `POST /api/euromillions/simulate` - Simuler les gains

### Loto
- `GET /api/loto/generate` - Générer des grilles
- `GET /api/loto/stats` - Obtenir les statistiques
- `POST /api/loto/simulate` - Simuler les gains

## Documentation API
- Swagger UI : http://localhost:8000/docs
- ReDoc : http://localhost:8000/redoc

## 🔧 Dépannage

### Erreur de connexion Supabase
1. Vérifiez que `test_supabase.py` fonctionne
2. Vérifiez les credentials dans `config.py`
3. Vérifiez la connectivité réseau

### Erreur de création de tables
1. Exécutez `python create_tables.py`
2. Vérifiez les permissions Supabase
3. Vérifiez que la base de données est active

### Variables d'environnement (optionnel)
Créez un fichier `.env` pour personnaliser la configuration :
```env
SUPABASE_URL=votre_url
SUPABASE_ANON_KEY=votre_clé_anon
SUPABASE_SECRET_KEY=votre_clé_secrète
DEBUG=True
HOST=0.0.0.0
PORT=8000
``` 