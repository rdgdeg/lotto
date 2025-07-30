from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from ..database import get_db
from ..advanced_statistics import AdvancedStatisticsAnalyzer

router = APIRouter(prefix="/advanced-stats", tags=["Advanced Statistics"])

@router.get("/comprehensive-analysis")
def get_comprehensive_analysis(
    year: Optional[int] = Query(None, description="Année spécifique pour l'analyse"),
    db: Session = Depends(get_db)
):
    """Récupère l'analyse complète des statistiques avancées"""
    try:
        analyzer = AdvancedStatisticsAnalyzer(db)
        analysis = analyzer.get_comprehensive_number_analysis(year)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse: {str(e)}")

@router.get("/number-statistics")
def get_number_statistics(
    year: Optional[int] = Query(None, description="Année spécifique"),
    db: Session = Depends(get_db)
):
    """Récupère les statistiques détaillées des numéros"""
    try:
        analyzer = AdvancedStatisticsAnalyzer(db)
        analysis = analyzer.get_comprehensive_number_analysis(year)
        return {
            "number_statistics": analysis["number_statistics"],
            "total_draws": analysis["total_draws"],
            "date_range": analysis["date_range"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des statistiques: {str(e)}")

@router.get("/position-analysis")
def get_position_analysis(
    year: Optional[int] = Query(None, description="Année spécifique"),
    db: Session = Depends(get_db)
):
    """Récupère l'analyse des positions préférées"""
    try:
        analyzer = AdvancedStatisticsAnalyzer(db)
        analysis = analyzer.get_comprehensive_number_analysis(year)
        return {
            "position_statistics": analysis["position_statistics"],
            "total_draws": analysis["total_draws"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse des positions: {str(e)}")

@router.get("/gap-analysis")
def get_gap_analysis(
    year: Optional[int] = Query(None, description="Année spécifique"),
    db: Session = Depends(get_db)
):
    """Récupère l'analyse des intervalles entre apparitions"""
    try:
        analyzer = AdvancedStatisticsAnalyzer(db)
        analysis = analyzer.get_comprehensive_number_analysis(year)
        return {
            "gap_statistics": analysis["gap_statistics"],
            "total_draws": analysis["total_draws"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse des intervalles: {str(e)}")

@router.get("/sequence-analysis")
def get_sequence_analysis(
    year: Optional[int] = Query(None, description="Année spécifique"),
    db: Session = Depends(get_db)
):
    """Récupère l'analyse des séquences de numéros"""
    try:
        analyzer = AdvancedStatisticsAnalyzer(db)
        analysis = analyzer.get_comprehensive_number_analysis(year)
        return {
            "sequence_statistics": analysis["sequence_statistics"],
            "total_draws": analysis["total_draws"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse des séquences: {str(e)}")

@router.get("/pattern-analysis")
def get_pattern_analysis(
    year: Optional[int] = Query(None, description="Année spécifique"),
    db: Session = Depends(get_db)
):
    """Récupère l'analyse des patterns de numéros"""
    try:
        analyzer = AdvancedStatisticsAnalyzer(db)
        analysis = analyzer.get_comprehensive_number_analysis(year)
        return {
            "pattern_statistics": analysis["pattern_statistics"],
            "total_draws": analysis["total_draws"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse des patterns: {str(e)}")

@router.get("/temporal-analysis")
def get_temporal_analysis(
    year: Optional[int] = Query(None, description="Année spécifique"),
    db: Session = Depends(get_db)
):
    """Récupère l'analyse temporelle des numéros"""
    try:
        analyzer = AdvancedStatisticsAnalyzer(db)
        analysis = analyzer.get_comprehensive_number_analysis(year)
        return {
            "temporal_statistics": analysis["temporal_statistics"],
            "total_draws": analysis["total_draws"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse temporelle: {str(e)}")

@router.get("/combination-analysis")
def get_combination_analysis(
    year: Optional[int] = Query(None, description="Année spécifique"),
    db: Session = Depends(get_db)
):
    """Récupère l'analyse des combinaisons fréquentes"""
    try:
        analyzer = AdvancedStatisticsAnalyzer(db)
        analysis = analyzer.get_comprehensive_number_analysis(year)
        return {
            "combination_statistics": analysis["combination_statistics"],
            "total_draws": analysis["total_draws"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse des combinaisons: {str(e)}")

@router.get("/correlation-analysis")
def get_correlation_analysis(
    year: Optional[int] = Query(None, description="Année spécifique"),
    db: Session = Depends(get_db)
):
    """Récupère l'analyse des corrélations entre numéros"""
    try:
        analyzer = AdvancedStatisticsAnalyzer(db)
        analysis = analyzer.get_comprehensive_number_analysis(year)
        return {
            "correlation_statistics": analysis["correlation_statistics"],
            "total_draws": analysis["total_draws"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse des corrélations: {str(e)}")

@router.get("/prediction-insights")
def get_prediction_insights(
    year: Optional[int] = Query(None, description="Année spécifique"),
    db: Session = Depends(get_db)
):
    """Récupère les insights pour les prédictions"""
    try:
        analyzer = AdvancedStatisticsAnalyzer(db)
        insights = analyzer.get_prediction_insights(year)
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération des insights: {str(e)}")

@router.get("/summary-dashboard")
def get_summary_dashboard(
    year: Optional[int] = Query(None, description="Année spécifique"),
    db: Session = Depends(get_db)
):
    """Récupère un tableau de bord résumé avec les statistiques clés"""
    try:
        analyzer = AdvancedStatisticsAnalyzer(db)
        analysis = analyzer.get_comprehensive_number_analysis(year)
        insights = analyzer.get_prediction_insights(year)
        
        return {
            "summary": {
                "total_draws": analysis["total_draws"],
                "date_range": analysis["date_range"],
                "top_numbers": analysis["number_statistics"]["top_numbers"][:5],
                "bottom_numbers": analysis["number_statistics"]["bottom_numbers"][:5],
                "top_stars": analysis["number_statistics"]["top_stars"][:3],
                "bottom_stars": analysis["number_statistics"]["bottom_stars"][:3]
            },
            "predictions": {
                "overdue_numbers": insights["overdue_numbers"][:5],
                "overdue_stars": insights["overdue_stars"][:3],
                "hot_numbers": insights["hot_numbers"][:5],
                "cold_numbers": insights["cold_numbers"][:5]
            },
            "patterns": {
                "most_frequent_patterns": list(analysis["pattern_statistics"]["high_low_patterns"].items())[:3],
                "most_frequent_sequences": list(analysis["sequence_statistics"]["consecutive_sequences"].items())[:3]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération du tableau de bord: {str(e)}") 