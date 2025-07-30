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