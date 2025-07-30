import random
import numpy as np
from typing import List, Dict, Tuple, Any
from sqlalchemy.orm import Session
from .euromillions_advanced_stats import EuromillionsAdvancedStats
from .models import DrawEuromillions

class EuromillionsAdvancedGenerator:
    def __init__(self, db: Session):
        self.db = db
        self.stats = EuromillionsAdvancedStats(db)
        
    def generate_probability_based_grid(self, strategy: str = "balanced") -> Dict[str, Any]:
        """
        Génère une grille basée sur les probabilités avancées
        
        Strategies:
        - "balanced": Équilibre entre fréquence et patterns
        - "frequency": Privilégie les numéros les plus fréquents
        - "hot": Privilégie les numéros chauds
        - "cold": Privilégie les numéros froids
        - "pattern": Privilégie les patterns les plus probables
        """
        stats = self.stats.get_comprehensive_stats()
        
        if strategy == "frequency":
            return self._generate_frequency_based_grid(stats)
        elif strategy == "hot":
            return self._generate_hot_based_grid(stats)
        elif strategy == "cold":
            return self._generate_cold_based_grid(stats)
        elif strategy == "pattern":
            return self._generate_pattern_based_grid(stats)
        else:  # balanced
            return self._generate_balanced_grid(stats)
    
    def _generate_frequency_based_grid(self, stats: Dict[str, Any]) -> Dict[str, Any]:
        """Génère une grille basée sur les fréquences"""
        number_freqs = stats["basic_stats"]["number_frequencies"]
        star_freqs = stats["basic_stats"]["star_frequencies"]
        
        # Créer des poids basés sur les fréquences
        number_weights = [number_freqs.get(i, 0.1) for i in range(1, 51)]
        star_weights = [star_freqs.get(i, 0.1) for i in range(1, 13)]
        
        # Normaliser
        number_weights = np.array(number_weights)
        star_weights = np.array(star_weights)
        
        number_weights = number_weights / number_weights.sum()
        star_weights = star_weights / star_weights.sum()
        
        # Tirer les numéros
        numbers = np.random.choice(range(1, 51), size=5, replace=False, p=number_weights)
        stars = np.random.choice(range(1, 13), size=2, replace=False, p=star_weights)
        
        return {
            "numbers": sorted(numbers.tolist()),
            "stars": sorted(stars.tolist()),
            "strategy": "frequency",
            "confidence": self._calculate_confidence(numbers, stars, stats)
        }
    
    def _generate_hot_based_grid(self, stats: Dict[str, Any]) -> Dict[str, Any]:
        """Génère une grille basée sur les numéros chauds"""
        hot_numbers = [item["number"] for item in stats["hot_cold_analysis"]["hot_numbers"][:15]]
        hot_stars = [item["star"] for item in stats["hot_cold_analysis"]["hot_stars"][:6]]
        
        # Si pas assez de numéros chauds, compléter avec des fréquents
        if len(hot_numbers) < 5:
            freq_numbers = [item[0] for item in stats["basic_stats"]["most_frequent_numbers"][:20]]
            hot_numbers.extend(freq_numbers)
        
        if len(hot_stars) < 2:
            freq_stars = [item[0] for item in stats["basic_stats"]["most_frequent_stars"][:6]]
            hot_stars.extend(freq_stars)
        
        # S'assurer qu'il n'y a pas de doublons
        hot_numbers = list(set(hot_numbers))
        hot_stars = list(set(hot_stars))
        
        # Tirer parmi les numéros chauds
        numbers = random.sample(hot_numbers[:20], min(5, len(hot_numbers)))
        stars = random.sample(hot_stars[:8], min(2, len(hot_stars)))
        
        # Compléter si nécessaire
        if len(numbers) < 5:
            remaining_numbers = [n for n in range(1, 51) if n not in numbers]
            numbers.extend(random.sample(remaining_numbers, 5 - len(numbers)))
        
        if len(stars) < 2:
            remaining_stars = [s for s in range(1, 13) if s not in stars]
            stars.extend(random.sample(remaining_stars, 2 - len(stars)))
        
        return {
            "numbers": sorted(numbers),
            "stars": sorted(stars),
            "strategy": "hot",
            "confidence": self._calculate_confidence(numbers, stars, stats)
        }
    
    def _generate_cold_based_grid(self, stats: Dict[str, Any]) -> Dict[str, Any]:
        """Génère une grille basée sur les numéros froids (théorie du rattrapage)"""
        cold_numbers = [item["number"] for item in stats["hot_cold_analysis"]["cold_numbers"][:15]]
        cold_stars = [item["star"] for item in stats["hot_cold_analysis"]["cold_stars"][:6]]
        
        # Compléter si nécessaire
        if len(cold_numbers) < 5:
            all_numbers = list(range(1, 51))
            cold_numbers.extend([n for n in all_numbers if n not in cold_numbers])
        
        if len(cold_stars) < 2:
            all_stars = list(range(1, 13))
            cold_stars.extend([s for s in all_stars if s not in cold_stars])
        
        # S'assurer qu'il n'y a pas de doublons
        cold_numbers = list(set(cold_numbers))
        cold_stars = list(set(cold_stars))
        
        numbers = random.sample(cold_numbers[:20], min(5, len(cold_numbers)))
        stars = random.sample(cold_stars[:8], min(2, len(cold_stars)))
        
        # Compléter si nécessaire
        if len(numbers) < 5:
            remaining_numbers = [n for n in range(1, 51) if n not in numbers]
            numbers.extend(random.sample(remaining_numbers, 5 - len(numbers)))
        
        if len(stars) < 2:
            remaining_stars = [s for s in range(1, 13) if s not in stars]
            stars.extend(random.sample(remaining_stars, 2 - len(stars)))
        
        return {
            "numbers": sorted(numbers),
            "stars": sorted(stars),
            "strategy": "cold",
            "confidence": self._calculate_confidence(numbers, stars, stats)
        }
    
    def _generate_pattern_based_grid(self, stats: Dict[str, Any]) -> Dict[str, Any]:
        """Génère une grille basée sur les patterns les plus probables"""
        patterns = stats["patterns"]
        
        # Choisir le pattern le plus probable pour pairs/impairs
        odd_even_patterns = patterns["odd_even"]
        most_likely_odd_even = max(odd_even_patterns.items(), key=lambda x: x[1]["probability"])
        
        # Choisir le pattern le plus probable pour hauts/bas
        high_low_patterns = patterns["high_low"]
        most_likely_high_low = max(high_low_patterns.items(), key=lambda x: x[1]["probability"])
        
        # Générer des numéros selon ces patterns
        numbers = self._generate_numbers_by_pattern(most_likely_odd_even[0], most_likely_high_low[0])
        
        # Générer des étoiles selon le pattern le plus probable
        star_patterns = patterns["star_patterns"]
        most_likely_star_pattern = max(star_patterns.items(), key=lambda x: x[1]["probability"])
        stars = self._generate_stars_by_pattern(most_likely_star_pattern[0])
        
        return {
            "numbers": sorted(numbers),
            "stars": sorted(stars),
            "strategy": "pattern",
            "patterns_used": {
                "odd_even": most_likely_odd_even[0],
                "high_low": most_likely_high_low[0],
                "stars": most_likely_star_pattern[0]
            },
            "confidence": self._calculate_confidence(numbers, stars, stats)
        }
    
    def _generate_balanced_grid(self, stats: Dict[str, Any]) -> Dict[str, Any]:
        """Génère une grille équilibrée combinant plusieurs stratégies"""
        # Combiner fréquence, patterns et analyse chaud/froid
        number_freqs = stats["basic_stats"]["number_frequencies"]
        star_freqs = stats["basic_stats"]["star_frequencies"]
        
        # Créer des poids combinés
        number_weights = []
        for i in range(1, 51):
            base_weight = number_freqs.get(i, 0.1)
            
            # Bonus pour les numéros chauds
            hot_bonus = 1.0
            for hot_item in stats["hot_cold_analysis"]["hot_numbers"][:10]:
                if hot_item["number"] == i:
                    hot_bonus = 1.5
                    break
            
            # Bonus pour les combinaisons fréquentes
            combo_bonus = 1.0
            for combo in stats["frequent_combinations"][:20]:
                if i in combo["numbers"]:
                    combo_bonus = 1.2
                    break
            
            final_weight = base_weight * hot_bonus * combo_bonus
            number_weights.append(final_weight)
        
        # Normaliser
        number_weights = np.array(number_weights)
        number_weights = number_weights / number_weights.sum()
        
        # Même chose pour les étoiles
        star_weights = []
        for i in range(1, 13):
            base_weight = star_freqs.get(i, 0.1)
            
            hot_bonus = 1.0
            for hot_item in stats["hot_cold_analysis"]["hot_stars"][:5]:
                if hot_item["star"] == i:
                    hot_bonus = 1.5
                    break
            
            final_weight = base_weight * hot_bonus
            star_weights.append(final_weight)
        
        star_weights = np.array(star_weights)
        star_weights = star_weights / star_weights.sum()
        
        # Tirer les numéros
        numbers = np.random.choice(range(1, 51), size=5, replace=False, p=number_weights)
        stars = np.random.choice(range(1, 13), size=2, replace=False, p=star_weights)
        
        return {
            "numbers": sorted(numbers.tolist()),
            "stars": sorted(stars.tolist()),
            "strategy": "balanced",
            "confidence": self._calculate_confidence(numbers, stars, stats)
        }
    
    def _generate_numbers_by_pattern(self, odd_even_pattern: str, high_low_pattern: str) -> List[int]:
        """Génère des numéros selon les patterns spécifiés"""
        # Parser les patterns
        odd_count = int(odd_even_pattern.split('odd')[0])
        even_count = 5 - odd_count
        
        low_count = int(high_low_pattern.split('low')[0])
        high_count = 5 - low_count
        
        # Créer les pools de numéros
        odd_numbers = list(range(1, 51, 2))  # 1, 3, 5, ..., 49
        even_numbers = list(range(2, 51, 2))  # 2, 4, 6, ..., 50
        low_numbers = list(range(1, 26))  # 1-25
        high_numbers = list(range(26, 51))  # 26-50
        
        # Sélectionner selon les patterns
        selected_numbers = set()
        
        # Sélectionner les pairs/impairs
        odd_selected = random.sample(odd_numbers, odd_count)
        even_selected = random.sample(even_numbers, even_count)
        
        # Combiner et ajuster selon hauts/bas
        all_selected = list(set(odd_selected + even_selected))
        
        # S'assurer qu'on a exactement 5 numéros uniques
        while len(all_selected) < 5:
            if len(all_selected) < odd_count:
                remaining_odd = [n for n in odd_numbers if n not in all_selected]
                if remaining_odd:
                    all_selected.append(random.choice(remaining_odd))
            else:
                remaining_even = [n for n in even_numbers if n not in all_selected]
                if remaining_even:
                    all_selected.append(random.choice(remaining_even))
        
        # Ajuster pour respecter le pattern hauts/bas
        low_in_selected = sum(1 for n in all_selected if n <= 25)
        high_in_selected = 5 - low_in_selected
        
        if low_in_selected < low_count:
            # Remplacer des hauts par des bas
            high_numbers_in_selected = [n for n in all_selected if n > 25]
            low_numbers_available = [n for n in low_numbers if n not in all_selected]
            
            to_replace = low_count - low_in_selected
            for _ in range(min(to_replace, len(high_numbers_in_selected))):
                if high_numbers_in_selected and low_numbers_available:
                    high_num = random.choice(high_numbers_in_selected)
                    low_num = random.choice(low_numbers_available)
                    all_selected.remove(high_num)
                    all_selected.append(low_num)
                    high_numbers_in_selected.remove(high_num)
                    low_numbers_available.remove(low_num)
        
        elif high_in_selected < high_count:
            # Remplacer des bas par des hauts
            low_numbers_in_selected = [n for n in all_selected if n <= 25]
            high_numbers_available = [n for n in high_numbers if n not in all_selected]
            
            to_replace = high_count - high_in_selected
            for _ in range(min(to_replace, len(low_numbers_in_selected))):
                if low_numbers_in_selected and high_numbers_available:
                    low_num = random.choice(low_numbers_in_selected)
                    high_num = random.choice(high_numbers_available)
                    all_selected.remove(low_num)
                    all_selected.append(high_num)
                    low_numbers_in_selected.remove(low_num)
                    high_numbers_available.remove(high_num)
        
        # S'assurer qu'on a exactement 5 numéros uniques
        all_selected = list(set(all_selected))
        while len(all_selected) < 5:
            remaining = [n for n in range(1, 51) if n not in all_selected]
            if remaining:
                all_selected.append(random.choice(remaining))
        
        return all_selected[:5]  # Retourner exactement 5 numéros
    
    def _generate_stars_by_pattern(self, star_pattern: str) -> List[int]:
        """Génère des étoiles selon le pattern spécifié"""
        if star_pattern == "low_stars":
            # Somme <= 10
            available_stars = list(range(1, 13))
            stars = []
            remaining_sum = 10
            
            for _ in range(2):
                valid_stars = [s for s in available_stars if s <= remaining_sum - (2 - len(stars) - 1)]
                if valid_stars:
                    star = random.choice(valid_stars)
                    stars.append(star)
                    available_stars.remove(star)
                    remaining_sum -= star
                else:
                    star = random.choice(available_stars)
                    stars.append(star)
                    available_stars.remove(star)
            
            return stars
        
        elif star_pattern == "high_stars":
            # Somme > 18
            available_stars = list(range(1, 13))
            stars = []
            
            # Forcer une somme élevée
            for _ in range(2):
                if len(stars) == 0:
                    star = random.choice([8, 9, 10, 11, 12])
                else:
                    min_needed = 19 - sum(stars)
                    valid_stars = [s for s in available_stars if s >= min_needed]
                    star = random.choice(valid_stars) if valid_stars else random.choice(available_stars)
                
                stars.append(star)
                available_stars.remove(star)
            
            return stars
        
        else:  # medium_stars
            # Somme entre 11 et 18
            available_stars = list(range(1, 13))
            stars = []
            
            for _ in range(2):
                if len(stars) == 0:
                    star = random.choice([4, 5, 6, 7, 8, 9])
                else:
                    current_sum = sum(stars)
                    min_needed = max(1, 11 - current_sum)
                    max_allowed = min(12, 18 - current_sum)
                    valid_stars = [s for s in available_stars if min_needed <= s <= max_allowed]
                    star = random.choice(valid_stars) if valid_stars else random.choice(available_stars)
                
                stars.append(star)
                available_stars.remove(star)
            
            return stars
    
    def _calculate_confidence(self, numbers: List[int], stars: List[int], stats: Dict[str, Any]) -> float:
        """Calcule un score de confiance pour la grille générée"""
        confidence = 0.0
        
        # Score basé sur les fréquences
        number_freqs = stats["basic_stats"]["number_frequencies"]
        star_freqs = stats["basic_stats"]["star_frequencies"]
        
        avg_number_freq = sum(number_freqs.get(n, 0) for n in numbers) / 5
        avg_star_freq = sum(star_freqs.get(s, 0) for s in stars) / 2
        
        confidence += avg_number_freq * 0.4
        confidence += avg_star_freq * 0.2
        
        # Score basé sur les patterns
        patterns = stats["patterns"]
        
        # Vérifier le pattern pairs/impairs
        odd_count = sum(1 for n in numbers if n % 2 == 1)
        even_count = 5 - odd_count
        odd_even_pattern = f"{odd_count}odd_{even_count}even"
        
        if odd_even_pattern in patterns["odd_even"]:
            confidence += patterns["odd_even"][odd_even_pattern]["probability"] * 0.2
        
        # Vérifier le pattern hauts/bas
        low_count = sum(1 for n in numbers if n <= 25)
        high_count = 5 - low_count
        high_low_pattern = f"{low_count}low_{high_count}high"
        
        if high_low_pattern in patterns["high_low"]:
            confidence += patterns["high_low"][high_low_pattern]["probability"] * 0.2
        
        return min(confidence, 1.0)
    
    def generate_multiple_grids(self, num_grids: int = 5, strategy: str = "balanced") -> List[Dict[str, Any]]:
        """Génère plusieurs grilles avec différentes stratégies"""
        grids = []
        
        strategies = ["balanced", "frequency", "hot", "cold", "pattern"]
        
        for i in range(num_grids):
            if i < len(strategies):
                current_strategy = strategies[i]
            else:
                current_strategy = strategy
            
            grid = self.generate_probability_based_grid(current_strategy)
            grids.append(grid)
        
        return grids
    
    def get_grid_analysis(self, numbers: List[int], stars: List[int]) -> Dict[str, Any]:
        """Analyse une grille spécifique"""
        stats = self.stats.get_comprehensive_stats()
        
        analysis = {
            "numbers": numbers,
            "stars": stars,
            "confidence": self._calculate_confidence(numbers, stars, stats),
            "patterns": {},
            "frequencies": {},
            "payout_probability": {}
        }
        
        # Analyser les patterns
        odd_count = sum(1 for n in numbers if n % 2 == 1)
        even_count = 5 - odd_count
        analysis["patterns"]["odd_even"] = f"{odd_count}odd_{even_count}even"
        
        low_count = sum(1 for n in numbers if n <= 25)
        high_count = 5 - low_count
        analysis["patterns"]["high_low"] = f"{low_count}low_{high_count}high"
        
        total_sum = sum(numbers)
        if total_sum <= 100:
            analysis["patterns"]["sum_range"] = "low_sum"
        elif total_sum <= 150:
            analysis["patterns"]["sum_range"] = "medium_sum"
        else:
            analysis["patterns"]["sum_range"] = "high_sum"
        
        # Analyser les fréquences
        number_freqs = stats["basic_stats"]["number_frequencies"]
        star_freqs = stats["basic_stats"]["star_frequencies"]
        
        analysis["frequencies"]["numbers"] = {
            n: number_freqs.get(n, 0) for n in numbers
        }
        analysis["frequencies"]["stars"] = {
            s: star_freqs.get(s, 0) for s in stars
        }
        
        # Calculer la probabilité de gain
        payout_table = self.stats.get_payout_table()
        analysis["payout_probability"] = payout_table
        
        return analysis 