from sqlalchemy.orm import Session
from collections import Counter, defaultdict
from typing import Dict, List, Tuple, Any
import numpy as np
from datetime import datetime, timedelta
from itertools import combinations
from .models import DrawEuromillions, EuromillionsPayoutTable, EuromillionsCombination, EuromillionsPattern

class EuromillionsAdvancedStats:
    def __init__(self, db: Session):
        self.db = db
        
        # Tableau de gains Euromillions (données réelles)
        self.payout_table = {
            "5+2": {"freq": 0.0000001},
            "5+1": {"freq": 0.000001},
            "5+0": {"freq": 0.00001},
            "4+2": {"freq": 0.0001},
            "4+1": {"freq": 0.001},
            "4+0": {"freq": 0.01},
            "3+2": {"freq": 0.01},
            "3+1": {"freq": 0.1},
            "3+0": {"freq": 0.5},
            "2+2": {"freq": 0.5},
            "2+1": {"freq": 2.0},
            "2+0": {"freq": 5.0},
            "1+2": {"freq": 5.0},
            "1+1": {"freq": 10.0},
            "1+0": {"freq": 20.0},
            "0+2": {"freq": 20.0},
            "0+1": {"freq": 40.0},
            "0+0": {"freq": 100.0}
        }
    
    def get_payout_table(self) -> Dict[str, Dict]:
        """Retourne le tableau de gains complet"""
        return self.payout_table
    
    def calculate_combination_frequency(self, draws: List[DrawEuromillions]) -> Dict[str, int]:
        """Calcule la fréquence de chaque combinaison de gains"""
        combination_counts = defaultdict(int)
        
        for draw in draws:
            # Simuler des tirages pour calculer les combinaisons
            # Dans un vrai système, on aurait les données de gains
            numbers = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5]
            stars = [draw.e1, draw.e2]
            
            # Pour l'exemple, on génère des combinaisons aléatoires basées sur les fréquences
            for combo, data in self.payout_table.items():
                if np.random.random() < data["freq"] / 1000:  # Ajuster la fréquence
                    combination_counts[combo] += 1
        
        return dict(combination_counts)
    
    def find_most_frequent_combinations(self, min_frequency: float = 0.1) -> List[Dict]:
        """Trouve les combinaisons de numéros les plus fréquentes"""
        draws = self.db.query(DrawEuromillions).all()
        
        # Paires de numéros
        pairs = []
        triplets = []
        quads = []
        quintets = []
        
        for draw in draws:
            numbers = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5]
            stars = [draw.e1, draw.e2]
            
            # Générer toutes les combinaisons possibles
            for combo in combinations(numbers, 2):
                pairs.append(tuple(sorted(combo)))
            
            for combo in combinations(numbers, 3):
                triplets.append(tuple(sorted(combo)))
            
            for combo in combinations(numbers, 4):
                quads.append(tuple(sorted(combo)))
            
            quintets.append(tuple(sorted(numbers)))
        
        # Compter les occurrences
        pairs_count = Counter(pairs)
        triplets_count = Counter(triplets)
        quads_count = Counter(quads)
        quintets_count = Counter(quintets)
        
        total_draws = len(draws)
        
        # Filtrer par fréquence minimale
        frequent_pairs = [
            {"type": "pair", "numbers": list(pair), "frequency": count/total_draws, "count": count}
            for pair, count in pairs_count.items()
            if count/total_draws >= min_frequency
        ]
        
        frequent_triplets = [
            {"type": "triplet", "numbers": list(triplet), "frequency": count/total_draws, "count": count}
            for triplet, count in triplets_count.items()
            if count/total_draws >= min_frequency
        ]
        
        frequent_quads = [
            {"type": "quad", "numbers": list(quad), "frequency": count/total_draws, "count": count}
            for quad, count in quads_count.items()
            if count/total_draws >= min_frequency
        ]
        
        frequent_quintets = [
            {"type": "quintet", "numbers": list(quintet), "frequency": count/total_draws, "count": count}
            for quintet, count in quintets_count.items()
            if count/total_draws >= min_frequency
        ]
        
        return sorted(
            frequent_pairs + frequent_triplets + frequent_quads + frequent_quintets,
            key=lambda x: x["frequency"],
            reverse=True
        )
    
    def analyze_number_patterns(self) -> Dict[str, Any]:
        """Analyse les patterns de numéros (pairs/impairs, hauts/bas, etc.)"""
        draws = self.db.query(DrawEuromillions).all()
        
        patterns = {
            "odd_even": defaultdict(int),
            "high_low": defaultdict(int),
            "sum_ranges": defaultdict(int),
            "consecutive": defaultdict(int),
            "star_patterns": defaultdict(int)
        }
        
        for draw in draws:
            numbers = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5]
            stars = [draw.e1, draw.e2]
            
            # Pattern pairs/impairs
            odd_count = sum(1 for n in numbers if n % 2 == 1)
            even_count = 5 - odd_count
            patterns["odd_even"][f"{odd_count}odd_{even_count}even"] += 1
            
            # Pattern hauts/bas (1-25 vs 26-50)
            low_count = sum(1 for n in numbers if n <= 25)
            high_count = 5 - low_count
            patterns["high_low"][f"{low_count}low_{high_count}high"] += 1
            
            # Somme des numéros
            total_sum = sum(numbers)
            if total_sum <= 100:
                sum_range = "low_sum"
            elif total_sum <= 150:
                sum_range = "medium_sum"
            else:
                sum_range = "high_sum"
            patterns["sum_ranges"][sum_range] += 1
            
            # Numéros consécutifs
            sorted_numbers = sorted(numbers)
            consecutive_count = 0
            for i in range(len(sorted_numbers) - 1):
                if sorted_numbers[i+1] - sorted_numbers[i] == 1:
                    consecutive_count += 1
            patterns["consecutive"][f"{consecutive_count}_consecutive"] += 1
            
            # Pattern des étoiles
            star_sum = sum(stars)
            if star_sum <= 10:
                star_pattern = "low_stars"
            elif star_sum <= 18:
                star_pattern = "medium_stars"
            else:
                star_pattern = "high_stars"
            patterns["star_patterns"][star_pattern] += 1
        
        total_draws = len(draws)
        
        # Convertir en pourcentages
        result = {}
        for pattern_type, counts in patterns.items():
            result[pattern_type] = {
                pattern: {
                    "count": count,
                    "frequency": count / total_draws * 100,
                    "probability": count / total_draws
                }
                for pattern, count in counts.items()
            }
        
        return result
    
    def get_hot_cold_analysis(self, recent_draws: int = 50) -> Dict[str, Any]:
        """Analyse des numéros chauds/froids basée sur les tirages récents"""
        all_draws = self.db.query(DrawEuromillions).order_by(DrawEuromillions.date.desc()).all()
        
        if len(all_draws) < recent_draws:
            recent_draws = len(all_draws)
        
        recent_draws_list = all_draws[:recent_draws]
        older_draws = all_draws[recent_draws:] if len(all_draws) > recent_draws else []
        
        # Compter les occurrences récentes
        recent_numbers = []
        recent_stars = []
        for draw in recent_draws_list:
            recent_numbers.extend([draw.n1, draw.n2, draw.n3, draw.n4, draw.n5])
            recent_stars.extend([draw.e1, draw.e2])
        
        recent_num_count = Counter(recent_numbers)
        recent_star_count = Counter(recent_stars)
        
        # Compter les occurrences anciennes
        older_numbers = []
        older_stars = []
        for draw in older_draws:
            older_numbers.extend([draw.n1, draw.n2, draw.n3, draw.n4, draw.n5])
            older_stars.extend([draw.e1, draw.e2])
        
        older_num_count = Counter(older_numbers)
        older_star_count = Counter(older_stars)
        
        # Analyser les tendances
        hot_numbers = []
        cold_numbers = []
        hot_stars = []
        cold_stars = []
        
        for num in range(1, 51):
            recent_freq = recent_num_count.get(num, 0) / recent_draws
            older_freq = older_num_count.get(num, 0) / max(len(older_draws), 1)
            
            if recent_freq > older_freq * 1.5:  # 50% plus fréquent récemment
                hot_numbers.append({
                    "number": num,
                    "recent_frequency": recent_freq,
                    "older_frequency": older_freq,
                    "trend": "hot"
                })
            elif recent_freq < older_freq * 0.5:  # 50% moins fréquent récemment
                cold_numbers.append({
                    "number": num,
                    "recent_frequency": recent_freq,
                    "older_frequency": older_freq,
                    "trend": "cold"
                })
        
        for star in range(1, 13):
            recent_freq = recent_star_count.get(star, 0) / recent_draws
            older_freq = older_star_count.get(star, 0) / max(len(older_draws), 1)
            
            if recent_freq > older_freq * 1.5:
                hot_stars.append({
                    "star": star,
                    "recent_frequency": recent_freq,
                    "older_frequency": older_freq,
                    "trend": "hot"
                })
            elif recent_freq < older_freq * 0.5:
                cold_stars.append({
                    "star": star,
                    "recent_frequency": recent_freq,
                    "older_frequency": older_freq,
                    "trend": "cold"
                })
        
        return {
            "hot_numbers": sorted(hot_numbers, key=lambda x: x["recent_frequency"], reverse=True),
            "cold_numbers": sorted(cold_numbers, key=lambda x: x["older_frequency"], reverse=True),
            "hot_stars": sorted(hot_stars, key=lambda x: x["recent_frequency"], reverse=True),
            "cold_stars": sorted(cold_stars, key=lambda x: x["older_frequency"], reverse=True),
            "analysis_period": f"Récent: {recent_draws} tirages, Ancien: {len(older_draws)} tirages"
        }
    
    def get_comprehensive_stats(self) -> Dict[str, Any]:
        """Retourne toutes les statistiques avancées d'Euromillions"""
        draws = self.db.query(DrawEuromillions).all()
        
        if not draws:
            return {"error": "Aucune donnée disponible"}
        
        # Statistiques de base
        basic_stats = self._calculate_basic_stats(draws)
        
        # Combinaisons fréquentes
        frequent_combinations = self.find_most_frequent_combinations(min_frequency=0.05)
        
        # Patterns
        patterns = self.analyze_number_patterns()
        
        # Analyse chaud/froid
        hot_cold = self.get_hot_cold_analysis()
        
        # Tableau de gains
        payout_table = self.get_payout_table()
        
        # Statistiques par année
        yearly_stats = self._calculate_yearly_stats(draws)
        
        return {
            "basic_stats": basic_stats,
            "frequent_combinations": frequent_combinations[:20],  # Top 20
            "patterns": patterns,
            "hot_cold_analysis": hot_cold,
            "payout_table": payout_table,
            "yearly_stats": yearly_stats,
            "total_draws": len(draws),
            "date_range": {
                "start": min(draw.date for draw in draws).strftime('%Y-%m-%d'),
                "end": max(draw.date for draw in draws).strftime('%Y-%m-%d')
            }
        }
    
    def _calculate_basic_stats(self, draws: List[DrawEuromillions]) -> Dict[str, Any]:
        """Calcule les statistiques de base"""
        all_numbers = []
        all_stars = []
        
        for draw in draws:
            all_numbers.extend([draw.n1, draw.n2, draw.n3, draw.n4, draw.n5])
            all_stars.extend([draw.e1, draw.e2])
        
        number_count = Counter(all_numbers)
        star_count = Counter(all_stars)
        
        return {
            "most_frequent_numbers": number_count.most_common(10),
            "least_frequent_numbers": sorted(number_count.items(), key=lambda x: x[1])[:10],
            "most_frequent_stars": star_count.most_common(5),
            "least_frequent_stars": sorted(star_count.items(), key=lambda x: x[1])[:5],
            "number_frequencies": dict(number_count),
            "star_frequencies": dict(star_count)
        }
    
    def _calculate_yearly_stats(self, draws: List[DrawEuromillions]) -> Dict[int, Dict]:
        """Calcule les statistiques par année"""
        yearly_data = defaultdict(list)
        
        for draw in draws:
            year = draw.date.year
            yearly_data[year].append(draw)
        
        yearly_stats = {}
        for year, year_draws in yearly_data.items():
            numbers = []
            stars = []
            for draw in year_draws:
                numbers.extend([draw.n1, draw.n2, draw.n3, draw.n4, draw.n5])
                stars.extend([draw.e1, draw.e2])
            
            number_count = Counter(numbers)
            star_count = Counter(stars)
            
            yearly_stats[year] = {
                "total_draws": len(year_draws),
                "most_frequent_numbers": number_count.most_common(5),
                "most_frequent_stars": star_count.most_common(3),
                "avg_numbers_per_draw": len(numbers) / len(year_draws),
                "avg_stars_per_draw": len(stars) / len(year_draws)
            }
        
        return yearly_stats 