import random
import numpy as np
from typing import List, Dict
from sqlalchemy.orm import Session
from .models import DrawEuromillions, DrawLoto

class MonteCarloSimulator:
    def __init__(self, db: Session):
        self.db = db
    
    def simulate_euromillions(self, grids: List[Dict], num_simulations: int = 10000) -> Dict:
        """Simule des tirages Euromillions pour évaluer les grilles"""
        # Récupérer l'historique des tirages pour les probabilités
        draws = self.db.query(DrawEuromillions).all()
        
        if not draws:
            return {"error": "Aucun tirage historique disponible pour la simulation"}
        
        # Calculer les fréquences historiques
        numeros_freq = {}
        etoiles_freq = {}
        
        for draw in draws:
            for num in [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5]:
                numeros_freq[num] = numeros_freq.get(num, 0) + 1
            for etoile in [draw.e1, draw.e2]:
                etoiles_freq[etoile] = etoiles_freq.get(etoile, 0) + 1
        
        # Normaliser les fréquences
        total_draws = len(draws)
        numeros_weights = [numeros_freq.get(i, 1) / total_draws for i in range(1, 51)]
        etoiles_weights = [etoiles_freq.get(i, 1) / total_draws for i in range(1, 13)]
        
        # Normaliser
        numeros_weights = np.array(numeros_weights)
        etoiles_weights = np.array(etoiles_weights)
        numeros_weights = numeros_weights / numeros_weights.sum()
        etoiles_weights = etoiles_weights / etoiles_weights.sum()
        
        # Résultats de simulation
        results = {
            "grids": [],
            "total_wins": 0,
            "win_breakdown": {
                "5+2": 0, "5+1": 0, "5+0": 0,
                "4+2": 0, "4+1": 0, "4+0": 0,
                "3+2": 0, "3+1": 0, "3+0": 0,
                "2+2": 0, "2+1": 0, "2+0": 0,
                "1+2": 0, "1+1": 0, "1+0": 0,
                "0+2": 0, "0+1": 0, "0+0": 0
            }
        }
        
        for grid_idx, grid in enumerate(grids):
            grid_wins = 0
            grid_breakdown = {k: 0 for k in results["win_breakdown"].keys()}
            
            for _ in range(num_simulations):
                # Simuler un tirage
                drawn_numeros = np.random.choice(range(1, 51), size=5, replace=False, p=numeros_weights)
                drawn_etoiles = np.random.choice(range(1, 13), size=2, replace=False, p=etoiles_weights)
                
                # Compter les correspondances
                numeros_matches = len(set(grid["numeros"]) & set(drawn_numeros))
                etoiles_matches = len(set(grid["etoiles"]) & set(drawn_etoiles))
                
                # Déterminer le gain
                win_key = f"{numeros_matches}+{etoiles_matches}"
                if win_key in grid_breakdown:
                    grid_breakdown[win_key] += 1
                    grid_wins += 1
            
            # Calculer les probabilités
            grid_probabilities = {
                k: v / num_simulations for k, v in grid_breakdown.items()
            }
            
            results["grids"].append({
                "grid_index": grid_idx,
                "grid": grid,
                "total_wins": grid_wins,
                "win_probability": grid_wins / num_simulations,
                "win_breakdown": grid_breakdown,
                "probabilities": grid_probabilities
            })
            
            # Ajouter aux totaux
            results["total_wins"] += grid_wins
            for k, v in grid_breakdown.items():
                results["win_breakdown"][k] += v
        
        # Probabilités globales
        total_possible_wins = len(grids) * num_simulations
        results["global_probabilities"] = {
            k: v / total_possible_wins for k, v in results["win_breakdown"].items()
        }
        
        return results
    
    def simulate_loto(self, grids: List[Dict], num_simulations: int = 10000) -> Dict:
        """Simule des tirages Loto pour évaluer les grilles"""
        # Récupérer l'historique des tirages
        draws = self.db.query(DrawLoto).all()
        
        if not draws:
            return {"error": "Aucun tirage historique disponible pour la simulation"}
        
        # Calculer les fréquences historiques
        numeros_freq = {}
        complementaires_freq = {}
        
        for draw in draws:
            for num in [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6]:
                numeros_freq[num] = numeros_freq.get(num, 0) + 1
            complementaires_freq[draw.complementaire] = complementaires_freq.get(draw.complementaire, 0) + 1
        
        # Normaliser les fréquences
        total_draws = len(draws)
        numeros_weights = [numeros_freq.get(i, 1) / total_draws for i in range(1, 46)]
        complementaires_weights = [complementaires_freq.get(i, 1) / total_draws for i in range(1, 46)]
        
        # Normaliser
        numeros_weights = np.array(numeros_weights)
        complementaires_weights = np.array(complementaires_weights)
        numeros_weights = numeros_weights / numeros_weights.sum()
        complementaires_weights = complementaires_weights / complementaires_weights.sum()
        
        # Résultats de simulation
        results = {
            "grids": [],
            "total_wins": 0,
            "win_breakdown": {
                "6+1": 0, "6+0": 0,
                "5+1": 0, "5+0": 0,
                "4+1": 0, "4+0": 0,
                "3+1": 0, "3+0": 0,
                "2+1": 0, "2+0": 0,
                "1+1": 0, "1+0": 0,
                "0+1": 0, "0+0": 0
            }
        }
        
        for grid_idx, grid in enumerate(grids):
            grid_wins = 0
            grid_breakdown = {k: 0 for k in results["win_breakdown"].keys()}
            
            for _ in range(num_simulations):
                # Simuler un tirage
                drawn_numeros = np.random.choice(range(1, 46), size=6, replace=False, p=numeros_weights)
                drawn_complementaire = np.random.choice(range(1, 46), size=1, p=complementaires_weights)[0]
                
                # Compter les correspondances
                numeros_matches = len(set(grid["numeros"]) & set(drawn_numeros))
                complementaire_match = 1 if grid["complementaire"] == drawn_complementaire else 0
                
                # Déterminer le gain
                win_key = f"{numeros_matches}+{complementaire_match}"
                if win_key in grid_breakdown:
                    grid_breakdown[win_key] += 1
                    grid_wins += 1
            
            # Calculer les probabilités
            grid_probabilities = {
                k: v / num_simulations for k, v in grid_breakdown.items()
            }
            
            results["grids"].append({
                "grid_index": grid_idx,
                "grid": grid,
                "total_wins": grid_wins,
                "win_probability": grid_wins / num_simulations,
                "win_breakdown": grid_breakdown,
                "probabilities": grid_probabilities
            })
            
            # Ajouter aux totaux
            results["total_wins"] += grid_wins
            for k, v in grid_breakdown.items():
                results["win_breakdown"][k] += v
        
        # Probabilités globales
        total_possible_wins = len(grids) * num_simulations
        results["global_probabilities"] = {
            k: v / total_possible_wins for k, v in results["win_breakdown"].items()
        }
        
        return results 