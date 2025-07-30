from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .models import DrawEuromillions, DrawLoto
from .cache_manager import cache_manager
import numpy as np
from collections import defaultdict, Counter
import json

class GapAnalysis:
    """Analyse des gaps (intervalles) pour prédire les numéros"""
    
    def __init__(self):
        self.gap_patterns = {}
        self.number_gaps = {}
        self.prediction_weights = {}
    
    def analyze_number_gaps(self, draws: List, game_type: str) -> Dict:
        """
        Analyse les gaps pour chaque numéro
        
        Args:
            draws: Liste des tirages
            game_type: 'euromillions' ou 'lotto'
        
        Returns:
            Dictionnaire avec l'analyse des gaps par numéro
        """
        if not draws:
            return {}
        
        # Trier les tirages par date
        sorted_draws = sorted(draws, key=lambda x: x.date)
        
        # Initialiser les structures de données
        number_appearances = defaultdict(list)
        gap_analysis = {}
        
        # Collecter toutes les apparitions de chaque numéro
        for draw in sorted_draws:
            if game_type == 'euromillions':
                numbers = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5]
            else:
                numbers = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6]
            
            for num in numbers:
                number_appearances[num].append(draw.date)
        
        # Analyser les gaps pour chaque numéro
        max_number = 50 if game_type == 'euromillions' else 49
        
        for num in range(1, max_number + 1):
            appearances = number_appearances[num]
            
            if len(appearances) < 2:
                # Numéro qui n'est apparu qu'une fois ou jamais
                gap_analysis[num] = {
                    'total_appearances': len(appearances),
                    'average_gap': None,
                    'current_gap': None,
                    'max_gap': None,
                    'min_gap': None,
                    'gap_pattern': [],
                    'last_appearance': appearances[-1] if appearances else None,
                    'overdue_factor': 0,
                    'prediction_score': 0
                }
                continue
            
            # Calculer les gaps entre apparitions
            gaps = []
            for i in range(1, len(appearances)):
                gap = (appearances[i] - appearances[i-1]).days
                gaps.append(gap)
            
            # Calculer les statistiques des gaps
            avg_gap = np.mean(gaps)
            max_gap = max(gaps)
            min_gap = min(gaps)
            
            # Calculer le gap actuel
            last_appearance = appearances[-1]
            current_date = datetime.now().date()
            current_gap = (current_date - last_appearance).days
            
            # Calculer le facteur de retard
            overdue_factor = current_gap / avg_gap if avg_gap > 0 else 0
            
            # Analyser le pattern des gaps
            gap_pattern = self._analyze_gap_pattern(gaps)
            
            # Calculer le score de prédiction
            prediction_score = self._calculate_prediction_score(
                current_gap, avg_gap, overdue_factor, len(appearances)
            )
            
            gap_analysis[num] = {
                'total_appearances': len(appearances),
                'average_gap': round(avg_gap, 1),
                'current_gap': current_gap,
                'max_gap': max_gap,
                'min_gap': min_gap,
                'gap_pattern': gap_pattern,
                'last_appearance': last_appearance,
                'overdue_factor': round(overdue_factor, 2),
                'prediction_score': round(prediction_score, 3)
            }
        
        return gap_analysis
    
    def _analyze_gap_pattern(self, gaps: List[int]) -> Dict:
        """Analyse le pattern des gaps"""
        if not gaps:
            return {}
        
        # Calculer les statistiques
        gaps_array = np.array(gaps)
        
        # Identifier les tendances
        trend = "stable"
        if len(gaps) > 1:
            slope = np.polyfit(range(len(gaps)), gaps, 1)[0]
            if slope > 1:
                trend = "increasing"
            elif slope < -1:
                trend = "decreasing"
        
        # Identifier les cycles
        cycle_length = self._find_cycle_length(gaps)
        
        # Analyser la distribution
        gaps_counter = Counter(gaps)
        most_common_gaps = gaps_counter.most_common(3)
        
        return {
            'trend': trend,
            'cycle_length': cycle_length,
            'most_common_gaps': most_common_gaps,
            'standard_deviation': round(np.std(gaps_array), 1),
            'variance': round(np.var(gaps_array), 1)
        }
    
    def _find_cycle_length(self, gaps: List[int]) -> Optional[int]:
        """Trouve la longueur du cycle dans les gaps"""
        if len(gaps) < 4:
            return None
        
        # Utiliser l'autocorrélation pour détecter les cycles
        for cycle_len in range(2, min(len(gaps) // 2, 20)):
            correlations = []
            for i in range(len(gaps) - cycle_len):
                corr = np.corrcoef(gaps[i:i+cycle_len], gaps[i+cycle_len:i+2*cycle_len])[0, 1]
                if not np.isnan(corr):
                    correlations.append(corr)
            
            if correlations and np.mean(correlations) > 0.7:
                return cycle_len
        
        return None
    
    def _calculate_prediction_score(self, current_gap: int, avg_gap: float, 
                                  overdue_factor: float, total_appearances: int) -> float:
        """
        Calcule un score de prédiction basé sur plusieurs facteurs
        
        Args:
            current_gap: Gap actuel en jours
            avg_gap: Gap moyen historique
            overdue_factor: Facteur de retard
            total_appearances: Nombre total d'apparitions
        
        Returns:
            Score de prédiction entre 0 et 1
        """
        # Facteur de retard (plus le numéro est en retard, plus il a de chances)
        overdue_score = min(overdue_factor / 2, 1.0) if overdue_factor > 0 else 0
        
        # Facteur de fréquence (numéros qui apparaissent régulièrement)
        frequency_score = min(total_appearances / 50, 1.0)
        
        # Facteur de stabilité (gaps réguliers)
        stability_score = 1.0 - min(current_gap / (avg_gap * 3), 1.0) if avg_gap > 0 else 0.5
        
        # Combiner les scores avec des poids
        final_score = (
            overdue_score * 0.4 +
            frequency_score * 0.3 +
            stability_score * 0.3
        )
        
        return final_score
    
    def predict_next_numbers(self, gap_analysis: Dict, game_type: str, 
                           num_predictions: int = 10) -> List[Dict]:
        """
        Prédit les prochains numéros basés sur l'analyse des gaps
        
        Args:
            gap_analysis: Résultat de l'analyse des gaps
            game_type: 'euromillions' ou 'lotto'
            num_predictions: Nombre de prédictions à générer
        
        Returns:
            Liste des prédictions avec scores
        """
        if not gap_analysis:
            return []
        
        # Trier les numéros par score de prédiction
        sorted_numbers = sorted(
            gap_analysis.items(),
            key=lambda x: x[1]['prediction_score'],
            reverse=True
        )
        
        predictions = []
        numbers_per_grid = 5 if game_type == 'euromillions' else 6
        
        for i in range(num_predictions):
            # Sélectionner les meilleurs numéros pour cette prédiction
            selected_numbers = []
            used_numbers = set()
            
            # Prendre les numéros avec les meilleurs scores
            for num, analysis in sorted_numbers:
                if len(selected_numbers) >= numbers_per_grid:
                    break
                
                if num not in used_numbers:
                    selected_numbers.append({
                        'numero': num,
                        'score': analysis['prediction_score'],
                        'current_gap': analysis['current_gap'],
                        'overdue_factor': analysis['overdue_factor']
                    })
                    used_numbers.add(num)
            
            # Compléter avec des numéros aléatoires si nécessaire
            while len(selected_numbers) < numbers_per_grid:
                import random
                remaining_numbers = [
                    num for num in range(1, 51 if game_type == 'euromillions' else 50)
                    if num not in used_numbers
                ]
                
                if remaining_numbers:
                    random_num = random.choice(remaining_numbers)
                    selected_numbers.append({
                        'numero': random_num,
                        'score': 0.1,  # Score faible pour les numéros aléatoires
                        'current_gap': gap_analysis.get(random_num, {}).get('current_gap', 0),
                        'overdue_factor': gap_analysis.get(random_num, {}).get('overdue_factor', 0)
                    })
                    used_numbers.add(random_num)
            
            # Calculer le score global de la prédiction
            avg_score = np.mean([num['score'] for num in selected_numbers])
            
            predictions.append({
                'prediction_id': i + 1,
                'numbers': sorted(selected_numbers, key=lambda x: x['numero']),
                'average_score': round(avg_score, 3),
                'strategy': 'gap_based',
                'confidence': self._calculate_confidence(selected_numbers)
            })
        
        return predictions
    
    def _calculate_confidence(self, selected_numbers: List[Dict]) -> str:
        """Calcule le niveau de confiance de la prédiction"""
        avg_score = np.mean([num['score'] for num in selected_numbers])
        
        if avg_score > 0.7:
            return "Élevée"
        elif avg_score > 0.5:
            return "Moyenne"
        elif avg_score > 0.3:
            return "Faible"
        else:
            return "Très faible"
    
    def get_gap_statistics(self, gap_analysis: Dict) -> Dict:
        """Calcule des statistiques globales sur les gaps"""
        if not gap_analysis:
            return {}
        
        # Statistiques générales
        total_numbers = len(gap_analysis)
        overdue_numbers = sum(1 for analysis in gap_analysis.values() 
                            if analysis.get('overdue_factor', 0) > 1.5)
        
        # Numéros les plus en retard
        most_overdue = sorted(
            gap_analysis.items(),
            key=lambda x: x[1].get('overdue_factor', 0),
            reverse=True
        )[:10]
        
        # Numéros avec les meilleurs scores
        best_scores = sorted(
            gap_analysis.items(),
            key=lambda x: x[1].get('prediction_score', 0),
            reverse=True
        )[:10]
        
        # Gaps moyens par décile
        gaps_by_decile = defaultdict(list)
        for num, analysis in gap_analysis.items():
            if analysis.get('average_gap'):
                decile = (num - 1) // 5  # Déciles de 5 numéros
                gaps_by_decile[decile].append(analysis['average_gap'])
        
        avg_gaps_by_decile = {
            f"décile_{i+1}": round(np.mean(gaps), 1)
            for i, gaps in gaps_by_decile.items()
        }
        
        return {
            'total_numbers_analyzed': total_numbers,
            'overdue_numbers': overdue_numbers,
            'overdue_percentage': round((overdue_numbers / total_numbers) * 100, 1),
            'most_overdue_numbers': [
                {
                    'numero': num,
                    'overdue_factor': analysis.get('overdue_factor', 0),
                    'current_gap': analysis.get('current_gap', 0)
                }
                for num, analysis in most_overdue
            ],
            'best_prediction_scores': [
                {
                    'numero': num,
                    'prediction_score': analysis.get('prediction_score', 0),
                    'current_gap': analysis.get('current_gap', 0)
                }
                for num, analysis in best_scores
            ],
            'average_gaps_by_decile': avg_gaps_by_decile
        }

# Instance globale de l'analyseur de gaps
gap_analyzer = GapAnalysis() 