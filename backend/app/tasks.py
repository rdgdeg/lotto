from celery import current_task
from ./celery_app import celery_app
from ./cache_manager import cache_manager
from ./database import SessionLocal
from ./models import DrawEuromillions, DrawLoto
from sqlalchemy import extract, func
from typing import Dict, List, Optional
import time
from datetime import datetime, timedelta
import json

@celery_app.task(bind=True)
def generate_advanced_grids(self, game_type: str, strategy: str, params: Dict) -> Dict:
    """
    Génère des grilles avancées de manière asynchrone
    
    Args:
        game_type: 'euromillions' ou 'lotto'
        strategy: Stratégie de génération
        params: Paramètres de génération
    """
    try:
        # Mettre à jour le statut de la tâche
        self.update_state(
            state='PROGRESS',
            meta={'current': 0, 'total': 100, 'status': 'Initialisation...'}
        )
        
        # Vérifier le cache d'abord
        cached_result = cache_manager.get_generation_cache(game_type, strategy, params)
        if cached_result:
            return {
                'status': 'success',
                'grids': cached_result,
                'cached': True,
                'message': 'Résultats récupérés du cache'
            }
        
        # Créer une session de base de données
        db = SessionLocal()
        
        try:
            # Récupérer les données selon le type de jeu
            if game_type == 'euromillions':
                draws = db.query(DrawEuromillions).order_by(DrawEuromillions.date.desc()).all()
            else:
                draws = db.query(DrawLoto).order_by(DrawLoto.date.desc()).all()
            
            self.update_state(
                state='PROGRESS',
                meta={'current': 20, 'total': 100, 'status': f'Analysant {len(draws)} tirages...'}
            )
            
            # Analyser les données selon la stratégie
            if strategy == 'frequency_based':
                grids = generate_frequency_based_grids(draws, game_type, params)
            elif strategy == 'gap_based':
                grids = generate_gap_based_grids(draws, game_type, params)
            elif strategy == 'combination_based':
                grids = generate_combination_based_grids(draws, game_type, params)
            else:
                grids = generate_random_grids(draws, game_type, params)
            
            self.update_state(
                state='PROGRESS',
                meta={'current': 80, 'total': 100, 'status': 'Finalisation...'}
            )
            
            # Mettre en cache les résultats
            cache_manager.set_generation_cache(game_type, strategy, grids, params)
            
            return {
                'status': 'success',
                'grids': grids,
                'cached': False,
                'strategy': strategy,
                'params': params,
                'total_draws_analyzed': len(draws)
            }
            
        finally:
            db.close()
            
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e),
            'message': 'Erreur lors de la génération des grilles'
        }

@celery_app.task
def update_daily_statistics():
    """Met à jour les statistiques quotidiennes"""
    try:
        db = SessionLocal()
        
        # Calculer les statistiques pour Euromillions
        euromillions_stats = calculate_daily_stats_euromillions(db)
        cache_manager.set_stats_cache('euromillions', euromillions_stats, ttl=86400)  # 24h
        
        # Calculer les statistiques pour Loto
        loto_stats = calculate_daily_stats_loto(db)
        cache_manager.set_stats_cache('lotto', loto_stats, ttl=86400)  # 24h
        
        db.close()
        
        return {
            'status': 'success',
            'message': 'Statistiques quotidiennes mises à jour',
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e),
            'message': 'Erreur lors de la mise à jour des statistiques'
        }

@celery_app.task
def clean_old_cache():
    """Nettoie l'ancien cache"""
    try:
        # Nettoyer le cache des générations (plus de 1 heure)
        euromillions_cleared = cache_manager.clear_generation_cache('euromillions')
        loto_cleared = cache_manager.clear_generation_cache('lotto')
        
        return {
            'status': 'success',
            'euromillions_cleared': euromillions_cleared,
            'lotto_cleared': loto_cleared,
            'message': 'Cache nettoyé avec succès'
        }
        
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e),
            'message': 'Erreur lors du nettoyage du cache'
        }

@celery_app.task
def generate_weekly_report():
    """Génère un rapport hebdomadaire"""
    try:
        db = SessionLocal()
        
        # Calculer les statistiques de la semaine
        week_start = datetime.now() - timedelta(days=7)
        
        euromillions_weekly = db.query(DrawEuromillions).filter(
            DrawEuromillions.date >= week_start
        ).all()
        
        loto_weekly = db.query(DrawLoto).filter(
            DrawLoto.date >= week_start
        ).all()
        
        report = {
            'period': 'weekly',
            'start_date': week_start.isoformat(),
            'end_date': datetime.now().isoformat(),
            'euromillions': {
                'total_draws': len(euromillions_weekly),
                'most_frequent_numbers': get_most_frequent_numbers(euromillions_weekly, 'euromillions'),
                'most_frequent_stars': get_most_frequent_stars(euromillions_weekly)
            },
            'lotto': {
                'total_draws': len(loto_weekly),
                'most_frequent_numbers': get_most_frequent_numbers(loto_weekly, 'lotto'),
                'most_frequent_complementaires': get_most_frequent_complementaires(loto_weekly)
            }
        }
        
        # Sauvegarder le rapport
        cache_manager.set('weekly_report', report, ttl=604800)  # 7 jours
        
        db.close()
        
        return {
            'status': 'success',
            'report': report,
            'message': 'Rapport hebdomadaire généré'
        }
        
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e),
            'message': 'Erreur lors de la génération du rapport'
        }

# Fonctions utilitaires pour la génération de grilles
def generate_frequency_based_grids(draws: List, game_type: str, params: Dict) -> List[Dict]:
    """Génère des grilles basées sur la fréquence"""
    num_grids = params.get('num_grids', 5)
    recent_draws = draws[:100]  # 100 derniers tirages
    
    # Calculer les fréquences
    number_freq = {}
    star_freq = {}
    
    for draw in recent_draws:
        if game_type == 'euromillions':
            numbers = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5]
            stars = [draw.e1, draw.e2]
        else:
            numbers = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6]
            stars = [draw.complementaire]
        
        for num in numbers:
            number_freq[num] = number_freq.get(num, 0) + 1
        
        for star in stars:
            star_freq[star] = star_freq.get(star, 0) + 1
    
    grids = []
    for _ in range(num_grids):
        # Sélectionner les numéros les plus fréquents
        sorted_numbers = sorted(number_freq.items(), key=lambda x: x[1], reverse=True)
        selected_numbers = [num for num, _ in sorted_numbers[:10]]  # Top 10
        
        # Sélectionner les étoiles les plus fréquentes
        sorted_stars = sorted(star_freq.items(), key=lambda x: x[1], reverse=True)
        selected_stars = [star for star, _ in sorted_stars[:5]]  # Top 5
        
        # Générer la grille
        import random
        if game_type == 'euromillions':
            grid_numbers = sorted(random.sample(selected_numbers, 5))
            grid_stars = sorted(random.sample(selected_stars, 2))
            grids.append({
                'numbers': grid_numbers,
                'stars': grid_stars,
                'strategy': 'frequency_based'
            })
        else:
            grid_numbers = sorted(random.sample(selected_numbers, 6))
            grid_complementaire = random.randint(1, 45)
            grids.append({
                'numbers': grid_numbers,
                'complementaire': grid_complementaire,
                'strategy': 'frequency_based'
            })
    
    return grids

def generate_gap_based_grids(draws: List, game_type: str, params: Dict) -> List[Dict]:
    """Génère des grilles basées sur les gaps (intervalles)"""
    num_grids = params.get('num_grids', 5)
    
    # Analyser les gaps pour chaque numéro
    gaps = analyze_number_gaps(draws, game_type)
    
    # Sélectionner les numéros avec les plus longs gaps
    overdue_numbers = sorted(gaps.items(), key=lambda x: x[1], reverse=True)[:15]
    overdue_nums = [num for num, _ in overdue_numbers]
    
    grids = []
    for _ in range(num_grids):
        import random
        if game_type == 'euromillions':
            grid_numbers = sorted(random.sample(overdue_nums, 5))
            grid_stars = sorted(random.sample(range(1, 13), 2))
            grids.append({
                'numbers': grid_numbers,
                'stars': grid_stars,
                'strategy': 'gap_based'
            })
        else:
            grid_numbers = sorted(random.sample(overdue_nums, 6))
            grid_complementaire = random.randint(1, 45)
            grids.append({
                'numbers': grid_numbers,
                'complementaire': grid_complementaire,
                'strategy': 'gap_based'
            })
    
    return grids

def generate_combination_based_grids(draws: List, game_type: str, params: Dict) -> List[Dict]:
    """Génère des grilles basées sur les combinaisons fréquentes"""
    num_grids = params.get('num_grids', 5)
    
    # Analyser les combinaisons fréquentes
    combinations = find_frequent_combinations(draws, game_type)
    
    grids = []
    for _ in range(num_grids):
        if combinations:
            # Utiliser une combinaison fréquente comme base
            base_combination = random.choice(combinations[:10])
            grid_numbers = list(base_combination)
            
            # Compléter avec des numéros aléatoires si nécessaire
            while len(grid_numbers) < (6 if game_type == 'lotto' else 5):
                import random
                new_num = random.randint(1, 49 if game_type == 'lotto' else 50)
                if new_num not in grid_numbers:
                    grid_numbers.append(new_num)
            
            grid_numbers = sorted(grid_numbers)
            
            if game_type == 'euromillions':
                grid_stars = sorted(random.sample(range(1, 13), 2))
                grids.append({
                    'numbers': grid_numbers,
                    'stars': grid_stars,
                    'strategy': 'combination_based'
                })
            else:
                grid_complementaire = random.randint(1, 45)
                grids.append({
                    'numbers': grid_numbers,
                    'complementaire': grid_complementaire,
                    'strategy': 'combination_based'
                })
    
    return grids

def generate_random_grids(draws: List, game_type: str, params: Dict) -> List[Dict]:
    """Génère des grilles aléatoires"""
    num_grids = params.get('num_grids', 5)
    
    grids = []
    for _ in range(num_grids):
        import random
        if game_type == 'euromillions':
            grid_numbers = sorted(random.sample(range(1, 51), 5))
            grid_stars = sorted(random.sample(range(1, 13), 2))
            grids.append({
                'numbers': grid_numbers,
                'stars': grid_stars,
                'strategy': 'random'
            })
        else:
            grid_numbers = sorted(random.sample(range(1, 50), 6))
            grid_complementaire = random.randint(1, 45)
            grids.append({
                'numbers': grid_numbers,
                'complementaire': grid_complementaire,
                'strategy': 'random'
            })
    
    return grids

# Fonctions utilitaires pour l'analyse
def analyze_number_gaps(draws: List, game_type: str) -> Dict[int, int]:
    """Analyse les gaps (intervalles) entre apparitions pour chaque numéro"""
    gaps = {}
    current_date = datetime.now().date()
    
    for draw in draws:
        if game_type == 'euromillions':
            numbers = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5]
        else:
            numbers = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6]
        
        for num in numbers:
            if num not in gaps:
                gaps[num] = (current_date - draw.date).days
    
    return gaps

def find_frequent_combinations(draws: List, game_type: str, size: int = 3) -> List[tuple]:
    """Trouve les combinaisons de numéros fréquentes"""
    from collections import Counter
    import itertools
    
    combinations = []
    for draw in draws:
        if game_type == 'euromillions':
            numbers = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5]
        else:
            numbers = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6]
        
        # Générer toutes les combinaisons de taille 'size'
        for combo in itertools.combinations(sorted(numbers), size):
            combinations.append(combo)
    
    # Compter les occurrences
    combo_counts = Counter(combinations)
    return [combo for combo, count in combo_counts.most_common(20)]

def calculate_daily_stats_euromillions(db) -> Dict:
    """Calcule les statistiques quotidiennes pour Euromillions"""
    today = datetime.now().date()
    yesterday = today - timedelta(days=1)
    
    # Tirages d'hier
    yesterday_draws = db.query(DrawEuromillions).filter(
        DrawEuromillions.date == yesterday
    ).all()
    
    return {
        'date': yesterday.isoformat(),
        'total_draws': len(yesterday_draws),
        'numbers_frequency': get_number_frequency(yesterday_draws, 'euromillions'),
        'stars_frequency': get_star_frequency(yesterday_draws)
    }

def calculate_daily_stats_loto(db) -> Dict:
    """Calcule les statistiques quotidiennes pour Loto"""
    today = datetime.now().date()
    yesterday = today - timedelta(days=1)
    
    # Tirages d'hier
    yesterday_draws = db.query(DrawLoto).filter(
        DrawLoto.date == yesterday
    ).all()
    
    return {
        'date': yesterday.isoformat(),
        'total_draws': len(yesterday_draws),
        'numbers_frequency': get_number_frequency(yesterday_draws, 'lotto'),
        'complementaires_frequency': get_complementaire_frequency(yesterday_draws)
    }

def get_number_frequency(draws: List, game_type: str) -> Dict[int, int]:
    """Calcule la fréquence des numéros"""
    freq = {}
    for draw in draws:
        if game_type == 'euromillions':
            numbers = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5]
        else:
            numbers = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6]
        
        for num in numbers:
            freq[num] = freq.get(num, 0) + 1
    
    return freq

def get_star_frequency(draws: List) -> Dict[int, int]:
    """Calcule la fréquence des étoiles"""
    freq = {}
    for draw in draws:
        stars = [draw.e1, draw.e2]
        for star in stars:
            freq[star] = freq.get(star, 0) + 1
    
    return freq

def get_complementaire_frequency(draws: List) -> Dict[int, int]:
    """Calcule la fréquence des numéros complémentaires"""
    freq = {}
    for draw in draws:
        comp = draw.complementaire
        freq[comp] = freq.get(comp, 0) + 1
    
    return freq

def get_most_frequent_numbers(draws: List, game_type: str) -> List[Dict]:
    """Retourne les numéros les plus fréquents"""
    freq = get_number_frequency(draws, game_type)
    sorted_freq = sorted(freq.items(), key=lambda x: x[1], reverse=True)
    
    return [
        {'numero': num, 'count': count, 'percentage': (count / len(draws)) * 100}
        for num, count in sorted_freq[:10]
    ]

def get_most_frequent_stars(draws: List) -> List[Dict]:
    """Retourne les étoiles les plus fréquentes"""
    freq = get_star_frequency(draws)
    sorted_freq = sorted(freq.items(), key=lambda x: x[1], reverse=True)
    
    return [
        {'numero': num, 'count': count, 'percentage': (count / len(draws)) * 100}
        for num, count in sorted_freq[:5]
    ]

def get_most_frequent_complementaires(draws: List) -> List[Dict]:
    """Retourne les numéros complémentaires les plus fréquents"""
    freq = get_complementaire_frequency(draws)
    sorted_freq = sorted(freq.items(), key=lambda x: x[1], reverse=True)
    
    return [
        {'numero': num, 'count': count, 'percentage': (count / len(draws)) * 100}
        for num, count in sorted_freq[:5]
    ] 