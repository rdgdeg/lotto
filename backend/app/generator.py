import random
import numpy as np
from typing import List, Dict, Tuple
from sqlalchemy.orm import Session
from .stats import StatistiquesAnalyzer
from .models import Statistique

class GridGenerator:
    def __init__(self, db: Session):
        self.db = db
        self.analyzer = StatistiquesAnalyzer(db)
    
    def get_imported_stats(self, jeu: str) -> Dict[int, float]:
        """Récupère les statistiques importées pour un jeu donné"""
        stats = self.db.query(Statistique).filter(Statistique.jeu == jeu).all()
        stats_dict = {}
        for stat in stats:
            if stat.type == "numero":
                stats_dict[stat.numero] = stat.frequence
        return stats_dict
    
    def generate_weighted_grid_euromillions(self, use_imported_stats: bool = True) -> Dict:
        """Génère une grille Euromillions pondérée par les fréquences"""
        if use_imported_stats:
            # Utiliser les stats importées si disponibles
            imported_stats = self.get_imported_stats("euromillions")
            if imported_stats:
                # Créer des poids basés sur les stats importées
                numeros_weights = [imported_stats.get(i, 0.1) for i in range(1, 51)]
                etoiles_weights = [imported_stats.get(i, 0.1) for i in range(1, 13)]
            else:
                # Utiliser les stats calculées
                freq_data = self.analyzer.calculate_frequencies_euromillions()
                numeros_weights = [freq_data["numeros"].get(i, 0.1) for i in range(1, 51)]
                etoiles_weights = [freq_data["etoiles"].get(i, 0.1) for i in range(1, 13)]
        else:
            # Utiliser les stats calculées
            freq_data = self.analyzer.calculate_frequencies_euromillions()
            numeros_weights = [freq_data["numeros"].get(i, 0.1) for i in range(1, 51)]
            etoiles_weights = [freq_data["etoiles"].get(i, 0.1) for i in range(1, 13)]
        
        # Normaliser les poids
        numeros_weights = np.array(numeros_weights)
        etoiles_weights = np.array(etoiles_weights)
        
        numeros_weights = numeros_weights / numeros_weights.sum()
        etoiles_weights = etoiles_weights / etoiles_weights.sum()
        
        # Tirer 5 numéros sans remise
        numeros = np.random.choice(range(1, 51), size=5, replace=False, p=numeros_weights)
        
        # Tirer 2 étoiles sans remise
        etoiles = np.random.choice(range(1, 13), size=2, replace=False, p=etoiles_weights)
        
        return {
            "numeros": sorted(numeros.tolist()),
            "etoiles": sorted(etoiles.tolist()),
            "type": "weighted"
        }
    
    def generate_weighted_grid_loto(self, use_imported_stats: bool = True) -> Dict:
        """Génère une grille Loto pondérée par les fréquences"""
        if use_imported_stats:
            imported_stats = self.get_imported_stats("loto")
            if imported_stats:
                numeros_weights = [imported_stats.get(i, 0.1) for i in range(1, 46)]
                complementaire_weights = [imported_stats.get(i, 0.1) for i in range(1, 46)]
            else:
                freq_data = self.analyzer.calculate_frequencies_loto()
                numeros_weights = [freq_data["numeros"].get(i, 0.1) for i in range(1, 46)]
                complementaire_weights = [freq_data["complementaires"].get(i, 0.1) for i in range(1, 46)]
        else:
            freq_data = self.analyzer.calculate_frequencies_loto()
            numeros_weights = [freq_data["numeros"].get(i, 0.1) for i in range(1, 46)]
            complementaire_weights = [freq_data["complementaires"].get(i, 0.1) for i in range(1, 46)]
        
        # Normaliser les poids
        numeros_weights = np.array(numeros_weights)
        complementaire_weights = np.array(complementaire_weights)
        
        numeros_weights = numeros_weights / numeros_weights.sum()
        complementaire_weights = complementaire_weights / complementaire_weights.sum()
        
        # Tirer 6 numéros sans remise
        numeros = np.random.choice(range(1, 46), size=6, replace=False, p=numeros_weights)
        
        # Tirer 1 complémentaire
        complementaire = np.random.choice(range(1, 46), size=1, p=complementaire_weights)[0]
        
        return {
            "numeros": sorted(numeros.tolist()),
            "complementaire": complementaire,
            "type": "weighted"
        }
    
    def generate_coverage_grids_euromillions(self, num_grids: int = 5) -> List[Dict]:
        """Génère plusieurs grilles complémentaires pour Euromillions (wheeling system)"""
        grids = []
        used_numeros = set()
        used_etoiles = set()
        
        for i in range(num_grids):
            # Éviter les numéros déjà utilisés dans les grilles précédentes
            available_numeros = list(set(range(1, 51)) - used_numeros)
            available_etoiles = list(set(range(1, 13)) - used_etoiles)
            
            if len(available_numeros) < 5:
                available_numeros = list(range(1, 51))  # Reset si plus assez de numéros
            
            if len(available_etoiles) < 2:
                available_etoiles = list(range(1, 13))  # Reset si plus assez d'étoiles
            
            # Tirer les numéros
            numeros = sorted(random.sample(available_numeros, 5))
            etoiles = sorted(random.sample(available_etoiles, 2))
            
            grids.append({
                "numeros": numeros,
                "etoiles": etoiles,
                "type": "coverage"
            })
            
            # Marquer comme utilisés
            used_numeros.update(numeros)
            used_etoiles.update(etoiles)
        
        return grids
    
    def generate_coverage_grids_loto(self, num_grids: int = 5) -> List[Dict]:
        """Génère plusieurs grilles complémentaires pour Loto"""
        grids = []
        used_numeros = set()
        used_complementaires = set()
        
        for i in range(num_grids):
            available_numeros = list(set(range(1, 46)) - used_numeros)
            available_complementaires = list(set(range(1, 46)) - used_complementaires)
            
            if len(available_numeros) < 6:
                available_numeros = list(range(1, 46))
            
            if len(available_complementaires) < 1:
                available_complementaires = list(range(1, 46))
            
            numeros = sorted(random.sample(available_numeros, 6))
            complementaire = random.choice(available_complementaires)
            
            grids.append({
                "numeros": numeros,
                "complementaire": complementaire,
                "type": "coverage"
            })
            
            used_numeros.update(numeros)
            used_complementaires.add(complementaire)
        
        return grids
    
    def generate_random_grid_euromillions(self) -> Dict:
        """Génère une grille Euromillions aléatoire"""
        numeros = sorted(random.sample(range(1, 51), 5))
        etoiles = sorted(random.sample(range(1, 13), 2))
        
        return {
            "numeros": numeros,
            "etoiles": etoiles,
            "type": "random"
        }
    
    def generate_random_grid_loto(self) -> Dict:
        """Génère une grille Loto aléatoire"""
        numeros = sorted(random.sample(range(1, 46), 6))
        complementaire = random.randint(1, 45)
        
        return {
            "numeros": numeros,
            "complementaire": complementaire,
            "type": "random"
        }
    
    def generate_multiple_grids(self, jeu: str, num_grids: int, mode: str, use_imported_stats: bool = True) -> List[Dict]:
        """Génère plusieurs grilles selon le mode demandé"""
        grids = []
        
        if jeu == "euromillions":
            if mode == "weighted":
                for _ in range(num_grids):
                    grids.append(self.generate_weighted_grid_euromillions(use_imported_stats))
            elif mode == "coverage":
                grids = self.generate_coverage_grids_euromillions(num_grids)
            elif mode == "random":
                for _ in range(num_grids):
                    grids.append(self.generate_random_grid_euromillions())
        
        elif jeu == "loto":
            if mode == "weighted":
                for _ in range(num_grids):
                    grids.append(self.generate_weighted_grid_loto(use_imported_stats))
            elif mode == "coverage":
                grids = self.generate_coverage_grids_loto(num_grids)
            elif mode == "random":
                for _ in range(num_grids):
                    grids.append(self.generate_random_grid_loto())
        
        return grids 