from sqlalchemy.orm import Session
from sqlalchemy import func, extract, and_, or_, desc, asc
from collections import Counter, defaultdict
from typing import Dict, List, Tuple, Any, Optional
import numpy as np
from datetime import datetime, timedelta
from itertools import combinations
from .models import DrawEuromillions

class AdvancedStatisticsAnalyzer:
    def __init__(self, db: Session):
        self.db = db
    
    def get_comprehensive_number_analysis(self, year: Optional[int] = None) -> Dict[str, Any]:
        """Analyse complète des numéros avec toutes les statistiques avancées"""
        query = self.db.query(DrawEuromillions)
        if year:
            query = query.filter(extract('year', DrawEuromillions.date) == year)
        
        draws = query.order_by(DrawEuromillions.date.asc()).all()
        
        if not draws:
            return {"error": "Aucun tirage trouvé"}
        
        total_draws = len(draws)
        
        # 1. Statistiques de base par numéro
        number_stats = self._calculate_basic_number_stats(draws, total_draws)
        
        # 2. Analyse des positions
        position_stats = self._calculate_position_stats(draws, total_draws)
        
        # 3. Analyse des gaps (intervalles entre apparitions)
        gap_stats = self._calculate_gap_stats(draws)
        
        # 4. Analyse des séquences
        sequence_stats = self._calculate_sequence_stats(draws)
        
        # 5. Analyse des patterns
        pattern_stats = self._calculate_pattern_stats(draws)
        
        # 6. Analyse temporelle
        temporal_stats = self._calculate_temporal_stats(draws)
        
        # 7. Analyse des combinaisons
        combination_stats = self._calculate_combination_stats(draws)
        
        # 8. Analyse des corrélations
        correlation_stats = self._calculate_correlation_stats(draws)
        
        return {
            "total_draws": total_draws,
            "date_range": {
                "start": draws[0].date.isoformat(),
                "end": draws[-1].date.isoformat()
            },
            "number_statistics": number_stats,
            "position_statistics": position_stats,
            "gap_statistics": gap_stats,
            "sequence_statistics": sequence_stats,
            "pattern_statistics": pattern_stats,
            "temporal_statistics": temporal_stats,
            "combination_statistics": combination_stats,
            "correlation_statistics": correlation_stats
        }
    
    def _calculate_basic_number_stats(self, draws: List[DrawEuromillions], total_draws: int) -> Dict[str, Any]:
        """Calcul des statistiques de base pour chaque numéro"""
        number_counts = defaultdict(int)
        star_counts = defaultdict(int)
        last_appearance = {}
        first_appearance = {}
        
        for draw in draws:
            numbers = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5]
            stars = [draw.e1, draw.e2]
            
            for num in numbers:
                number_counts[num] += 1
                last_appearance[num] = draw.date.isoformat()
                if num not in first_appearance:
                    first_appearance[num] = draw.date.isoformat()
            
            for star in stars:
                star_counts[star] += 1
                last_appearance[f"star_{star}"] = draw.date.isoformat()
                if f"star_{star}" not in first_appearance:
                    first_appearance[f"star_{star}"] = draw.date.isoformat()
        
        # Statistiques des numéros
        number_stats = []
        for num in range(1, 51):
            count = number_counts[num]
            percentage = (count / total_draws * 100) if total_draws > 0 else 0
            expected_frequency = (total_draws * 5) / 50  # 5 numéros par tirage sur 50 possibles
            deviation = count - expected_frequency
            
            number_stats.append({
                "numero": num,
                "count": count,
                "percentage": round(percentage, 2),
                "expected_frequency": round(expected_frequency, 2),
                "deviation": round(deviation, 2),
                "last_appearance": last_appearance.get(num),
                "first_appearance": first_appearance.get(num),
                "type": "numero"
            })
        
        # Statistiques des étoiles
        star_stats = []
        for star in range(1, 13):
            count = star_counts[star]
            percentage = (count / total_draws * 100) if total_draws > 0 else 0
            expected_frequency = (total_draws * 2) / 12  # 2 étoiles par tirage sur 12 possibles
            deviation = count - expected_frequency
            
            star_stats.append({
                "numero": star,
                "count": count,
                "percentage": round(percentage, 2),
                "expected_frequency": round(expected_frequency, 2),
                "deviation": round(deviation, 2),
                "last_appearance": last_appearance.get(f"star_{star}"),
                "first_appearance": first_appearance.get(f"star_{star}"),
                "type": "etoile"
            })
        
        return {
            "numbers": sorted(number_stats, key=lambda x: x["count"], reverse=True),
            "stars": sorted(star_stats, key=lambda x: x["count"], reverse=True),
            "top_numbers": sorted(number_stats, key=lambda x: x["count"], reverse=True)[:10],
            "bottom_numbers": sorted(number_stats, key=lambda x: x["count"])[:10],
            "top_stars": sorted(star_stats, key=lambda x: x["count"], reverse=True)[:5],
            "bottom_stars": sorted(star_stats, key=lambda x: x["count"])[:5]
        }
    
    def _calculate_position_stats(self, draws: List[DrawEuromillions], total_draws: int) -> Dict[str, Any]:
        """Analyse des positions préférées de chaque numéro"""
        position_counts = {i: defaultdict(int) for i in range(1, 6)}
        star_position_counts = {i: defaultdict(int) for i in range(1, 3)}
        
        for draw in draws:
            numbers = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5]
            stars = [draw.e1, draw.e2]
            
            for pos, num in enumerate(numbers, 1):
                position_counts[pos][num] += 1
            
            for pos, star in enumerate(stars, 1):
                star_position_counts[pos][star] += 1
        
        # Statistiques par position pour les numéros
        position_stats = {}
        for pos in range(1, 6):
            pos_stats = []
            for num in range(1, 51):
                count = position_counts[pos][num]
                percentage = (count / total_draws * 100) if total_draws > 0 else 0
                pos_stats.append({
                    "numero": num,
                    "count": count,
                    "percentage": round(percentage, 2),
                    "position": pos
                })
            position_stats[f"position_{pos}"] = sorted(pos_stats, key=lambda x: x["count"], reverse=True)
        
        # Statistiques par position pour les étoiles
        star_pos_stats = {}
        for pos in range(1, 3):
            pos_stats = []
            for star in range(1, 13):
                count = star_position_counts[pos][star]
                percentage = (count / total_draws * 100) if total_draws > 0 else 0
                pos_stats.append({
                    "numero": star,
                    "count": count,
                    "percentage": round(percentage, 2),
                    "position": pos
                })
            star_pos_stats[f"star_position_{pos}"] = sorted(pos_stats, key=lambda x: x["count"], reverse=True)
        
        return {
            "number_positions": position_stats,
            "star_positions": star_pos_stats
        }
    
    def _calculate_gap_stats(self, draws: List[DrawEuromillions]) -> Dict[str, Any]:
        """Analyse des intervalles entre apparitions de chaque numéro"""
        number_appearances = defaultdict(list)
        star_appearances = defaultdict(list)
        
        for i, draw in enumerate(draws):
            numbers = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5]
            stars = [draw.e1, draw.e2]
            
            for num in numbers:
                number_appearances[num].append(i)
            
            for star in stars:
                star_appearances[star].append(i)
        
        # Calcul des gaps pour les numéros
        number_gaps = {}
        for num in range(1, 51):
            appearances = number_appearances[num]
            if len(appearances) > 1:
                gaps = [appearances[i+1] - appearances[i] for i in range(len(appearances)-1)]
                number_gaps[num] = {
                    "gaps": gaps,
                    "average_gap": round(np.mean(gaps), 2),
                    "min_gap": min(gaps),
                    "max_gap": max(gaps),
                    "current_gap": len(draws) - 1 - appearances[-1] if appearances else 0
                }
        
        # Calcul des gaps pour les étoiles
        star_gaps = {}
        for star in range(1, 13):
            appearances = star_appearances[star]
            if len(appearances) > 1:
                gaps = [appearances[i+1] - appearances[i] for i in range(len(appearances)-1)]
                star_gaps[star] = {
                    "gaps": gaps,
                    "average_gap": round(np.mean(gaps), 2),
                    "min_gap": min(gaps),
                    "max_gap": max(gaps),
                    "current_gap": len(draws) - 1 - appearances[-1] if appearances else 0
                }
        
        return {
            "number_gaps": number_gaps,
            "star_gaps": star_gaps,
            "overdue_numbers": sorted(
                [(num, data["current_gap"]) for num, data in number_gaps.items()],
                key=lambda x: x[1],
                reverse=True
            )[:10],
            "overdue_stars": sorted(
                [(star, data["current_gap"]) for star, data in star_gaps.items()],
                key=lambda x: x[1],
                reverse=True
            )[:5]
        }
    
    def _calculate_sequence_stats(self, draws: List[DrawEuromillions]) -> Dict[str, Any]:
        """Analyse des séquences de numéros"""
        consecutive_counts = defaultdict(int)
        sum_ranges = defaultdict(int)
        odd_even_patterns = defaultdict(int)
        
        for draw in draws:
            numbers = sorted([draw.n1, draw.n2, draw.n3, draw.n4, draw.n5])
            
            # Compter les séquences consécutives
            consecutive = 0
            for i in range(len(numbers)-1):
                if numbers[i+1] - numbers[i] == 1:
                    consecutive += 1
                else:
                    if consecutive > 0:
                        consecutive_counts[consecutive] += 1
                    consecutive = 0
            if consecutive > 0:
                consecutive_counts[consecutive] += 1
            
            # Compter les sommes
            total_sum = sum(numbers)
            if total_sum <= 100:
                sum_ranges["1-100"] += 1
            elif total_sum <= 150:
                sum_ranges["101-150"] += 1
            elif total_sum <= 200:
                sum_ranges["151-200"] += 1
            else:
                sum_ranges["201+"] += 1
            
            # Compter les patterns pairs/impairs
            odd_count = sum(1 for n in numbers if n % 2 == 1)
            even_count = 5 - odd_count
            pattern = f"{odd_count}O{even_count}E"
            odd_even_patterns[pattern] += 1
        
        return {
            "consecutive_sequences": dict(consecutive_counts),
            "sum_ranges": dict(sum_ranges),
            "odd_even_patterns": dict(odd_even_patterns)
        }
    
    def _calculate_pattern_stats(self, draws: List[DrawEuromillions]) -> Dict[str, Any]:
        """Analyse des patterns de numéros"""
        high_low_patterns = defaultdict(int)
        decade_patterns = defaultdict(int)
        
        for draw in draws:
            numbers = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5]
            
            # Pattern haut/bas (1-25 vs 26-50)
            low_count = sum(1 for n in numbers if n <= 25)
            high_count = 5 - low_count
            high_low_patterns[f"{low_count}L{high_count}H"] += 1
            
            # Pattern par décennies
            decades = [0] * 5  # 1-10, 11-20, 21-30, 31-40, 41-50
            for num in numbers:
                decade_idx = (num - 1) // 10
                decades[decade_idx] += 1
            
            decade_pattern = "".join(str(d) for d in decades)
            decade_patterns[decade_pattern] += 1
        
        return {
            "high_low_patterns": dict(high_low_patterns),
            "decade_patterns": dict(decade_patterns)
        }
    
    def _calculate_temporal_stats(self, draws: List[DrawEuromillions]) -> Dict[str, Any]:
        """Analyse temporelle des numéros"""
        monthly_stats = defaultdict(lambda: defaultdict(int))
        yearly_stats = defaultdict(lambda: defaultdict(int))
        day_of_week_stats = defaultdict(lambda: defaultdict(int))
        
        for draw in draws:
            month = draw.date.month
            year = draw.date.year
            day_of_week = draw.date.weekday()  # 0=Lundi, 6=Dimanche
            
            numbers = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5]
            stars = [draw.e1, draw.e2]
            
            for num in numbers:
                monthly_stats[month][num] += 1
                yearly_stats[year][num] += 1
                day_of_week_stats[day_of_week][num] += 1
        
        return {
            "monthly_stats": dict(monthly_stats),
            "yearly_stats": dict(yearly_stats),
            "day_of_week_stats": dict(day_of_week_stats)
        }
    
    def _calculate_combination_stats(self, draws: List[DrawEuromillions]) -> Dict[str, Any]:
        """Analyse des combinaisons fréquentes"""
        pair_counts = Counter()
        triplet_counts = Counter()
        star_pair_counts = Counter()
        
        for draw in draws:
            numbers = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5]
            stars = [draw.e1, draw.e2]
            
            # Compter les paires de numéros
            for pair in combinations(sorted(numbers), 2):
                pair_counts[pair] += 1
            
            # Compter les triplets de numéros
            for triplet in combinations(sorted(numbers), 3):
                triplet_counts[triplet] += 1
            
            # Compter les paires d'étoiles
            star_pair_counts[tuple(sorted(stars))] += 1
        
        return {
            "frequent_pairs": [{"numbers": list(pair), "count": count} 
                             for pair, count in pair_counts.most_common(20)],
            "frequent_triplets": [{"numbers": list(triplet), "count": count} 
                                for triplet, count in triplet_counts.most_common(20)],
            "frequent_star_pairs": [{"stars": list(pair), "count": count} 
                                  for pair, count in star_pair_counts.most_common(10)]
        }
    
    def _calculate_correlation_stats(self, draws: List[DrawEuromillions]) -> Dict[str, Any]:
        """Analyse des corrélations entre numéros"""
        number_cooccurrences = defaultdict(lambda: defaultdict(int))
        
        for draw in draws:
            numbers = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5]
            
            for i, num1 in enumerate(numbers):
                for j, num2 in enumerate(numbers):
                    if i != j:
                        number_cooccurrences[num1][num2] += 1
        
        # Trouver les paires les plus corrélées
        correlations = []
        for num1 in range(1, 51):
            for num2 in range(num1 + 1, 51):
                cooccurrence = number_cooccurrences[num1][num2]
                if cooccurrence > 0:
                    correlations.append({
                        "num1": num1,
                        "num2": num2,
                        "cooccurrence": cooccurrence
                    })
        
        correlations.sort(key=lambda x: x["cooccurrence"], reverse=True)
        
        return {
            "strongest_correlations": correlations[:20],
            "number_cooccurrences": dict(number_cooccurrences)
        }
    
    def get_prediction_insights(self, year: Optional[int] = None) -> Dict[str, Any]:
        """Génère des insights pour les prédictions"""
        analysis = self.get_comprehensive_number_analysis(year)
        
        # Numéros en retard
        overdue_numbers = analysis["gap_statistics"]["overdue_numbers"]
        overdue_stars = analysis["gap_statistics"]["overdue_stars"]
        
        # Numéros les moins fréquents récemment
        recent_draws = self.db.query(DrawEuromillions).order_by(DrawEuromillions.date.desc()).limit(50).all()
        recent_numbers = defaultdict(int)
        recent_stars = defaultdict(int)
        
        for draw in recent_draws:
            numbers = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5]
            stars = [draw.e1, draw.e2]
            
            for num in numbers:
                recent_numbers[num] += 1
            for star in stars:
                recent_stars[star] += 1
        
        cold_numbers = [(num, count) for num, count in recent_numbers.items() if count <= 2]
        cold_stars = [(star, count) for star, count in recent_stars.items() if count <= 1]
        
        return {
            "overdue_numbers": overdue_numbers[:10],
            "overdue_stars": overdue_stars[:5],
            "cold_numbers": sorted(cold_numbers, key=lambda x: x[1])[:10],
            "cold_stars": sorted(cold_stars, key=lambda x: x[1])[:5],
            "hot_numbers": sorted(recent_numbers.items(), key=lambda x: x[1], reverse=True)[:10],
            "hot_stars": sorted(recent_stars.items(), key=lambda x: x[1], reverse=True)[:5]
        } 