from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import SessionLocal
from ..crud import (
    get_draws_by_year_euromillions, get_draws_by_year_loto,
    get_years_available_euromillions, get_years_available_loto,
    delete_all_draws_euromillions, delete_all_draws_loto, delete_all_stats,
    get_draws_count_euromillions, get_draws_count_loto
)

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/euromillions")
def get_euromillions_history(
    year: Optional[int] = Query(None, description="Année spécifique (optionnel)"),
    limit: int = Query(100, ge=1, le=1000, description="Nombre maximum de tirages à retourner"),
    db: Session = Depends(get_db)
):
    """Récupère l'historique des tirages Euromillions"""
    try:
        draws = get_draws_by_year_euromillions(db, year)
        
        # Obtenir le vrai total avant de limiter
        total_draws = len(draws)
        
        # Limiter le nombre de résultats
        draws = draws[:limit]
        
        # Grouper par année
        draws_by_year = {}
        for draw in draws:
            year_key = draw['year']
            if year_key not in draws_by_year:
                draws_by_year[year_key] = []
            draws_by_year[year_key].append(draw)
        
        return {
            "jeu": "euromillions",
            "total_draws": total_draws,  # Vrai total, pas limité
            "draws_returned": len(draws),  # Nombre de tirages retournés
            "years_available": get_years_available_euromillions(db),
            "selected_year": year,
            "draws_by_year": draws_by_year,
            "draws": draws
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération de l'historique: {str(e)}")

@router.get("/loto")
def get_loto_history(
    year: Optional[int] = Query(None, description="Année spécifique (optionnel)"),
    limit: int = Query(100, ge=1, le=1000, description="Nombre maximum de tirages à retourner"),
    db: Session = Depends(get_db)
):
    """Récupère l'historique des tirages Loto"""
    try:
        draws = get_draws_by_year_loto(db, year)
        
        # Obtenir le vrai total avant de limiter
        total_draws = len(draws)
        
        # Limiter le nombre de résultats
        draws = draws[:limit]
        
        # Grouper par année
        draws_by_year = {}
        for draw in draws:
            year_key = draw['year']
            if year_key not in draws_by_year:
                draws_by_year[year_key] = []
            draws_by_year[year_key].append(draw)
        
        return {
            "jeu": "loto",
            "total_draws": total_draws,  # Vrai total, pas limité
            "draws_returned": len(draws),  # Nombre de tirages retournés
            "years_available": get_years_available_loto(db),
            "selected_year": year,
            "draws_by_year": draws_by_year,
            "draws": draws
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération de l'historique: {str(e)}")

@router.get("/summary")
def get_database_summary(db: Session = Depends(get_db)):
    """Récupère un résumé de la base de données"""
    try:
        euromillions_count = get_draws_count_euromillions(db)
        loto_count = get_draws_count_loto(db)
        euromillions_years = get_years_available_euromillions(db)
        loto_years = get_years_available_loto(db)
        
        return {
            "euromillions": {
                "total_draws": euromillions_count,
                "years_available": euromillions_years,
                "date_range": {
                    "start": min(euromillions_years) if euromillions_years else None,
                    "end": max(euromillions_years) if euromillions_years else None
                }
            },
            "loto": {
                "total_draws": loto_count,
                "years_available": loto_years,
                "date_range": {
                    "start": min(loto_years) if loto_years else None,
                    "end": max(loto_years) if loto_years else None
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération du résumé: {str(e)}")

@router.delete("/euromillions")
def delete_euromillions_data(db: Session = Depends(get_db)):
    """Supprime tous les tirages Euromillions"""
    try:
        success = delete_all_draws_euromillions(db)
        if success:
            return {"message": "Tous les tirages Euromillions ont été supprimés avec succès"}
        else:
            raise HTTPException(status_code=500, detail="Erreur lors de la suppression des tirages Euromillions")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la suppression: {str(e)}")

@router.delete("/loto")
def delete_loto_data(db: Session = Depends(get_db)):
    """Supprime tous les tirages Loto"""
    try:
        success = delete_all_draws_loto(db)
        if success:
            return {"message": "Tous les tirages Loto ont été supprimés avec succès"}
        else:
            raise HTTPException(status_code=500, detail="Erreur lors de la suppression des tirages Loto")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la suppression: {str(e)}")

@router.delete("/stats")
def delete_stats_data(db: Session = Depends(get_db)):
    """Supprime toutes les statistiques"""
    try:
        success = delete_all_stats(db)
        if success:
            return {"message": "Toutes les statistiques ont été supprimées avec succès"}
        else:
            raise HTTPException(status_code=500, detail="Erreur lors de la suppression des statistiques")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la suppression: {str(e)}")

@router.delete("/all")
def delete_all_data(db: Session = Depends(get_db)):
    """Supprime toutes les données (tirages et statistiques)"""
    try:
        euromillions_success = delete_all_draws_euromillions(db)
        loto_success = delete_all_draws_loto(db)
        stats_success = delete_all_stats(db)
        
        if euromillions_success and loto_success and stats_success:
            return {"message": "Toutes les données ont été supprimées avec succès"}
        else:
            raise HTTPException(status_code=500, detail="Erreur lors de la suppression de certaines données")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la suppression: {str(e)}") 