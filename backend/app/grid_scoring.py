from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .models import DrawEuromillions, DrawLoto
from .cache_manager import cache_manager
from .gap_analysis import gap_analyzer
from .combination_analysis import combination_analyzer
import numpy as np
from collections import defaultdict, Counter
import json

class GridScoring:
    """Système de scoring avancé pour les grilles de loterie"""
    
    def __init__(self):
        self.scoring_weights = {
            'gap_score': 0.25,
            'combination_score': 0.20,
            'frequency_score': 0.15,
            'distribution_score': 0.15,
            'pattern_score': 0.15,
            'balance_score': 0.10
        }
        self.historical_performance = {}
    
    def score_grid(self, grid_numbers: List[int], game_type: str, 
                  gap_analysis: Dict = None, combination_analysis: Dict = None,
                  historical_draws: List = None) -> Dict:
        """
        Score une grille complète avec tous les critères
        
        Args:
            grid_numbers: Numéros de la grille
            game_type: 'euromillions' ou 'lotto'
            gap_analysis: Analyse des gaps (optionnel)
            combination_analysis: Analyse des combinaisons (optionnel)
            historical_draws: Tirages historiques (optionnel)
        
        Returns:
            Dictionnaire avec le score détaillé
        """
        if not grid_numbers:
            return {'total_score': 0, 'details': {}}
        
        scores = {}
        
        # 1. Score basé sur les gaps
        if gap_analysis:
            scores['gap_score'] = self._calculate_gap_score(grid_numbers, gap_analysis)
        else:
            scores['gap_score'] = 0.5  # Score neutre
        
        # 2. Score basé sur les combinaisons
        if combination_analysis:
            scores['combination_score'] = self._calculate_combination_score(
                grid_numbers, combination_analysis
            )
        else:
            scores['combination_score'] = 0.5  # Score neutre
        
        # 3. Score basé sur la fréquence
        if historical_draws:
            scores['frequency_score'] = self._calculate_frequency_score(
                grid_numbers, historical_draws, game_type
            )
        else:
            scores['frequency_score'] = 0.5  # Score neutre
        
        # 4. Score de distribution
        scores['distribution_score'] = self._calculate_distribution_score(grid_numbers, game_type)
        
        # 5. Score de pattern
        scores['pattern_score'] = self._calculate_pattern_score(grid_numbers, game_type)
        
        # 6. Score d'équilibre
        scores['balance_score'] = self._calculate_balance_score(grid_numbers, game_type)
        
        # Calculer le score total pondéré
        total_score = sum(
            scores[metric] * self.scoring_weights[metric]
            for metric in scores.keys()
        )
        
        # Calculer le niveau de confiance
        confidence = self._calculate_confidence_level(total_score, scores)
        
        # Générer des recommandations
        recommendations = self._generate_recommendations(scores, grid_numbers)
        
        return {
            'total_score': round(total_score, 3),
            'confidence_level': confidence,
            'scores': {k: round(v, 3) for k, v in scores.items()},
            'weights': self.scoring_weights,
            'recommendations': recommendations,
            'grid_analysis': {
                'numbers': sorted(grid_numbers),
                'sum': sum(grid_numbers),
                'average': round(np.mean(grid_numbers), 1),
                'range': max(grid_numbers) - min(grid_numbers),
                'even_odd_ratio': self._calculate_even_odd_ratio(grid_numbers),
                'high_low_ratio': self._calculate_high_low_ratio(grid_numbers, game_type)
            }
        }
    
    def _calculate_gap_score(self, grid_numbers: List[int], gap_analysis: Dict) -> float:
        """Calcule le score basé sur l'analyse des gaps"""
        if not gap_analysis:
            return 0.5
        
        scores = []
        for num in grid_numbers:
            if num in gap_analysis:
                analysis = gap_analysis[num]
                prediction_score = analysis.get('prediction_score', 0)
                overdue_factor = analysis.get('overdue_factor', 0)
                
                # Score basé sur la prédiction et le retard
                gap_score = prediction_score * (1 + min(overdue_factor / 2, 0.5))
                scores.append(gap_score)
            else:
                scores.append(0.1)  # Score faible pour les numéros non analysés
        
        return np.mean(scores) if scores else 0.5
    
    def _calculate_combination_score(self, grid_numbers: List[int], 
                                   combination_analysis: Dict) -> float:
        """Calcule le score basé sur les combinaisons fréquentes"""
        if not combination_analysis:
            return 0.5
        
        grid_set = set(grid_numbers)
        combination_scores = []
        
        for size, analysis in combination_analysis.items():
            for combo_info in analysis.get('frequent_combinations', []):
                combo_set = set(combo_info['combination'])
                intersection = grid_set & combo_set
                
                if len(intersection) >= 2:  # Au moins 2 numéros en commun
                    overlap_ratio = len(intersection) / len(combo_set)
                    combination_scores.append(combo_info['score'] * overlap_ratio)
        
        return np.mean(combination_scores) if combination_scores else 0.5
    
    def _calculate_frequency_score(self, grid_numbers: List[int], 
                                 historical_draws: List, game_type: str) -> float:
        """Calcule le score basé sur la fréquence historique"""
        if not historical_draws:
            return 0.5
        
        # Calculer la fréquence de chaque numéro
        number_frequency = defaultdict(int)
        total_draws = len(historical_draws)
        
        for draw in historical_draws:
            if game_type == 'euromillions':
                numbers = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5]
            else:
                numbers = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6]
            
            for num in numbers:
                number_frequency[num] += 1
        
        # Calculer le score de fréquence pour la grille
        grid_frequencies = []
        for num in grid_numbers:
            frequency = number_frequency.get(num, 0)
            frequency_ratio = frequency / total_draws
            grid_frequencies.append(frequency_ratio)
        
        # Score basé sur la fréquence moyenne et l'équilibre
        avg_frequency = np.mean(grid_frequencies)
        frequency_balance = 1.0 - np.std(grid_frequencies)  # Moins de variance = plus équilibré
        
        return (avg_frequency * 0.7 + frequency_balance * 0.3)
    
    def _calculate_distribution_score(self, grid_numbers: List[int], game_type: str) -> float:
        """Calcule le score de distribution des numéros"""
        max_number = 50 if game_type == 'euromillions' else 49
        
        # Distribution par déciles
        deciles = defaultdict(int)
        for num in grid_numbers:
            decile = (num - 1) // 5  # Déciles de 5 numéros
            deciles[decile] += 1
        
        # Score basé sur l'équilibre des déciles
        ideal_per_decile = len(grid_numbers) / 10  # 10 déciles
        decile_balance = 1.0 - np.std(list(deciles.values())) / ideal_per_decile
        
        # Score basé sur la couverture
        coverage = len(deciles) / 10  # Pourcentage de déciles couverts
        
        return (decile_balance * 0.6 + coverage * 0.4)
    
    def _calculate_pattern_score(self, grid_numbers: List[int], game_type: str) -> float:
        """Calcule le score basé sur les patterns numériques"""
        sorted_numbers = sorted(grid_numbers)
        
        # Pattern des différences entre numéros consécutifs
        differences = []
        for i in range(1, len(sorted_numbers)):
            diff = sorted_numbers[i] - sorted_numbers[i-1]
            differences.append(diff)
        
        if not differences:
            return 0.5
        
        # Score basé sur la régularité des différences
        avg_diff = np.mean(differences)
        diff_variance = np.var(differences)
        
        # Moins de variance = pattern plus régulier
        regularity_score = 1.0 / (1.0 + diff_variance / avg_diff) if avg_diff > 0 else 0.5
        
        # Score basé sur l'absence de patterns trop évidents
        consecutive_count = 0
        for i in range(1, len(sorted_numbers)):
            if sorted_numbers[i] == sorted_numbers[i-1] + 1:
                consecutive_count += 1
        
        consecutive_penalty = consecutive_count / len(sorted_numbers)
        
        return regularity_score * (1.0 - consecutive_penalty)
    
    def _calculate_balance_score(self, grid_numbers: List[int], game_type: str) -> float:
        """Calcule le score d'équilibre de la grille"""
        max_number = 50 if game_type == 'euromillions' else 49
        mid_point = max_number / 2
        
        # Équilibre haut/bas
        low_numbers = sum(1 for num in grid_numbers if num <= mid_point)
        high_numbers = len(grid_numbers) - low_numbers
        balance_ratio = min(low_numbers, high_numbers) / max(low_numbers, high_numbers)
        
        # Équilibre pair/impair
        even_numbers = sum(1 for num in grid_numbers if num % 2 == 0)
        odd_numbers = len(grid_numbers) - even_numbers
        even_odd_ratio = min(even_numbers, odd_numbers) / max(even_numbers, odd_numbers)
        
        # Équilibre des sommes
        total_sum = sum(grid_numbers)
        ideal_sum = (max_number + 1) * len(grid_numbers) / 2
        sum_balance = 1.0 - abs(total_sum - ideal_sum) / ideal_sum
        
        return (balance_ratio * 0.4 + even_odd_ratio * 0.4 + sum_balance * 0.2)
    
    def _calculate_even_odd_ratio(self, numbers: List[int]) -> Dict:
        """Calcule le ratio pair/impair"""
        even_count = sum(1 for num in numbers if num % 2 == 0)
        odd_count = len(numbers) - even_count
        
        return {
            'even': even_count,
            'odd': odd_count,
            'ratio': f"{even_count}:{odd_count}"
        }
    
    def _calculate_high_low_ratio(self, numbers: List[int], game_type: str) -> Dict:
        """Calcule le ratio haut/bas"""
        max_number = 50 if game_type == 'euromillions' else 49
        mid_point = max_number / 2
        
        low_count = sum(1 for num in numbers if num <= mid_point)
        high_count = len(numbers) - low_count
        
        return {
            'low': low_count,
            'high': high_count,
            'ratio': f"{low_count}:{high_count}"
        }
    
    def _calculate_confidence_level(self, total_score: float, scores: Dict) -> str:
        """Calcule le niveau de confiance basé sur le score total"""
        if total_score >= 0.8:
            return "Excellente"
        elif total_score >= 0.7:
            return "Très bonne"
        elif total_score >= 0.6:
            return "Bonne"
        elif total_score >= 0.5:
            return "Moyenne"
        elif total_score >= 0.4:
            return "Faible"
        else:
            return "Très faible"
    
    def _generate_recommendations(self, scores: Dict, grid_numbers: List[int]) -> List[str]:
        """Génère des recommandations basées sur les scores"""
        recommendations = []
        
        # Recommandations basées sur les scores faibles
        if scores.get('gap_score', 0) < 0.4:
            recommendations.append("Considérer des numéros avec de meilleurs gaps")
        
        if scores.get('combination_score', 0) < 0.4:
            recommendations.append("Inclure plus de combinaisons fréquentes")
        
        if scores.get('distribution_score', 0) < 0.4:
            recommendations.append("Améliorer la distribution sur les déciles")
        
        if scores.get('pattern_score', 0) < 0.4:
            recommendations.append("Éviter les patterns trop réguliers")
        
        if scores.get('balance_score', 0) < 0.4:
            recommendations.append("Équilibrer les numéros pairs/impairs et haut/bas")
        
        # Recommandations positives
        if scores.get('gap_score', 0) > 0.7:
            recommendations.append("✅ Excellente sélection basée sur les gaps")
        
        if scores.get('combination_score', 0) > 0.7:
            recommendations.append("✅ Bonnes combinaisons fréquentes incluses")
        
        if scores.get('distribution_score', 0) > 0.7:
            recommendations.append("✅ Distribution équilibrée")
        
        if not recommendations:
            recommendations.append("Grille équilibrée avec des scores moyens")
        
        return recommendations
    
    def compare_grids(self, grids: List[List[int]], game_type: str,
                     gap_analysis: Dict = None, combination_analysis: Dict = None,
                     historical_draws: List = None) -> List[Dict]:
        """
        Compare plusieurs grilles et les classe par score
        
        Args:
            grids: Liste de grilles à comparer
            game_type: 'euromillions' ou 'lotto'
            gap_analysis: Analyse des gaps (optionnel)
            combination_analysis: Analyse des combinaisons (optionnel)
            historical_draws: Tirages historiques (optionnel)
        
        Returns:
            Liste des grilles classées par score
        """
        scored_grids = []
        
        for i, grid in enumerate(grids):
            score_result = self.score_grid(
                grid, game_type, gap_analysis, combination_analysis, historical_draws
            )
            
            scored_grids.append({
                'grid_id': i + 1,
                'numbers': grid,
                'score': score_result['total_score'],
                'confidence': score_result['confidence_level'],
                'details': score_result
            })
        
        # Trier par score décroissant
        scored_grids.sort(key=lambda x: x['score'], reverse=True)
        
        return scored_grids
    
    def get_scoring_statistics(self, scored_grids: List[Dict]) -> Dict:
        """Calcule des statistiques sur les scores des grilles"""
        if not scored_grids:
            return {}
        
        scores = [grid['score'] for grid in scored_grids]
        
        return {
            'total_grids': len(scored_grids),
            'average_score': round(np.mean(scores), 3),
            'median_score': round(np.median(scores), 3),
            'best_score': round(max(scores), 3),
            'worst_score': round(min(scores), 3),
            'standard_deviation': round(np.std(scores), 3),
            'score_distribution': {
                'excellent': sum(1 for s in scores if s >= 0.8),
                'very_good': sum(1 for s in scores if 0.7 <= s < 0.8),
                'good': sum(1 for s in scores if 0.6 <= s < 0.7),
                'average': sum(1 for s in scores if 0.5 <= s < 0.6),
                'poor': sum(1 for s in scores if s < 0.5)
            }
        }

# Instance globale du système de scoring
grid_scorer = GridScoring() 