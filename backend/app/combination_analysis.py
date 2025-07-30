from typing import Dict, List, Tuple, Set, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .models import DrawEuromillions, DrawLoto
from .cache_manager import cache_manager
from collections import defaultdict, Counter
import itertools
import numpy as np
import json

class CombinationAnalysis:
    """Analyse des combinaisons fréquentes dans les tirages"""
    
    def __init__(self):
        self.combination_patterns = {}
        self.frequent_combinations = {}
        self.combination_scores = {}
    
    def analyze_combinations(self, draws: List, game_type: str, 
                           min_combination_size: int = 2, 
                           max_combination_size: int = 4) -> Dict:
        """
        Analyse les combinaisons fréquentes dans les tirages
        
        Args:
            draws: Liste des tirages
            game_type: 'euromillions' ou 'lotto'
            min_combination_size: Taille minimale des combinaisons
            max_combination_size: Taille maximale des combinaisons
        
        Returns:
            Dictionnaire avec l'analyse des combinaisons
        """
        if not draws:
            return {}
        
        # Extraire tous les numéros de chaque tirage
        all_combinations = []
        for draw in draws:
            if game_type == 'euromillions':
                numbers = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5]
            else:
                numbers = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6]
            
            # Générer toutes les combinaisons possibles pour ce tirage
            for size in range(min_combination_size, max_combination_size + 1):
                combinations = list(itertools.combinations(sorted(numbers), size))
                all_combinations.extend(combinations)
        
        # Compter les occurrences de chaque combinaison
        combination_counts = Counter(all_combinations)
        
        # Analyser les combinaisons par taille
        analysis_by_size = {}
        for size in range(min_combination_size, max_combination_size + 1):
            size_combinations = {
                combo: count for combo, count in combination_counts.items()
                if len(combo) == size
            }
            
            # Trier par fréquence
            sorted_combinations = sorted(
                size_combinations.items(),
                key=lambda x: x[1],
                reverse=True
            )
            
            # Calculer les statistiques
            total_combinations = len(size_combinations)
            total_occurrences = sum(size_combinations.values())
            avg_occurrences = total_occurrences / total_combinations if total_combinations > 0 else 0
            
            # Identifier les combinaisons fréquentes (au-dessus de la moyenne + écart-type)
            occurrences = list(size_combinations.values())
            std_dev = np.std(occurrences) if len(occurrences) > 1 else 0
            threshold = avg_occurrences + std_dev
            
            frequent_combinations = [
                {
                    'combination': list(combo),
                    'occurrences': count,
                    'frequency_percentage': round((count / len(draws)) * 100, 2),
                    'score': self._calculate_combination_score(count, len(draws), size)
                }
                for combo, count in sorted_combinations
                if count >= threshold
            ]
            
            analysis_by_size[size] = {
                'total_combinations': total_combinations,
                'total_occurrences': total_occurrences,
                'average_occurrences': round(avg_occurrences, 2),
                'standard_deviation': round(std_dev, 2),
                'threshold': round(threshold, 2),
                'frequent_combinations': frequent_combinations[:20],  # Top 20
                'most_frequent': [
                    {
                        'combination': list(combo),
                        'occurrences': count,
                        'frequency_percentage': round((count / len(draws)) * 100, 2)
                    }
                    for combo, count in sorted_combinations[:10]  # Top 10
                ]
            }
        
        return analysis_by_size
    
    def _calculate_combination_score(self, occurrences: int, total_draws: int, 
                                   combination_size: int) -> float:
        """
        Calcule un score pour une combinaison basé sur sa fréquence
        
        Args:
            occurrences: Nombre d'occurrences de la combinaison
            total_draws: Nombre total de tirages
            combination_size: Taille de la combinaison
        
        Returns:
            Score entre 0 et 1
        """
        # Fréquence relative
        frequency = occurrences / total_draws
        
        # Facteur de rareté (combinaisons plus grandes sont plus rares)
        rarity_factor = 1.0 / combination_size
        
        # Score basé sur la fréquence et la rareté
        score = frequency * rarity_factor * 100
        
        # Normaliser entre 0 et 1
        return min(score, 1.0)
    
    def find_related_combinations(self, target_combination: List[int], 
                                combination_analysis: Dict) -> List[Dict]:
        """
        Trouve les combinaisons liées à une combinaison cible
        
        Args:
            target_combination: Combinaison cible
            combination_analysis: Résultat de l'analyse des combinaisons
        
        Returns:
            Liste des combinaisons liées
        """
        related_combinations = []
        target_set = set(target_combination)
        
        for size, analysis in combination_analysis.items():
            for combo_info in analysis.get('frequent_combinations', []):
                combo_set = set(combo_info['combination'])
                
                # Calculer l'intersection
                intersection = target_set & combo_set
                overlap_percentage = len(intersection) / len(target_set)
                
                if overlap_percentage >= 0.5:  # Au moins 50% de chevauchement
                    related_combinations.append({
                        'combination': combo_info['combination'],
                        'size': size,
                        'overlap_percentage': round(overlap_percentage * 100, 1),
                        'overlap_numbers': list(intersection),
                        'occurrences': combo_info['occurrences'],
                        'score': combo_info['score']
                    })
        
        # Trier par pourcentage de chevauchement
        return sorted(related_combinations, key=lambda x: x['overlap_percentage'], reverse=True)
    
    def predict_combinations(self, combination_analysis: Dict, game_type: str,
                           num_predictions: int = 10) -> List[Dict]:
        """
        Prédit des combinaisons basées sur l'analyse
        
        Args:
            combination_analysis: Résultat de l'analyse des combinaisons
            game_type: 'euromillions' ou 'lotto'
            num_predictions: Nombre de prédictions à générer
        
        Returns:
            Liste des prédictions de combinaisons
        """
        if not combination_analysis:
            return []
        
        predictions = []
        numbers_per_grid = 5 if game_type == 'euromillions' else 6
        
        # Collecter toutes les combinaisons fréquentes
        all_frequent_combinations = []
        for size, analysis in combination_analysis.items():
            for combo_info in analysis.get('frequent_combinations', []):
                all_frequent_combinations.append({
                    **combo_info,
                    'size': size
                })
        
        # Trier par score
        all_frequent_combinations.sort(key=lambda x: x['score'], reverse=True)
        
        for i in range(num_predictions):
            # Sélectionner des combinaisons de base
            selected_numbers = set()
            used_combinations = []
            
            # Prendre les meilleures combinaisons comme base
            for combo_info in all_frequent_combinations:
                if len(selected_numbers) >= numbers_per_grid:
                    break
                
                combo_numbers = set(combo_info['combination'])
                # Vérifier qu'on n'ajoute pas trop de numéros
                if len(selected_numbers | combo_numbers) <= numbers_per_grid:
                    selected_numbers.update(combo_numbers)
                    used_combinations.append(combo_info)
            
            # Compléter avec des numéros aléatoires si nécessaire
            while len(selected_numbers) < numbers_per_grid:
                import random
                max_number = 50 if game_type == 'euromillions' else 49
                remaining_numbers = [
                    num for num in range(1, max_number + 1)
                    if num not in selected_numbers
                ]
                
                if remaining_numbers:
                    random_num = random.choice(remaining_numbers)
                    selected_numbers.add(random_num)
            
            # Calculer le score de la prédiction
            prediction_score = self._calculate_prediction_score(used_combinations, numbers_per_grid)
            
            predictions.append({
                'prediction_id': i + 1,
                'numbers': sorted(list(selected_numbers)),
                'base_combinations': used_combinations,
                'prediction_score': round(prediction_score, 3),
                'strategy': 'combination_based',
                'confidence': self._calculate_combination_confidence(used_combinations)
            })
        
        return predictions
    
    def _calculate_prediction_score(self, used_combinations: List[Dict], 
                                  target_size: int) -> float:
        """Calcule le score d'une prédiction basée sur les combinaisons utilisées"""
        if not used_combinations:
            return 0.1  # Score faible pour les prédictions sans combinaisons
        
        # Score moyen des combinaisons utilisées
        avg_combination_score = np.mean([combo['score'] for combo in used_combinations])
        
        # Facteur de couverture (combien de numéros sont couverts par des combinaisons)
        covered_numbers = set()
        for combo in used_combinations:
            covered_numbers.update(combo['combination'])
        
        coverage_factor = len(covered_numbers) / target_size
        
        # Score final
        final_score = avg_combination_score * coverage_factor
        
        return final_score
    
    def _calculate_combination_confidence(self, used_combinations: List[Dict]) -> str:
        """Calcule le niveau de confiance basé sur les combinaisons utilisées"""
        if not used_combinations:
            return "Très faible"
        
        avg_score = np.mean([combo['score'] for combo in used_combinations])
        
        if avg_score > 0.7:
            return "Élevée"
        elif avg_score > 0.5:
            return "Moyenne"
        elif avg_score > 0.3:
            return "Faible"
        else:
            return "Très faible"
    
    def get_combination_statistics(self, combination_analysis: Dict) -> Dict:
        """Calcule des statistiques globales sur les combinaisons"""
        if not combination_analysis:
            return {}
        
        total_combinations = 0
        total_occurrences = 0
        all_frequent_combinations = []
        
        for size, analysis in combination_analysis.items():
            total_combinations += analysis.get('total_combinations', 0)
            total_occurrences += analysis.get('total_occurrences', 0)
            all_frequent_combinations.extend(analysis.get('frequent_combinations', []))
        
        # Statistiques par taille
        size_statistics = {}
        for size, analysis in combination_analysis.items():
            size_statistics[f"taille_{size}"] = {
                'total_combinations': analysis.get('total_combinations', 0),
                'frequent_combinations': len(analysis.get('frequent_combinations', [])),
                'average_occurrences': analysis.get('average_occurrences', 0),
                'most_frequent': analysis.get('most_frequent', [])[:3]
            }
        
        # Combinaisons les plus fréquentes toutes tailles confondues
        top_combinations = sorted(
            all_frequent_combinations,
            key=lambda x: x['occurrences'],
            reverse=True
        )[:10]
        
        return {
            'total_combinations_analyzed': total_combinations,
            'total_occurrences': total_occurrences,
            'frequent_combinations_count': len(all_frequent_combinations),
            'size_statistics': size_statistics,
            'top_combinations': [
                {
                    'combination': combo['combination'],
                    'size': len(combo['combination']),
                    'occurrences': combo['occurrences'],
                    'frequency_percentage': combo['frequency_percentage'],
                    'score': combo['score']
                }
                for combo in top_combinations
            ]
        }

# Instance globale de l'analyseur de combinaisons
combination_analyzer = CombinationAnalysis() 