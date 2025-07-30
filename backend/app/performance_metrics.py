import time
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from app.database import SessionLocal
from .models import DrawEuromillions, DrawLoto
from .cache_manager import cache_manager
import json

class PerformanceMetrics:
    """Système de métriques de performance pour les générations"""
    
    def __init__(self):
        self.metrics = {}
    
    def start_timer(self, operation: str) -> str:
        """Démarre un chronomètre pour une opération"""
        timer_id = f"{operation}_{int(time.time())}"
        self.metrics[timer_id] = {
            'operation': operation,
            'start_time': time.time(),
            'status': 'running'
        }
        return timer_id
    
    def end_timer(self, timer_id: str, success: bool = True, metadata: Dict = None) -> Dict:
        """Termine un chronomètre et calcule les métriques"""
        if timer_id not in self.metrics:
            return {}
        
        end_time = time.time()
        duration = end_time - self.metrics[timer_id]['start_time']
        
        self.metrics[timer_id].update({
            'end_time': end_time,
            'duration': duration,
            'success': success,
            'metadata': metadata or {},
            'status': 'completed'
        })
        
        return self.metrics[timer_id]
    
    def calculate_prediction_accuracy(self, predictions: List[Dict], actual_results: List[Dict], game_type: str) -> Dict:
        """Calcule la précision des prédictions"""
        if not predictions or not actual_results:
            return {
                'total_predictions': 0,
                'accuracy_rate': 0.0,
                'correct_numbers': 0,
                'correct_stars': 0,
                'partial_matches': 0
            }
        
        total_predictions = len(predictions)
        correct_numbers = 0
        correct_stars = 0
        partial_matches = 0
        
        for pred, actual in zip(predictions, actual_results):
            if game_type == 'euromillions':
                pred_numbers = set(pred.get('numbers', []))
                pred_stars = set(pred.get('stars', []))
                actual_numbers = {actual.n1, actual.n2, actual.n3, actual.n4, actual.n5}
                actual_stars = {actual.e1, actual.e2}
            else:
                pred_numbers = set(pred.get('numbers', []))
                pred_complementaire = pred.get('complementaire')
                actual_numbers = {actual.n1, actual.n2, actual.n3, actual.n4, actual.n5, actual.n6}
                actual_complementaire = actual.complementaire
            
            # Compter les correspondances
            num_matches = len(pred_numbers & actual_numbers)
            correct_numbers += num_matches
            
            if game_type == 'euromillions':
                star_matches = len(pred_stars & actual_stars)
                correct_stars += star_matches
                
                # Considérer comme match partiel si au moins 3 numéros ou 1 étoile
                if num_matches >= 3 or star_matches >= 1:
                    partial_matches += 1
            else:
                if pred_complementaire == actual_complementaire:
                    correct_stars += 1
                
                # Considérer comme match partiel si au moins 3 numéros
                if num_matches >= 3:
                    partial_matches += 1
        
        accuracy_rate = (partial_matches / total_predictions) * 100 if total_predictions > 0 else 0
        
        return {
            'total_predictions': total_predictions,
            'accuracy_rate': round(accuracy_rate, 2),
            'correct_numbers': correct_numbers,
            'correct_stars': correct_stars,
            'partial_matches': partial_matches,
            'average_numbers_per_prediction': round(correct_numbers / total_predictions, 2) if total_predictions > 0 else 0,
            'average_stars_per_prediction': round(correct_stars / total_predictions, 2) if total_predictions > 0 else 0
        }
    
    def analyze_strategy_performance(self, strategy: str, game_type: str, days: int = 30) -> Dict:
        """Analyse la performance d'une stratégie sur une période donnée"""
        db = SessionLocal()
        
        try:
            # Récupérer les tirages récents
            start_date = datetime.now() - timedelta(days=days)
            
            if game_type == 'euromillions':
                recent_draws = db.query(DrawEuromillions).filter(
                    DrawEuromillions.date >= start_date
                ).order_by(DrawEuromillions.date.desc()).all()
            else:
                recent_draws = db.query(DrawLoto).filter(
                    DrawLoto.date >= start_date
                ).order_by(DrawLoto.date.desc()).all()
            
            # Récupérer les prédictions de cette stratégie depuis le cache
            predictions = self.get_strategy_predictions(strategy, game_type, days)
            
            if not predictions:
                return {
                    'strategy': strategy,
                    'game_type': game_type,
                    'period_days': days,
                    'total_draws': len(recent_draws),
                    'total_predictions': 0,
                    'accuracy_rate': 0.0,
                    'message': 'Aucune prédiction trouvée pour cette stratégie'
                }
            
            # Calculer la précision
            accuracy = self.calculate_prediction_accuracy(predictions, recent_draws, game_type)
            
            return {
                'strategy': strategy,
                'game_type': game_type,
                'period_days': days,
                'total_draws': len(recent_draws),
                'total_predictions': accuracy['total_predictions'],
                'accuracy_rate': accuracy['accuracy_rate'],
                'correct_numbers': accuracy['correct_numbers'],
                'correct_stars': accuracy['correct_stars'],
                'partial_matches': accuracy['partial_matches'],
                'average_numbers_per_prediction': accuracy['average_numbers_per_prediction'],
                'average_stars_per_prediction': accuracy['average_stars_per_prediction']
            }
            
        finally:
            db.close()
    
    def get_strategy_predictions(self, strategy: str, game_type: str, days: int) -> List[Dict]:
        """Récupère les prédictions d'une stratégie depuis le cache"""
        # Cette fonction simule la récupération des prédictions
        # En réalité, il faudrait stocker les prédictions dans la base de données
        return []
    
    def track_generation_performance(self, strategy: str, game_type: str, params: Dict, 
                                   generation_time: float, cache_hit: bool) -> Dict:
        """Enregistre les métriques de performance d'une génération"""
        metric = {
            'strategy': strategy,
            'game_type': game_type,
            'params': params,
            'generation_time': generation_time,
            'cache_hit': cache_hit,
            'timestamp': datetime.now().isoformat(),
            'success': True
        }
        
        # Stocker en cache pour analyse
        cache_key = f"performance:{strategy}:{game_type}:{int(time.time())}"
        cache_manager.set(cache_key, metric, ttl=86400)  # 24h
        
        return metric
    
    def get_performance_summary(self, game_type: str, days: int = 7) -> Dict:
        """Récupère un résumé des performances"""
        # Récupérer les métriques depuis le cache
        performance_keys = cache_manager.redis_client.keys(f"performance:*:{game_type}:*")
        
        if not performance_keys:
            return {
                'game_type': game_type,
                'period_days': days,
                'total_generations': 0,
                'average_generation_time': 0,
                'cache_hit_rate': 0,
                'strategies_used': []
            }
        
        performances = []
        for key in performance_keys:
            metric = cache_manager.get(key)
            if metric:
                performances.append(metric)
        
        if not performances:
            return {
                'game_type': game_type,
                'period_days': days,
                'total_generations': 0,
                'average_generation_time': 0,
                'cache_hit_rate': 0,
                'strategies_used': []
            }
        
        # Calculer les statistiques
        total_generations = len(performances)
        cache_hits = sum(1 for p in performances if p.get('cache_hit', False))
        cache_hit_rate = (cache_hits / total_generations) * 100 if total_generations > 0 else 0
        
        generation_times = [p.get('generation_time', 0) for p in performances]
        avg_generation_time = sum(generation_times) / len(generation_times) if generation_times else 0
        
        strategies_used = list(set(p.get('strategy', 'unknown') for p in performances))
        
        return {
            'game_type': game_type,
            'period_days': days,
            'total_generations': total_generations,
            'average_generation_time': round(avg_generation_time, 3),
            'cache_hit_rate': round(cache_hit_rate, 2),
            'strategies_used': strategies_used,
            'fastest_generation': min(generation_times) if generation_times else 0,
            'slowest_generation': max(generation_times) if generation_times else 0
        }
    
    def get_cache_performance(self) -> Dict:
        """Récupère les métriques de performance du cache"""
        cache_info = cache_manager.get_cache_info()
        
        if not cache_info.get('connected', False):
            return {
                'cache_status': 'disconnected',
                'message': 'Cache Redis non disponible'
            }
        
        hits = cache_info.get('keyspace_hits', 0)
        misses = cache_info.get('keyspace_misses', 0)
        total_requests = hits + misses
        hit_rate = (hits / total_requests) * 100 if total_requests > 0 else 0
        
        return {
            'cache_status': 'connected',
            'used_memory': cache_info.get('used_memory', 'N/A'),
            'total_requests': total_requests,
            'cache_hits': hits,
            'cache_misses': misses,
            'hit_rate': round(hit_rate, 2),
            'total_connections': cache_info.get('total_connections_received', 0),
            'total_commands': cache_info.get('total_commands_processed', 0)
        }

# Instance globale des métriques de performance
performance_metrics = PerformanceMetrics() 