#!/usr/bin/env python3
"""
Analyses avancées pour le Loto
Module complet pour analyser les données de tirages Loto importées
"""

from sqlalchemy.orm import Session
from sqlalchemy import extract, func, and_
from collections import Counter, defaultdict
from typing import Dict, List, Tuple, Any, Optional
import numpy as np
from datetime import datetime, timedelta
from .models import DrawLoto

class LotoAdvancedStats:
    def __init__(self, db: Session):
        self.db = db
    
    def get_comprehensive_stats(self) -> Dict[str, Any]:
        """Retourne toutes les statistiques avancées du Loto"""
        draws = self.db.query(DrawLoto).all()
        
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
        
        # Statistiques par année
        yearly_stats = self._calculate_yearly_stats(draws)
        
        # Analyse des séquences
        sequences = self.analyze_sequences()
        
        # Analyse des parités
        parity_analysis = self.analyze_parity()
        
        # Analyse des sommes
        sum_analysis = self.analyze_sums()
        
        return {
            "basic_stats": basic_stats,
            "frequent_combinations": frequent_combinations[:20],  # Top 20
            "patterns": patterns,
            "hot_cold_analysis": hot_cold,
            "yearly_stats": yearly_stats,
            "sequences": sequences,
            "parity_analysis": parity_analysis,
            "sum_analysis": sum_analysis,
            "total_draws": len(draws),
            "date_range": {
                "start": min(draw.date for draw in draws).strftime('%Y-%m-%d'),
                "end": max(draw.date for draw in draws).strftime('%Y-%m-%d')
            }
        }
    
    def _calculate_basic_stats(self, draws: List[DrawLoto]) -> Dict[str, Any]:
        """Calcule les statistiques de base"""
        numeros = []
        complementaires = []
        
        for draw in draws:
            numeros.extend([draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6])
            complementaires.append(draw.complementaire)
        
        # Fréquences
        numeros_freq = Counter(numeros)
        complementaires_freq = Counter(complementaires)
        
        # Top et bottom numéros
        top_numeros = numeros_freq.most_common(10)
        bottom_numeros = sorted([(num, count) for num, count in numeros_freq.items()], key=lambda x: x[1])[:10]
        
        # Top et bottom complémentaires
        top_complementaires = complementaires_freq.most_common(10)
        bottom_complementaires = sorted([(num, count) for num, count in complementaires_freq.items()], key=lambda x: x[1])[:10]
        
        # Calculer les totaux
        total_numero_occurrences = sum(numeros_freq.values())
        total_complementaire_occurrences = sum(complementaires_freq.values())
        
        # Convertir en format attendu par le frontend
        def format_stats(items, total_occurrences):
            return [
                {
                    "numero": num,
                    "frequence": count,
                    "pourcentage": (count / total_occurrences) * 100 if total_occurrences > 0 else 0
                } 
                for num, count in items
            ]
        
        return {
            "total_draws": len(draws),
            "numeros": format_stats(top_numeros, total_numero_occurrences),
            "complementaires": format_stats(top_complementaires, total_complementaire_occurrences),
            "average_sum": np.mean([sum([draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6]) for draw in draws]),
            "median_sum": np.median([sum([draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6]) for draw in draws])
        }
    
    def find_most_frequent_combinations(self, min_frequency: float = 0.05) -> List[Dict]:
        """Trouve les combinaisons de numéros les plus fréquentes"""
        draws = self.db.query(DrawLoto).all()
        
        if not draws:
            return []
        
        # Paires de numéros
        pairs = []
        # Triplets de numéros
        triplets = []
        
        for draw in draws:
            nums = sorted([draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6])
            
            # Paires
            for i in range(len(nums)):
                for j in range(i+1, len(nums)):
                    pairs.append((nums[i], nums[j]))
            
            # Triplets
            for i in range(len(nums)):
                for j in range(i+1, len(nums)):
                    for k in range(j+1, len(nums)):
                        triplets.append((nums[i], nums[j], nums[k]))
        
        pairs_freq = Counter(pairs)
        triplets_freq = Counter(triplets)
        
        total_draws = len(draws)
        
        frequent_pairs = [
            {"type": "paire", "numbers": list(pair), "count": count, "frequency": count/total_draws}
            for pair, count in pairs_freq.most_common(20)
            if count/total_draws >= min_frequency
        ]
        
        frequent_triplets = [
            {"type": "triplet", "numbers": list(triplet), "count": count, "frequency": count/total_draws}
            for triplet, count in triplets_freq.most_common(20)
            if count/total_draws >= min_frequency
        ]
        
        return frequent_pairs + frequent_triplets
    
    def analyze_number_patterns(self) -> Dict[str, Any]:
        """Analyse les patterns dans les numéros"""
        draws = self.db.query(DrawLoto).all()
        
        if not draws:
            return {}
        
        patterns = {
            "consecutive_numbers": 0,
            "even_odd_distribution": [],
            "high_low_distribution": [],
            "sum_distribution": [],
            "gap_analysis": []
        }
        
        for draw in draws:
            nums = sorted([draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6])
            
            # Nombres consécutifs
            consecutive_count = 0
            for i in range(len(nums)-1):
                if nums[i+1] - nums[i] == 1:
                    consecutive_count += 1
            if consecutive_count > 0:
                patterns["consecutive_numbers"] += 1
            
            # Distribution pair/impair
            even_count = len([n for n in nums if n % 2 == 0])
            odd_count = 6 - even_count
            patterns["even_odd_distribution"].append(f"{even_count}E/{odd_count}I")
            
            # Distribution haut/bas (1-22 vs 23-45)
            low_count = len([n for n in nums if n <= 22])
            high_count = 6 - low_count
            patterns["high_low_distribution"].append(f"{low_count}L/{high_count}H")
            
            # Somme des numéros
            total_sum = sum(nums)
            patterns["sum_distribution"].append(total_sum)
            
            # Analyse des écarts
            gaps = [nums[i+1] - nums[i] for i in range(len(nums)-1)]
            patterns["gap_analysis"].extend(gaps)
        
        # Calculer les statistiques
        total_draws = len(draws)
        
        return {
            "consecutive_frequency": patterns["consecutive_numbers"] / total_draws,
            "even_odd_stats": Counter(patterns["even_odd_distribution"]),
            "high_low_stats": Counter(patterns["high_low_distribution"]),
            "sum_stats": {
                "min": min(patterns["sum_distribution"]),
                "max": max(patterns["sum_distribution"]),
                "mean": np.mean(patterns["sum_distribution"]),
                "median": np.median(patterns["sum_distribution"])
            },
            "gap_stats": {
                "min": min(patterns["gap_analysis"]),
                "max": max(patterns["gap_analysis"]),
                "mean": np.mean(patterns["gap_analysis"]),
                "most_common": Counter(patterns["gap_analysis"]).most_common(5)
            }
        }
    
    def get_hot_cold_analysis(self, recent_draws: int = 50) -> Dict[str, Any]:
        """Analyse des numéros chauds et froids"""
        # Tirages récents
        recent_draws_list = self.db.query(DrawLoto).order_by(DrawLoto.date.desc()).limit(recent_draws).all()
        
        # Tirages plus anciens
        older_draws = self.db.query(DrawLoto).order_by(DrawLoto.date.desc()).offset(recent_draws).limit(recent_draws).all()
        
        if not recent_draws_list or not older_draws:
            return {"error": "Pas assez de données pour l'analyse"}
        
        # Analyser les numéros récents
        recent_numeros = []
        recent_complementaires = []
        for draw in recent_draws_list:
            recent_numeros.extend([draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6])
            recent_complementaires.append(draw.complementaire)
        
        # Analyser les numéros anciens
        older_numeros = []
        older_complementaires = []
        for draw in older_draws:
            older_numeros.extend([draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6])
            older_complementaires.append(draw.complementaire)
        
        recent_numeros_freq = Counter(recent_numeros)
        recent_complementaires_freq = Counter(recent_complementaires)
        older_numeros_freq = Counter(older_numeros)
        older_complementaires_freq = Counter(older_complementaires)
        
        # Identifier les numéros chauds et froids
        hot_numbers = []
        cold_numbers = []
        hot_complementaires = []
        cold_complementaires = []
        
        for num in range(1, 46):
            recent_freq = recent_numeros_freq.get(num, 0) / len(recent_draws_list)
            older_freq = older_numeros_freq.get(num, 0) / len(older_draws)
            
            if recent_freq > older_freq * 1.5:  # 50% plus fréquent récemment
                hot_numbers.append({
                    "numero": num,
                    "recent_frequency": recent_freq,
                    "older_frequency": older_freq,
                    "trend": "hot"
                })
            elif older_freq > recent_freq * 1.5:  # 50% moins fréquent récemment
                cold_numbers.append({
                    "numero": num,
                    "recent_frequency": recent_freq,
                    "older_frequency": older_freq,
                    "trend": "cold"
                })
        
        # Même analyse pour les complémentaires
        for num in range(1, 46):
            recent_freq = recent_complementaires_freq.get(num, 0) / len(recent_draws_list)
            older_freq = older_complementaires_freq.get(num, 0) / len(older_draws)
            
            if recent_freq > older_freq * 1.5:
                hot_complementaires.append({
                    "numero": num,
                    "recent_frequency": recent_freq,
                    "older_frequency": older_freq,
                    "trend": "hot"
                })
            elif older_freq > recent_freq * 1.5:
                cold_complementaires.append({
                    "numero": num,
                    "recent_frequency": recent_freq,
                    "older_frequency": older_freq,
                    "trend": "cold"
                })
        
        return {
            "hot_numbers": sorted(hot_numbers, key=lambda x: x["recent_frequency"], reverse=True),
            "cold_numbers": sorted(cold_numbers, key=lambda x: x["older_frequency"], reverse=True),
            "hot_complementaires": sorted(hot_complementaires, key=lambda x: x["recent_frequency"], reverse=True),
            "cold_complementaires": sorted(cold_complementaires, key=lambda x: x["older_frequency"], reverse=True),
            "analysis_period": f"Récent: {len(recent_draws_list)} tirages, Ancien: {len(older_draws)} tirages"
        }
    
    def _calculate_yearly_stats(self, draws: List[DrawLoto]) -> Dict[int, Dict]:
        """Calcule les statistiques par année"""
        yearly_data = defaultdict(list)
        
        for draw in draws:
            year = draw.date.year
            yearly_data[year].append(draw)
        
        yearly_stats = {}
        for year, year_draws in yearly_data.items():
            numeros = []
            complementaires = []
            
            for draw in year_draws:
                numeros.extend([draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6])
                complementaires.append(draw.complementaire)
            
            numeros_freq = Counter(numeros)
            complementaires_freq = Counter(complementaires)
            
            yearly_stats[year] = {
                "total_draws": len(year_draws),
                "top_numeros": numeros_freq.most_common(5),
                "top_complementaires": complementaires_freq.most_common(5),
                "average_sum": np.mean([sum([draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6]) for draw in year_draws])
            }
        
        return yearly_stats
    
    def analyze_sequences(self) -> Dict[str, Any]:
        """Analyse les séquences de numéros"""
        draws = self.db.query(DrawLoto).all()
        
        if not draws:
            return {}
        
        sequences = {
            "consecutive_sequences": [],
            "arithmetic_sequences": [],
            "geometric_sequences": []
        }
        
        for draw in draws:
            nums = sorted([draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6])
            
            # Séquences consécutives
            consecutive_count = 0
            max_consecutive = 0
            for i in range(len(nums)-1):
                if nums[i+1] - nums[i] == 1:
                    consecutive_count += 1
                    max_consecutive = max(max_consecutive, consecutive_count)
                else:
                    consecutive_count = 0
            
            if max_consecutive > 0:
                sequences["consecutive_sequences"].append(max_consecutive)
        
        return {
            "consecutive_stats": {
                "max_consecutive": max(sequences["consecutive_sequences"]) if sequences["consecutive_sequences"] else 0,
                "average_consecutive": np.mean(sequences["consecutive_sequences"]) if sequences["consecutive_sequences"] else 0,
                "consecutive_frequency": len(sequences["consecutive_sequences"]) / len(draws)
            }
        }
    
    def analyze_parity(self) -> Dict[str, Any]:
        """Analyse la parité des numéros"""
        draws = self.db.query(DrawLoto).all()
        
        if not draws:
            return {}
        
        parity_distributions = []
        
        for draw in draws:
            nums = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6]
            even_count = len([n for n in nums if n % 2 == 0])
            odd_count = 6 - even_count
            parity_distributions.append((even_count, odd_count))
        
        parity_counter = Counter(parity_distributions)
        total_draws = len(draws)
        
        return {
            "parity_distributions": {
                f"{even}E/{odd}I": {
                    "count": count,
                    "frequency": count / total_draws,
                    "percentage": (count / total_draws) * 100
                }
                for (even, odd), count in parity_counter.items()
            },
            "most_common_parity": parity_counter.most_common(1)[0] if parity_counter else None
        }
    
    def analyze_sums(self) -> Dict[str, Any]:
        """Analyse des sommes des numéros"""
        draws = self.db.query(DrawLoto).all()
        
        if not draws:
            return {}
        
        sums = [sum([draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6]) for draw in draws]
        
        return {
            "sum_statistics": {
                "min": min(sums),
                "max": max(sums),
                "mean": np.mean(sums),
                "median": np.median(sums),
                "std": np.std(sums)
            },
            "sum_distribution": {
                "low": len([s for s in sums if s < 100]),
                "medium": len([s for s in sums if 100 <= s <= 150]),
                "high": len([s for s in sums if s > 150])
            },
            "most_common_sums": Counter(sums).most_common(10)
        }
    
    def get_number_trends(self, number: int, days: int = 365) -> Dict[str, Any]:
        """Analyse les tendances d'un numéro spécifique"""
        cutoff_date = datetime.now().date() - timedelta(days=days)
        
        recent_draws = self.db.query(DrawLoto).filter(
            DrawLoto.date >= cutoff_date
        ).all()
        
        older_draws = self.db.query(DrawLoto).filter(
            DrawLoto.date < cutoff_date
        ).all()
        
        if not recent_draws or not older_draws:
            return {"error": "Pas assez de données pour l'analyse"}
        
        # Compter les occurrences
        recent_count = 0
        older_count = 0
        
        for draw in recent_draws:
            if number in [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6]:
                recent_count += 1
        
        for draw in older_draws:
            if number in [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6]:
                older_count += 1
        
        recent_freq = recent_count / len(recent_draws)
        older_freq = older_count / len(older_draws)
        
        trend = "stable"
        if recent_freq > older_freq * 1.2:
            trend = "increasing"
        elif recent_freq < older_freq * 0.8:
            trend = "decreasing"
        
        return {
            "number": number,
            "recent_frequency": recent_freq,
            "older_frequency": older_freq,
            "trend": trend,
            "recent_draws": len(recent_draws),
            "older_draws": len(older_draws),
            "recent_occurrences": recent_count,
            "older_occurrences": older_count
        } 