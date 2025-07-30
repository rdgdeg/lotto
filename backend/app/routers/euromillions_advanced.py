from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..database import get_db
from ..euromillions_advanced_stats import EuromillionsAdvancedStats
from ..euromillions_generator import EuromillionsAdvancedGenerator

router = APIRouter(prefix="/euromillions/advanced", tags=["Euromillions Advanced"])

@router.get("/comprehensive-stats")
def get_comprehensive_stats(db: Session = Depends(get_db)):
    """Retourne toutes les statistiques avancées d'Euromillions"""
    try:
        stats = EuromillionsAdvancedStats(db)
        return stats.get_comprehensive_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du calcul des statistiques: {str(e)}")

@router.get("/payout-table")
def get_payout_table(db: Session = Depends(get_db)):
    """Retourne le tableau de gains Euromillions"""
    try:
        stats = EuromillionsAdvancedStats(db)
        return {
            "payout_table": stats.get_payout_table(),
            "description": "Tableau de gains Euromillions avec probabilités"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération du tableau de gains: {str(e)}")

@router.get("/frequent-combinations")
def get_frequent_combinations(min_frequency: float = 0.05, db: Session = Depends(get_db)):
    """Retourne les combinaisons de numéros les plus fréquentes"""
    try:
        stats = EuromillionsAdvancedStats(db)
        combinations = stats.find_most_frequent_combinations(min_frequency)
        return {
            "combinations": combinations,
            "min_frequency": min_frequency,
            "total_combinations": len(combinations)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse des combinaisons: {str(e)}")

@router.get("/patterns")
def get_number_patterns(db: Session = Depends(get_db)):
    """Retourne l'analyse des patterns de numéros"""
    try:
        stats = EuromillionsAdvancedStats(db)
        patterns = stats.analyze_number_patterns()
        return {
            "patterns": patterns,
            "description": "Analyse des patterns pairs/impairs, hauts/bas, etc."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse des patterns: {str(e)}")

@router.get("/hot-cold-analysis")
def get_hot_cold_analysis(recent_draws: int = 50, db: Session = Depends(get_db)):
    """Retourne l'analyse des numéros chauds/froids"""
    try:
        stats = EuromillionsAdvancedStats(db)
        analysis = stats.get_hot_cold_analysis(recent_draws)
        return {
            "analysis": analysis,
            "recent_draws_analyzed": recent_draws
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse chaud/froid: {str(e)}")

@router.get("/generate-grid")
def generate_probability_grid(strategy: str = "balanced", db: Session = Depends(get_db)):
    """Génère une grille basée sur les probabilités avancées"""
    try:
        generator = EuromillionsAdvancedGenerator(db)
        grid = generator.generate_probability_based_grid(strategy)
        return {
            "grid": grid,
            "strategy_used": strategy,
            "description": f"Grille générée avec la stratégie: {strategy}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération: {str(e)}")

@router.get("/generate-multiple-grids")
def generate_multiple_grids(num_grids: int = 5, strategy: str = "balanced", db: Session = Depends(get_db)):
    """Génère plusieurs grilles avec différentes stratégies"""
    try:
        generator = EuromillionsAdvancedGenerator(db)
        grids = generator.generate_multiple_grids(num_grids, strategy)
        return {
            "grids": grids,
            "num_grids": num_grids,
            "strategies_used": [grid["strategy"] for grid in grids]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération multiple: {str(e)}")

@router.post("/analyze-grid")
def analyze_grid(grid: Dict[str, Any], db: Session = Depends(get_db)):
    """Analyse une grille spécifique"""
    try:
        numbers = grid.get("numbers", [])
        stars = grid.get("stars", [])
        
        if len(numbers) != 5 or len(stars) != 2:
            raise HTTPException(status_code=400, detail="Grille invalide: 5 numéros et 2 étoiles requis")
        
        generator = EuromillionsAdvancedGenerator(db)
        analysis = generator.get_grid_analysis(numbers, stars)
        
        return {
            "analysis": analysis,
            "grid": grid
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse: {str(e)}")

@router.get("/strategies")
def get_available_strategies():
    """Retourne les stratégies de génération disponibles"""
    return {
        "strategies": [
            {
                "name": "balanced",
                "description": "Équilibre entre fréquence, patterns et analyse chaud/froid",
                "best_for": "Général"
            },
            {
                "name": "frequency",
                "description": "Privilégie les numéros les plus fréquents historiquement",
                "best_for": "Stabilité"
            },
            {
                "name": "hot",
                "description": "Privilégie les numéros qui sortent souvent récemment",
                "best_for": "Tendance actuelle"
            },
            {
                "name": "cold",
                "description": "Privilégie les numéros qui ne sortent plus depuis longtemps",
                "best_for": "Théorie du rattrapage"
            },
            {
                "name": "pattern",
                "description": "Privilégie les patterns les plus probables (pairs/impairs, hauts/bas)",
                "best_for": "Optimisation statistique"
            }
        ]
    }

@router.get("/stats-summary")
def get_stats_summary(db: Session = Depends(get_db)):
    """Retourne un résumé des statistiques principales"""
    try:
        stats = EuromillionsAdvancedStats(db)
        comprehensive_stats = stats.get_comprehensive_stats()
        
        # Extraire les informations principales
        basic_stats = comprehensive_stats["basic_stats"]
        
        summary = {
            "total_draws": comprehensive_stats["total_draws"],
            "date_range": comprehensive_stats["date_range"],
            "top_5_numbers": basic_stats["most_frequent_numbers"][:5],
            "top_3_stars": basic_stats["most_frequent_stars"][:3],
            "least_5_numbers": basic_stats["least_frequent_numbers"][:5],
            "least_3_stars": basic_stats["least_frequent_stars"][:3],
            "hot_numbers_count": len(comprehensive_stats["hot_cold_analysis"]["hot_numbers"]),
            "cold_numbers_count": len(comprehensive_stats["hot_cold_analysis"]["cold_numbers"]),
            "frequent_combinations_count": len(comprehensive_stats["frequent_combinations"]),
            "payout_categories": len(comprehensive_stats["payout_table"])
        }
        
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du calcul du résumé: {str(e)}")

@router.get("/yearly-analysis/{year}")
def get_yearly_analysis(year: int, db: Session = Depends(get_db)):
    """Retourne l'analyse pour une année spécifique"""
    try:
        stats = EuromillionsAdvancedStats(db)
        comprehensive_stats = stats.get_comprehensive_stats()
        
        if year not in comprehensive_stats["yearly_stats"]:
            raise HTTPException(status_code=404, detail=f"Aucune donnée disponible pour l'année {year}")
        
        yearly_data = comprehensive_stats["yearly_stats"][year]
        
        return {
            "year": year,
            "stats": yearly_data,
            "description": f"Statistiques détaillées pour l'année {year}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse annuelle: {str(e)}")

@router.get("/combination-analysis")
def get_combination_analysis(combination_type: str = "pairs", min_frequency: float = 0.1, db: Session = Depends(get_db)):
    """Analyse spécifique des combinaisons par type"""
    try:
        stats = EuromillionsAdvancedStats(db)
        all_combinations = stats.find_most_frequent_combinations(min_frequency)
        
        # Filtrer par type
        filtered_combinations = [
            combo for combo in all_combinations 
            if combo["type"] == combination_type
        ]
        
        return {
            "combination_type": combination_type,
            "combinations": filtered_combinations,
            "count": len(filtered_combinations),
            "min_frequency": min_frequency
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse des combinaisons: {str(e)}") 