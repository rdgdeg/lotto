from sqlalchemy.orm import Session
from collections import Counter, defaultdict
from typing import Dict, List, Tuple
import numpy as np
from datetime import datetime
from .models import DrawEuromillions, DrawLoto, Statistique

class StatistiquesAnalyzer:
    def __init__(self, db: Session):
        self.db = db
    
    def calculate_frequencies_euromillions(self) -> Dict:
        """Calcule les fréquences des numéros et étoiles pour Euromillions basées sur les données importées"""
        draws = self.db.query(DrawEuromillions).all()
        
        # Vérifier s'il y a des tirages
        if not draws or len(draws) == 0:
            return {
                "numeros": {i: 0.0 for i in range(1, 51)},
                "etoiles": {i: 0.0 for i in range(1, 13)},
                "total_draws": 0,
                "date_range": {"start": None, "end": None},
                "recent_draws": [],
                "numeros_count": {i: 0 for i in range(1, 51)},
                "etoiles_count": {i: 0 for i in range(1, 13)}
            }
        
        numeros = []
        etoiles = []
        numeros_count = {i: 0 for i in range(1, 51)}
        etoiles_count = {i: 0 for i in range(1, 13)}
        
        for draw in draws:
            numeros.extend([draw.n1, draw.n2, draw.n3, draw.n4, draw.n5])
            etoiles.extend([draw.e1, draw.e2])
            
            # Compter les occurrences
            numeros_count[draw.n1] += 1
            numeros_count[draw.n2] += 1
            numeros_count[draw.n3] += 1
            numeros_count[draw.n4] += 1
            numeros_count[draw.n5] += 1
            etoiles_count[draw.e1] += 1
            etoiles_count[draw.e2] += 1
        
        # Fréquences des numéros (1-50)
        freq_numeros = Counter(numeros)
        # Protection supplémentaire contre la division par zéro
        total_draws = len(draws)
        if total_draws == 0:
            freq_numeros_normalized = {i: 0.0 for i in range(1, 51)}
        else:
            freq_numeros_normalized = {i: freq_numeros.get(i, 0) / total_draws for i in range(1, 51)}
        
        # Fréquences des étoiles (1-12)
        freq_etoiles = Counter(etoiles)
        if total_draws == 0:
            freq_etoiles_normalized = {i: 0.0 for i in range(1, 13)}
        else:
            freq_etoiles_normalized = {i: freq_etoiles.get(i, 0) / total_draws for i in range(1, 13)}
        
        # Plage de dates
        dates = [draw.date for draw in draws]
        date_range = {
            "start": min(dates).strftime('%Y-%m-%d') if dates else None,
            "end": max(dates).strftime('%Y-%m-%d') if dates else None
        }
        
        # 7 derniers tirages
        recent_draws = self.db.query(DrawEuromillions).order_by(DrawEuromillions.date.desc()).limit(7).all()
        recent_draws_formatted = []
        for draw in recent_draws:
            recent_draws_formatted.append({
                "date": draw.date.strftime('%Y-%m-%d'),
                "numeros": [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5],
                "etoiles": [draw.e1, draw.e2],
                "id": draw.id
            })
        
        return {
            "numeros": freq_numeros_normalized,
            "etoiles": freq_etoiles_normalized,
            "total_draws": total_draws,
            "date_range": date_range,
            "recent_draws": recent_draws_formatted,
            "numeros_count": numeros_count,
            "etoiles_count": etoiles_count
        }
    
    def calculate_frequencies_loto(self) -> Dict:
        """Calcule les fréquences des numéros pour Loto basées sur les données importées"""
        draws = self.db.query(DrawLoto).all()
        
        # Vérifier s'il y a des tirages
        if not draws or len(draws) == 0:
            return {
                "numeros": {i: 0.0 for i in range(1, 46)},
                "complementaires": {i: 0.0 for i in range(1, 11)},
                "total_draws": 0,
                "date_range": {"start": None, "end": None},
                "recent_draws": [],
                "numeros_count": {i: 0 for i in range(1, 46)},
                "complementaires_count": {i: 0 for i in range(1, 11)}
            }
        
        numeros = []
        complementaires = []
        numeros_count = {i: 0 for i in range(1, 46)}
        complementaires_count = {i: 0 for i in range(1, 11)}
        
        for draw in draws:
            numeros.extend([draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6])
            complementaires.append(draw.complementaire)
            
            # Compter les occurrences
            numeros_count[draw.n1] += 1
            numeros_count[draw.n2] += 1
            numeros_count[draw.n3] += 1
            numeros_count[draw.n4] += 1
            numeros_count[draw.n5] += 1
            numeros_count[draw.n6] += 1
            complementaires_count[draw.complementaire] += 1
        
        # Fréquences des numéros (1-45)
        freq_numeros = Counter(numeros)
        freq_numeros_normalized = {i: freq_numeros.get(i, 0) / len(draws) for i in range(1, 46)}
        
        # Fréquences des complémentaires (1-10)
        freq_complementaires = Counter(complementaires)
        freq_complementaires_normalized = {i: freq_complementaires.get(i, 0) / len(draws) for i in range(1, 11)}
        
        # Plage de dates
        dates = [draw.date for draw in draws]
        date_range = {
            "start": min(dates).strftime('%Y-%m-%d') if dates else None,
            "end": max(dates).strftime('%Y-%m-%d') if dates else None
        }
        
        # 7 derniers tirages
        recent_draws = self.db.query(DrawLoto).order_by(DrawLoto.date.desc()).limit(7).all()
        recent_draws_formatted = []
        for draw in recent_draws:
            recent_draws_formatted.append({
                "date": draw.date.strftime('%Y-%m-%d'),
                "numeros": [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6],
                "complementaire": draw.complementaire,
                "id": draw.id
            })
        
        return {
            "numeros": freq_numeros_normalized,
            "complementaires": freq_complementaires_normalized,
            "total_draws": len(draws),
            "date_range": date_range,
            "recent_draws": recent_draws_formatted,
            "numeros_count": numeros_count,
            "complementaires_count": complementaires_count
        }
    
    def find_frequent_pairs_euromillions(self, min_frequency: float = 0.1) -> List[Tuple]:
        """Trouve les paires de numéros qui sortent souvent ensemble"""
        draws = self.db.query(DrawEuromillions).all()
        
        if not draws:
            return []
        
        pairs = []
        
        for draw in draws:
            nums = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5]
            for i in range(len(nums)):
                for j in range(i+1, len(nums)):
                    pairs.append(tuple(sorted([nums[i], nums[j]])))
        
        pair_freq = Counter(pairs)
        total_draws = len(draws)
        
        frequent_pairs = [
            (pair, freq/total_draws) 
            for pair, freq in pair_freq.items() 
            if freq/total_draws >= min_frequency
        ]
        
        return sorted(frequent_pairs, key=lambda x: x[1], reverse=True)
    
    def find_frequent_pairs_loto(self, min_frequency: float = 0.1) -> List[Tuple]:
        """Trouve les paires de numéros qui sortent souvent ensemble pour Loto"""
        draws = self.db.query(DrawLoto).all()
        
        if not draws:
            return []
        
        pairs = []
        
        for draw in draws:
            nums = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6]
            for i in range(len(nums)):
                for j in range(i+1, len(nums)):
                    pairs.append(tuple(sorted([nums[i], nums[j]])))
        
        pair_freq = Counter(pairs)
        total_draws = len(draws)
        
        frequent_pairs = [
            (pair, freq/total_draws) 
            for pair, freq in pair_freq.items() 
            if freq/total_draws >= min_frequency
        ]
        
        return sorted(frequent_pairs, key=lambda x: x[1], reverse=True)
    
    def get_hot_cold_numbers_euromillions(self, recent_draws: int = 50) -> Dict:
        """Identifie les numéros chauds et froids basés sur les tirages récents"""
        draws = self.db.query(DrawEuromillions).order_by(DrawEuromillions.date.desc()).limit(recent_draws).all()
        
        if not draws:
            return {
                "hot_numeros": [],
                "hot_etoiles": [],
                "cold_numeros": [(i, 0) for i in range(1, 51)],
                "cold_etoiles": [(i, 0) for i in range(1, 13)]
            }
        
        numeros = []
        etoiles = []
        
        for draw in draws:
            numeros.extend([draw.n1, draw.n2, draw.n3, draw.n4, draw.n5])
            etoiles.extend([draw.e1, draw.e2])
        
        freq_numeros = Counter(numeros)
        freq_etoiles = Counter(etoiles)
        
        # Numéros chauds (sortis le plus souvent récemment)
        hot_numeros = sorted(freq_numeros.items(), key=lambda x: x[1], reverse=True)[:10]
        hot_etoiles = sorted(freq_etoiles.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Numéros froids (pas sortis récemment)
        all_numeros = set(range(1, 51))
        all_etoiles = set(range(1, 13))
        
        cold_numeros = [(num, 0) for num in all_numeros - set(freq_numeros.keys())]
        cold_etoiles = [(etoile, 0) for etoile in all_etoiles - set(freq_etoiles.keys())]
        
        return {
            "hot_numeros": hot_numeros,
            "hot_etoiles": hot_etoiles,
            "cold_numeros": cold_numeros,
            "cold_etoiles": cold_etoiles
        }
    
    def get_hot_cold_numbers_loto(self, recent_draws: int = 50) -> Dict:
        """Identifie les numéros chauds et froids pour Loto"""
        draws = self.db.query(DrawLoto).order_by(DrawLoto.date.desc()).limit(recent_draws).all()
        
        if not draws:
            return {
                "hot_numeros": [],
                "hot_complementaires": [],
                "cold_numeros": [(i, 0) for i in range(1, 46)],
                "cold_complementaires": [(i, 0) for i in range(1, 46)]
            }
        
        numeros = []
        complementaires = []
        
        for draw in draws:
            numeros.extend([draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6])
            complementaires.append(draw.complementaire)
        
        freq_numeros = Counter(numeros)
        freq_complementaires = Counter(complementaires)
        
        # Numéros chauds
        hot_numeros = sorted(freq_numeros.items(), key=lambda x: x[1], reverse=True)[:10]
        hot_complementaires = sorted(freq_complementaires.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Numéros froids
        all_numeros = set(range(1, 46))
        all_complementaires = set(range(1, 46))
        
        cold_numeros = [(num, 0) for num in all_numeros - set(freq_numeros.keys())]
        cold_complementaires = [(num, 0) for num in all_complementaires - set(freq_complementaires.keys())]
        
        return {
            "hot_numeros": hot_numeros,
            "hot_complementaires": hot_complementaires,
            "cold_numeros": cold_numeros,
            "cold_complementaires": cold_complementaires
        } 
    
    def get_detailed_stats_euromillions(self) -> Dict:
        """Récupère des statistiques détaillées pour Euromillions"""
        frequencies = self.calculate_frequencies_euromillions()
        
        # Top et bottom numéros
        numeros_sorted = sorted(frequencies["numeros"].items(), key=lambda x: x[1], reverse=True)
        top_numeros = numeros_sorted[:10]
        bottom_numeros = numeros_sorted[-10:]
        
        # Top et bottom étoiles
        etoiles_sorted = sorted(frequencies["etoiles"].items(), key=lambda x: x[1], reverse=True)
        top_etoiles = etoiles_sorted[:6]
        bottom_etoiles = etoiles_sorted[-6:]
        
        # Statistiques par année
        current_year = datetime.now().year
        year_stats = self.get_year_stats_euromillions(current_year)
        
        return {
            "total_draws": frequencies["total_draws"],
            "date_range": frequencies["date_range"],
            "recent_draws": frequencies["recent_draws"],
            "top_numeros": [
                {"numero": num, "frequency": freq, "count": frequencies["numeros_count"][num], "percentage": freq * 100}
                for num, freq in top_numeros
            ],
            "bottom_numeros": [
                {"numero": num, "frequency": freq, "count": frequencies["numeros_count"][num], "percentage": freq * 100}
                for num, freq in bottom_numeros
            ],
            "top_etoiles": [
                {"etoile": etoile, "frequency": freq, "count": frequencies["etoiles_count"][etoile], "percentage": freq * 100}
                for etoile, freq in top_etoiles
            ],
            "bottom_etoiles": [
                {"etoile": etoile, "frequency": freq, "count": frequencies["etoiles_count"][etoile], "percentage": freq * 100}
                for etoile, freq in bottom_etoiles
            ],
            "year_stats": year_stats
        }
    
    def get_detailed_stats_loto(self) -> Dict:
        """Récupère des statistiques détaillées pour Loto"""
        frequencies = self.calculate_frequencies_loto()
        
        # Top et bottom numéros
        numeros_sorted = sorted(frequencies["numeros"].items(), key=lambda x: x[1], reverse=True)
        top_numeros = numeros_sorted[:10]
        bottom_numeros = numeros_sorted[-10:]
        
        # Top et bottom complémentaires
        complementaires_sorted = sorted(frequencies["complementaires"].items(), key=lambda x: x[1], reverse=True)
        top_complementaires = complementaires_sorted[:6]
        bottom_complementaires = complementaires_sorted[-6:]
        
        # Statistiques par année
        current_year = datetime.now().year
        year_stats = self.get_year_stats_loto(current_year)
        
        return {
            "total_draws": frequencies["total_draws"],
            "date_range": frequencies["date_range"],
            "recent_draws": frequencies["recent_draws"],
            "top_numeros": [
                {"numero": num, "frequency": freq, "count": frequencies["numeros_count"][num], "percentage": freq * 100}
                for num, freq in top_numeros
            ],
            "bottom_numeros": [
                {"numero": num, "frequency": freq, "count": frequencies["numeros_count"][num], "percentage": freq * 100}
                for num, freq in bottom_numeros
            ],
            "top_complementaires": [
                {"complementaire": comp, "frequency": freq, "count": frequencies["complementaires_count"][comp], "percentage": freq * 100}
                for comp, freq in top_complementaires
            ],
            "bottom_complementaires": [
                {"complementaire": comp, "frequency": freq, "count": frequencies["complementaires_count"][comp], "percentage": freq * 100}
                for comp, freq in bottom_complementaires
            ],
            "year_stats": year_stats
        }
    
    def get_year_stats_euromillions(self, year: int) -> Dict:
        """Récupère les statistiques pour une année spécifique - Euromillions"""
        draws = self.db.query(DrawEuromillions).filter(
            DrawEuromillions.date >= f"{year}-01-01",
            DrawEuromillions.date <= f"{year}-12-31"
        ).all()
        
        if not draws:
            return {
                "total_draws": 0,
                "top_numeros": [],
                "top_etoiles": []
            }
        
        numeros = []
        etoiles = []
        numeros_count = {i: 0 for i in range(1, 51)}
        etoiles_count = {i: 0 for i in range(1, 13)}
        
        for draw in draws:
            numeros.extend([draw.n1, draw.n2, draw.n3, draw.n4, draw.n5])
            etoiles.extend([draw.e1, draw.e2])
            
            numeros_count[draw.n1] += 1
            numeros_count[draw.n2] += 1
            numeros_count[draw.n3] += 1
            numeros_count[draw.n4] += 1
            numeros_count[draw.n5] += 1
            etoiles_count[draw.e1] += 1
            etoiles_count[draw.e2] += 1
        
        freq_numeros = Counter(numeros)
        freq_etoiles = Counter(etoiles)
        
        top_numeros = sorted(freq_numeros.items(), key=lambda x: x[1], reverse=True)[:5]
        top_etoiles = sorted(freq_etoiles.items(), key=lambda x: x[1], reverse=True)[:3]
        
        return {
            "total_draws": len(draws),
            "top_numeros": [
                {"numero": num, "count": count, "percentage": (count / len(draws)) * 100}
                for num, count in top_numeros
            ],
            "top_etoiles": [
                {"etoile": etoile, "count": count, "percentage": (count / len(draws)) * 100}
                for etoile, count in top_etoiles
            ]
        }
    
    def get_year_stats_loto(self, year: int) -> Dict:
        """Récupère les statistiques pour une année spécifique - Loto"""
        draws = self.db.query(DrawLoto).filter(
            DrawLoto.date >= f"{year}-01-01",
            DrawLoto.date <= f"{year}-12-31"
        ).all()
        
        if not draws:
            return {
                "total_draws": 0,
                "top_numeros": [],
                "top_complementaires": []
            }
        
        numeros = []
        complementaires = []
        numeros_count = {i: 0 for i in range(1, 46)}
        complementaires_count = {i: 0 for i in range(1, 46)}
        
        for draw in draws:
            numeros.extend([draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6])
            complementaires.append(draw.complementaire)
            
            numeros_count[draw.n1] += 1
            numeros_count[draw.n2] += 1
            numeros_count[draw.n3] += 1
            numeros_count[draw.n4] += 1
            numeros_count[draw.n5] += 1
            numeros_count[draw.n6] += 1
            complementaires_count[draw.complementaire] += 1
        
        freq_numeros = Counter(numeros)
        freq_complementaires = Counter(complementaires)
        
        top_numeros = sorted(freq_numeros.items(), key=lambda x: x[1], reverse=True)[:5]
        top_complementaires = sorted(freq_complementaires.items(), key=lambda x: x[1], reverse=True)[:3]
        
        return {
            "total_draws": len(draws),
            "top_numeros": [
                {"numero": num, "count": count, "percentage": (count / len(draws)) * 100}
                for num, count in top_numeros
            ],
            "top_complementaires": [
                {"complementaire": comp, "count": count, "percentage": (count / len(draws)) * 100}
                for comp, count in top_complementaires
            ]
        } 