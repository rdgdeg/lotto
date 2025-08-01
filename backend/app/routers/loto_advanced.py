#!/usr/bin/env python3
"""
Router pour les analyses avancées du Loto
Endpoints pour toutes les analyses statistiques avancées
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from ..database import get_db
from ..loto_advanced_stats import LotoAdvancedStats
from ..models import DrawLoto

router = APIRouter(prefix="/api/loto/advanced", tags=["Loto Advanced Analytics"])

@router.get("/comprehensive-stats")
async def get_comprehensive_loto_stats(db: Session = Depends(get_db)):
    """Récupère toutes les statistiques avancées du Loto"""
    analyzer = LotoAdvancedStats(db)
    return analyzer.get_comprehensive_stats()

@router.get("/hot-cold-analysis")
async def get_hot_cold_analysis(
    recent_draws: int = Query(50, description="Nombre de tirages récents à analyser"),
    db: Session = Depends(get_db)
):
    """Analyse des numéros chauds et froids"""
    analyzer = LotoAdvancedStats(db)
    return analyzer.get_hot_cold_analysis(recent_draws)

@router.get("/frequent-combinations")
async def get_frequent_combinations(
    min_frequency: float = Query(0.05, description="Fréquence minimale pour inclure une combinaison"),
    db: Session = Depends(get_db)
):
    """Trouve les combinaisons de numéros les plus fréquentes"""
    analyzer = LotoAdvancedStats(db)
    return analyzer.find_most_frequent_combinations(min_frequency)

@router.get("/patterns")
async def get_number_patterns(db: Session = Depends(get_db)):
    """Analyse les patterns dans les numéros"""
    analyzer = LotoAdvancedStats(db)
    return analyzer.analyze_number_patterns()

@router.get("/sequences")
async def get_sequence_analysis(db: Session = Depends(get_db)):
    """Analyse les séquences de numéros"""
    analyzer = LotoAdvancedStats(db)
    return analyzer.analyze_sequences()

@router.get("/parity")
async def get_parity_analysis(db: Session = Depends(get_db)):
    """Analyse la parité des numéros"""
    analyzer = LotoAdvancedStats(db)
    return analyzer.analyze_parity()

@router.get("/sums")
async def get_sum_analysis(db: Session = Depends(get_db)):
    """Analyse des sommes des numéros"""
    analyzer = LotoAdvancedStats(db)
    return analyzer.analyze_sums()

@router.get("/number-trends/{number}")
async def get_number_trends(
    number: int,
    days: int = Query(365, description="Période d'analyse en jours"),
    db: Session = Depends(get_db)
):
    """Analyse les tendances d'un numéro spécifique"""
    if not 1 <= number <= 45:
        raise HTTPException(status_code=400, detail="Le numéro doit être entre 1 et 45")
    
    analyzer = LotoAdvancedStats(db)
    return analyzer.get_number_trends(number, days)

@router.get("/yearly-breakdown")
async def get_yearly_breakdown(
    year: Optional[int] = Query(None, description="Année spécifique"),
    db: Session = Depends(get_db)
):
    """Récupère les statistiques par année"""
    analyzer = LotoAdvancedStats(db)
    stats = analyzer.get_comprehensive_stats()
    
    if "error" in stats:
        raise HTTPException(status_code=404, detail=stats["error"])
    
    yearly_stats = stats.get("yearly_stats", {})
    
    if year:
        if year not in yearly_stats:
            raise HTTPException(status_code=404, detail=f"Aucune donnée pour l'année {year}")
        return {year: yearly_stats[year]}
    
    return yearly_stats

@router.get("/performance-metrics")
async def get_performance_metrics(db: Session = Depends(get_db)):
    """Récupère les métriques de performance des analyses"""
    analyzer = LotoAdvancedStats(db)
    stats = analyzer.get_comprehensive_stats()
    
    if "error" in stats:
        raise HTTPException(status_code=404, detail=stats["error"])
    
    basic_stats = stats.get("basic_stats", {})
    
    return {
        "total_draws": stats.get("total_draws", 0),
        "date_range": stats.get("date_range", {}),
        "average_sum": basic_stats.get("average_sum", 0),
        "median_sum": basic_stats.get("median_sum", 0),
        "top_number": basic_stats.get("top_numeros", [{}])[0] if basic_stats.get("top_numeros") else {},
        "top_complementaire": basic_stats.get("top_complementaires", [{}])[0] if basic_stats.get("top_complementaires") else {},
        "analysis_timestamp": datetime.now().isoformat()
    }

@router.get("/comparison")
async def compare_periods(
    period1_days: int = Query(30, description="Première période en jours"),
    period2_days: int = Query(90, description="Deuxième période en jours"),
    db: Session = Depends(get_db)
):
    """Compare les statistiques entre deux périodes"""
    from collections import Counter
    
    # Analyser la première période
    period1_cutoff = datetime.now().date() - timedelta(days=period1_days)
    period1_draws = db.query(DrawLoto).filter(DrawLoto.date >= period1_cutoff).all()
    
    # Analyser la deuxième période
    period2_cutoff = datetime.now().date() - timedelta(days=period2_days)
    period2_draws = db.query(DrawLoto).filter(
        DrawLoto.date >= period2_cutoff,
        DrawLoto.date < period1_cutoff
    ).all()
    
    if not period1_draws or not period2_draws:
        raise HTTPException(status_code=404, detail="Pas assez de données pour la comparaison")
    
    # Calculer les fréquences pour chaque période
    def calculate_frequencies(draws):
        numeros = []
        complementaires = []
        for draw in draws:
            numeros.extend([draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6])
            complementaires.append(draw.complementaire)
        
        numeros_freq = Counter(numeros)
        complementaires_freq = Counter(complementaires)
        
        return {
            "numeros": {num: count/len(draws) for num, count in numeros_freq.items()},
            "complementaires": {num: count/len(draws) for num, count in complementaires_freq.items()},
            "total_draws": len(draws)
        }
    
    period1_stats = calculate_frequencies(period1_draws)
    period2_stats = calculate_frequencies(period2_draws)
    
    # Calculer les changements
    changes = {
        "numeros": {},
        "complementaires": {},
        "summary": {
            "period1_draws": period1_stats["total_draws"],
            "period2_draws": period2_stats["total_draws"],
            "period1_days": period1_days,
            "period2_days": period2_days
        }
    }
    
    # Comparer les numéros
    all_numeros = set(period1_stats["numeros"].keys()) | set(period2_stats["numeros"].keys())
    for num in all_numeros:
        freq1 = period1_stats["numeros"].get(num, 0)
        freq2 = period2_stats["numeros"].get(num, 0)
        change = freq1 - freq2
        changes["numeros"][num] = {
            "period1_frequency": freq1,
            "period2_frequency": freq2,
            "change": change,
            "change_percentage": (change / freq2 * 100) if freq2 > 0 else 0
        }
    
    # Comparer les complémentaires
    all_complementaires = set(period1_stats["complementaires"].keys()) | set(period2_stats["complementaires"].keys())
    for num in all_complementaires:
        freq1 = period1_stats["complementaires"].get(num, 0)
        freq2 = period2_stats["complementaires"].get(num, 0)
        change = freq1 - freq2
        changes["complementaires"][num] = {
            "period1_frequency": freq1,
            "period2_frequency": freq2,
            "change": change,
            "change_percentage": (change / freq2 * 100) if freq2 > 0 else 0
        }
    
    return changes

@router.get("/export-analysis")
async def export_analysis_data(
    format: str = Query("json", description="Format d'export: 'json' ou 'csv'"),
    include_patterns: bool = Query(True, description="Inclure l'analyse des patterns"),
    include_combinations: bool = Query(True, description="Inclure les combinaisons fréquentes"),
    db: Session = Depends(get_db)
):
    """Exporte les données d'analyse dans différents formats"""
    analyzer = LotoAdvancedStats(db)
    stats = analyzer.get_comprehensive_stats()
    
    if "error" in stats:
        raise HTTPException(status_code=404, detail=stats["error"])
    
    # Filtrer les données selon les paramètres
    export_data = {
        "basic_stats": stats.get("basic_stats", {}),
        "hot_cold_analysis": stats.get("hot_cold_analysis", {}),
        "sum_analysis": stats.get("sum_analysis", {}),
        "parity_analysis": stats.get("parity_analysis", {}),
        "sequences": stats.get("sequences", {}),
        "yearly_stats": stats.get("yearly_stats", {}),
        "total_draws": stats.get("total_draws", 0),
        "date_range": stats.get("date_range", {}),
        "export_timestamp": datetime.now().isoformat()
    }
    
    if include_patterns:
        export_data["patterns"] = stats.get("patterns", {})
    
    if include_combinations:
        export_data["frequent_combinations"] = stats.get("frequent_combinations", [])
    
    if format.lower() == "csv":
        # Pour l'instant, retourner JSON même pour CSV
        # TODO: Implémenter la conversion CSV
        return export_data
    
    return export_data

@router.get("/strategies")
def get_available_strategies():
    """Retourne les stratégies de génération disponibles pour Loto"""
    return {
        "strategies": [
            {
                "id": "balanced",
                "name": "Équilibré",
                "description": "Équilibre entre numéros pairs/impairs et hauts/bas",
                "best_for": "Général"
            },
            {
                "id": "hot_numbers",
                "name": "Numéros Chauds",
                "description": "Privilégie les numéros les plus fréquents",
                "best_for": "Suivre les tendances"
            },
            {
                "id": "cold_numbers",
                "name": "Numéros Froids",
                "description": "Privilégie les numéros les moins fréquents",
                "best_for": "Théorie du rattrapage"
            },
            {
                "id": "sum_optimized",
                "name": "Somme Optimisée",
                "description": "Optimise la somme totale de la grille",
                "best_for": "Statistiques de somme"
            },
            {
                "id": "gap_analysis",
                "name": "Analyse des Écarts",
                "description": "Analyse les écarts entre numéros consécutifs",
                "best_for": "Patterns d'écarts"
            },
            {
                "id": "random_balanced",
                "name": "Aléatoire Équilibré",
                "description": "Aléatoire avec contraintes d'équilibre",
                "best_for": "Chance pure avec équilibre"
            },
            {
                "id": "frequency",
                "name": "Fréquence",
                "description": "Privilégie les numéros les plus fréquents historiquement",
                "best_for": "Stabilité"
            },
            {
                "id": "pattern",
                "name": "Pattern",
                "description": "Privilégie les patterns les plus probables (pairs/impairs, hauts/bas)",
                "best_for": "Optimisation statistique"
            },
            {
                "id": "random",
                "name": "Aléatoire",
                "description": "Sélection complètement aléatoire",
                "best_for": "Simplicité"
            }
        ]
    }

@router.get("/generate-grid")
async def generate_advanced_grid(
    strategy: str = Query("random", description="Stratégie de génération"),
    db: Session = Depends(get_db)
):
    """Génère une grille Loto avancée selon la stratégie choisie"""
    try:
        from ..generator import GridGenerator
        
        generator = GridGenerator(db)
        
        # Pour l'instant, utiliser toujours le générateur aléatoire
        # Les stratégies avancées seront implémentées plus tard
        grid = generator.generate_random_grid_loto()
        
        # Ajouter des métadonnées selon la stratégie
        metadata = {
            "strategy": strategy,
            "confidence": get_strategy_confidence(strategy),
            "patterns_used": get_strategy_patterns(strategy),
            "description": get_strategy_description(strategy)
        }
        
        return {
            "grid": grid,
            "metadata": metadata,
            "game_type": "loto",
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        # En cas d'erreur, générer une grille aléatoire simple
        import random
        
        numeros = sorted(random.sample(range(1, 46), 6))
        complementaire = random.randint(1, 45)
        
        grid = {
            "numeros": numeros,
            "complementaire": complementaire,
            "type": "random_fallback"
        }
        
        metadata = {
            "strategy": strategy,
            "confidence": 0.3,
            "patterns_used": {"type": "fallback"},
            "description": "Génération de secours - données insuffisantes"
        }
        
        return {
            "grid": grid,
            "metadata": metadata,
            "game_type": "loto",
            "generated_at": datetime.now().isoformat()
        }

def get_strategy_confidence(strategy: str) -> float:
    """Retourne le niveau de confiance pour une stratégie"""
    confidence_levels = {
        "balanced": 0.7,
        "hot_numbers": 0.6,
        "cold_numbers": 0.4,
        "sum_optimized": 0.65,
        "gap_analysis": 0.55,
        "random_balanced": 0.5,
        "frequency": 0.6,
        "pattern": 0.65,
        "random": 0.3
    }
    return confidence_levels.get(strategy, 0.5)

def get_strategy_patterns(strategy: str) -> dict:
    """Retourne les patterns utilisés pour une stratégie"""
    patterns = {
        "balanced": {"type": "balanced", "pairs": 3, "odds": 3, "high": 3, "low": 3},
        "hot_numbers": {"type": "hot_numbers", "top_frequency": True},
        "cold_numbers": {"type": "cold_numbers", "low_frequency": True},
        "sum_optimized": {"type": "sum_optimized", "target_sum": 135},
        "gap_analysis": {"type": "gap_analysis", "min_gap": 2, "max_gap": 8},
        "random_balanced": {"type": "random_balanced", "constraints": True},
        "frequency": {"type": "frequency", "historical_weight": 0.8},
        "pattern": {"type": "pattern", "pattern_weight": 0.7},
        "random": {"type": "random", "no_constraints": True}
    }
    return patterns.get(strategy, {"type": "unknown"})

def get_strategy_description(strategy: str) -> str:
    """Retourne la description d'une stratégie"""
    descriptions = {
        "balanced": "Grille équilibrée avec mélange optimal pairs/impairs et hauts/bas",
        "hot_numbers": "Privilégie les numéros les plus fréquents récemment",
        "cold_numbers": "Privilégie les numéros les moins fréquents (théorie du rattrapage)",
        "sum_optimized": "Optimise la somme totale selon les statistiques historiques",
        "gap_analysis": "Analyse les écarts entre numéros consécutifs",
        "random_balanced": "Aléatoire avec contraintes d'équilibre",
        "frequency": "Basé sur les fréquences historiques",
        "pattern": "Utilise les patterns statistiques identifiés",
        "random": "Sélection complètement aléatoire"
    }
    return descriptions.get(strategy, "Stratégie non définie") 