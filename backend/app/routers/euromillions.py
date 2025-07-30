from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form, Depends, Body
from typing import List, Optional, Dict
from pydantic import BaseModel
from sqlalchemy import extract
from datetime import datetime, date
from sqlalchemy import func, extract, or_, and_, desc, asc
from sqlalchemy.orm import Session
from ..database import get_db
from ..utils import parse_euromillions_csv
from ..stats import StatistiquesAnalyzer
import pandas as pd
import io
import tempfile
import os

router = APIRouter()

class DrawEuromillionsCreate(BaseModel):
    date: str
    numeros: List[int]
    etoiles: List[int]

@router.get("/")
async def get_euromillions_draws(db: Session = Depends(get_db)):
    """Récupérer tous les tirages Euromillions"""
    from ..models import DrawEuromillions
    
    draws = db.query(DrawEuromillions).order_by(DrawEuromillions.date.desc()).all()
    return {"draws": draws}

@router.post("/import")
async def import_euromillions_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Importer des tirages Euromillions depuis un fichier CSV"""
    try:
        content = await file.read()
        draws_data = parse_euromillions_csv(content)
        
        from ..models import DrawEuromillions
        
        added_count = 0
        for draw_data in draws_data:
            # Vérifier si le tirage existe déjà
            existing_draw = db.query(DrawEuromillions).filter(
                DrawEuromillions.date == draw_data['date']
            ).first()
            
            if not existing_draw:
                new_draw = DrawEuromillions(**draw_data)
                db.add(new_draw)
                added_count += 1
        
        db.commit()
        
        return {
            "message": f"Import réussi. {added_count} tirages ajoutés.",
            "added_count": added_count
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/validate-upload")
async def validate_euromillions_upload(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Valider un fichier CSV avant import"""
    try:
        # Créer un fichier temporaire
        with tempfile.NamedTemporaryFile(delete=False, suffix='.csv') as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            # Importer et utiliser le validateur
            import sys
            import os
            sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            from upload_validator import UploadValidator
            
            validator = UploadValidator()
            validation_result = validator.validate_csv_file(temp_file_path, 'euromillions')
            
            return {
                "valid": validation_result['valid'],
                "total_rows": validation_result['total_rows'],
                "valid_rows": validation_result['valid_rows'],
                "invalid_rows": validation_result['invalid_rows'],
                "duplicates": validation_result['duplicates'],
                "date_range": validation_result['date_range'],
                "summary": validation_result['summary'],
                "errors": validation_result['errors'],
                "warnings": validation_result['warnings']
            }
            
        finally:
            # Nettoyer le fichier temporaire
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur lors de la validation: {str(e)}")

@router.get("/stats")
async def get_euromillions_stats(db: Session = Depends(get_db)):
    """Récupérer les statistiques Euromillions"""
    analyzer = StatistiquesAnalyzer(db)
    stats = analyzer.calculate_frequencies_euromillions()
    return stats

@router.get("/number/{number}")
async def get_number_history(
    number: int,
    type: str = Query(..., description="Type: 'numero' ou 'etoile'"),
    limit: int = Query(10, description="Nombre de tirages par page"),
    offset: int = Query(0, description="Offset pour la pagination"),
    sort_by: str = Query('date', description="Tri par: 'date' ou 'id'"),
    sort_order: str = Query('desc', description="Ordre: 'asc' ou 'desc'"),
    year: Optional[int] = Query(None, description="Filtrer par année"),
    db: Session = Depends(get_db)
):
    """Récupérer l'historique complet d'un numéro ou d'une étoile spécifique"""
    from ..models import DrawEuromillions
    
    if type not in ['numero', 'etoile']:
        raise HTTPException(status_code=400, detail="Type doit être 'numero' ou 'etoile'")
    
    if sort_by not in ['date', 'id']:
        raise HTTPException(status_code=400, detail="sort_by doit être 'date' ou 'id'")
    
    if sort_order not in ['asc', 'desc']:
        raise HTTPException(status_code=400, detail="sort_order doit être 'asc' ou 'desc'")
    
    # Construire la requête avec filtres
    query = db.query(DrawEuromillions)
    
    # Filtrer par année si spécifié
    if year is not None:
        query = query.filter(extract('year', DrawEuromillions.date) == year)
    
    # Appliquer le tri
    if sort_by == 'date':
        if sort_order == 'desc':
            query = query.order_by(DrawEuromillions.date.desc())
        else:
            query = query.order_by(DrawEuromillions.date.asc())
    else:  # sort_by == 'id'
        if sort_order == 'desc':
            query = query.order_by(DrawEuromillions.id.desc())
        else:
            query = query.order_by(DrawEuromillions.id.asc())
    
    all_draws = query.all()
    
    if not all_draws:
        raise HTTPException(status_code=404, detail="Aucun tirage trouvé")
    
    # Analyser l'historique du numéro
    appearances = []
    total_draws = len(all_draws)
    
    for draw in all_draws:
        numeros = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5]
        etoiles = [draw.e1, draw.e2]
        
        if type == 'numero' and number in numeros:
            appearances.append({
                'id': draw.id,
                'date': draw.date.strftime('%Y-%m-%d'),
                'numeros': numeros,
                'etoiles': etoiles
            })
        elif type == 'etoile' and number in etoiles:
            appearances.append({
                'id': draw.id,
                'date': draw.date.strftime('%Y-%m-%d'),
                'numeros': numeros,
                'etoiles': etoiles
            })
    
    if not appearances:
        return {
            "draws": [],
            "total": 0,
            "numero": number,
            "type": type
        }
    
    # Appliquer la pagination
    total_appearances = len(appearances)
    paginated_appearances = appearances[offset:offset + limit]
    
    return {
        "draws": paginated_appearances,
        "total": total_appearances,
        "numero": number,
        "type": type
    }

@router.get("/detailed-stats")
async def get_detailed_stats_euromillions(db: Session = Depends(get_db)):
    """Récupérer les statistiques détaillées Euromillions"""
    from ..models import DrawEuromillions
    from app.stats import get_detailed_stats_euromillions
    
    return get_detailed_stats_euromillions()

@router.get("/search")
async def search_euromillions_draws(
    year: Optional[int] = None,
    month: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    numero: Optional[int] = None,
    etoile: Optional[int] = None,
    sort_by: str = "date",
    sort_order: str = "desc",
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Recherche avancée dans les tirages Euromillions"""
    from ..models import DrawEuromillions
    
    query = db.query(DrawEuromillions)
    
    # Filtres
    if year:
        query = query.filter(extract('year', DrawEuromillions.date) == year)
    
    if month:
        query = query.filter(extract('month', DrawEuromillions.date) == month)
    
    if start_date:
        query = query.filter(DrawEuromillions.date >= start_date)
    
    if end_date:
        query = query.filter(DrawEuromillions.date <= end_date)
    
    if numero:
        query = query.filter(DrawEuromillions.numeros.contains([numero]))
    
    if etoile:
        query = query.filter(DrawEuromillions.etoiles.contains([etoile]))
    
    # Tri
    if sort_by == "date":
        order_column = DrawEuromillions.date
    else:
        order_column = DrawEuromillions.id
    
    if sort_order == "desc":
        query = query.order_by(desc(order_column))
    else:
        query = query.order_by(asc(order_column))
    
    # Pagination
    total_count = query.count()
    draws = query.offset(offset).limit(limit).all()
    
    return {
        "draws": draws,
        "total_count": total_count,
        "has_more": offset + limit < total_count
    }

@router.get("/search/advanced")
async def advanced_search_euromillions(
    numeros: Optional[str] = None,
    etoiles: Optional[str] = None,
    min_numeros: Optional[int] = None,
    min_etoiles: Optional[int] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Recherche avancée avec critères multiples"""
    from ..models import DrawEuromillions
    
    query = db.query(DrawEuromillions)
    
    # Traitement des numéros multiples
    if numeros:
        numero_list = [int(n.strip()) for n in numeros.split(',') if n.strip().isdigit()]
        if numero_list:
            # Recherche des tirages contenant au moins min_numeros des numéros spécifiés
            if min_numeros:
                # Cette logique nécessiterait une implémentation plus complexe
                # Pour l'instant, on cherche les tirages contenant au moins un des numéros
                conditions = [DrawEuromillions.numeros.contains([n]) for n in numero_list]
                query = query.filter(or_(*conditions))
            else:
                conditions = [DrawEuromillions.numeros.contains([n]) for n in numero_list]
                query = query.filter(or_(*conditions))
    
    # Traitement des étoiles multiples
    if etoiles:
        etoile_list = [int(e.strip()) for e in etoiles.split(',') if e.strip().isdigit()]
        if etoile_list:
            if min_etoiles:
                # Logique similaire pour les étoiles
                conditions = [DrawEuromillions.etoiles.contains([e]) for e in etoile_list]
                query = query.filter(or_(*conditions))
            else:
                conditions = [DrawEuromillions.etoiles.contains([e]) for e in etoile_list]
                query = query.filter(or_(*conditions))
    
    total_count = query.count()
    draws = query.offset(offset).limit(limit).all()
    
    return {
        "draws": draws,
        "total_count": total_count,
        "has_more": offset + limit < total_count
    }

@router.get("/search/stats")
async def get_search_stats_euromillions(db: Session = Depends(get_db)):
    """Récupérer les statistiques pour la recherche"""
    from ..models import DrawEuromillions
    
    # Années disponibles
    years = db.query(extract('year', DrawEuromillions.date).distinct()).all()
    years_available = sorted([int(year[0]) for year in years if year[0] is not None])
    
    # Mois disponibles
    months = db.query(extract('month', DrawEuromillions.date).distinct()).all()
    months_available = sorted([int(month[0]) for month in months if month[0] is not None])
    
    # Plage de dates
    date_range = db.query(
        func.min(DrawEuromillions.date),
        func.max(DrawEuromillions.date)
    ).first()
    
    # Statistiques par année
    yearly_stats = []
    for year in years_available:
        count = db.query(DrawEuromillions).filter(
            extract('year', DrawEuromillions.date) == year
        ).count()
        yearly_stats.append({"year": year, "count": count})
    
    return {
        "total_draws": db.query(DrawEuromillions).count(),
        "years_available": years_available,
        "months_available": months_available,
        "date_range": {
            "start": date_range[0].isoformat() if date_range[0] else None,
            "end": date_range[1].isoformat() if date_range[1] else None
        },
        "yearly_stats": yearly_stats
    }

class DrawEuromillionsUpdate(BaseModel):
    date: str
    numeros: List[int]
    etoiles: List[int]

@router.post("/add-draw")
async def add_single_draw(draw: DrawEuromillionsCreate, db: Session = Depends(get_db)):
    """Ajouter un tirage Euromillions manuellement"""
    from ..models import DrawEuromillions
    
    try:
        # Validation des données
        if len(draw.numeros) != 5:
            raise HTTPException(status_code=400, detail="Il faut exactement 5 numéros")
        
        if len(draw.etoiles) != 2:
            raise HTTPException(status_code=400, detail="Il faut exactement 2 étoiles")
        
        # Validation des plages
        for numero in draw.numeros:
            if not 1 <= numero <= 50:
                raise HTTPException(status_code=400, detail=f"Numéro {numero} hors de la plage 1-50")
        
        for etoile in draw.etoiles:
            if not 1 <= etoile <= 12:
                raise HTTPException(status_code=400, detail=f"Étoile {etoile} hors de la plage 1-12")
        
        # Vérification des doublons
        if len(set(draw.numeros)) != 5:
            raise HTTPException(status_code=400, detail="Numéros en double détectés")
        
        if len(set(draw.etoiles)) != 2:
            raise HTTPException(status_code=400, detail="Étoiles en double détectées")
        
        # Vérification de la date
        try:
            draw_date = datetime.strptime(draw.date, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Format de date invalide (YYYY-MM-DD)")
        
        # Vérification des doublons de date
        existing_draw = db.query(DrawEuromillions).filter(
            DrawEuromillions.date == draw_date
        ).first()
        
        if existing_draw:
            raise HTTPException(status_code=400, detail="Un tirage existe déjà pour cette date")
        
        # Création du nouveau tirage
        sorted_numeros = sorted(draw.numeros)
        sorted_etoiles = sorted(draw.etoiles)
        new_draw = DrawEuromillions(
            date=draw_date,
            n1=sorted_numeros[0],
            n2=sorted_numeros[1],
            n3=sorted_numeros[2],
            n4=sorted_numeros[3],
            n5=sorted_numeros[4],
            e1=sorted_etoiles[0],
            e2=sorted_etoiles[1]
        )
        
        db.add(new_draw)
        db.commit()
        db.refresh(new_draw)
        
        return {
            "message": "Tirage ajouté avec succès",
            "draw": new_draw
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'ajout: {str(e)}")

@router.put("/update-draw/{draw_id}")
async def update_draw(draw_id: int, draw: DrawEuromillionsUpdate, db: Session = Depends(get_db)):
    """Modifier un tirage Euromillions existant"""
    from ..models import DrawEuromillions
    
    try:
        # Récupérer le tirage existant
        existing_draw = db.query(DrawEuromillions).filter(DrawEuromillions.id == draw_id).first()
        if not existing_draw:
            raise HTTPException(status_code=404, detail="Tirage non trouvé")
        
        # Validation des données
        if len(draw.numeros) != 5:
            raise HTTPException(status_code=400, detail="Il faut exactement 5 numéros")
        
        if len(draw.etoiles) != 2:
            raise HTTPException(status_code=400, detail="Il faut exactement 2 étoiles")
        
        # Validation des plages
        for numero in draw.numeros:
            if not 1 <= numero <= 50:
                raise HTTPException(status_code=400, detail=f"Numéro {numero} hors de la plage 1-50")
        
        for etoile in draw.etoiles:
            if not 1 <= etoile <= 12:
                raise HTTPException(status_code=400, detail=f"Étoile {etoile} hors de la plage 1-12")
        
        # Vérification des doublons
        if len(set(draw.numeros)) != 5:
            raise HTTPException(status_code=400, detail="Numéros en double détectés")
        
        if len(set(draw.etoiles)) != 2:
            raise HTTPException(status_code=400, detail="Étoiles en double détectées")
        
        # Vérification de la date
        try:
            new_date = datetime.strptime(draw.date, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Format de date invalide (YYYY-MM-DD)")
        
        # Vérification des doublons de date (sauf pour le tirage actuel)
        existing_draw_same_date = db.query(DrawEuromillions).filter(
            DrawEuromillions.date == new_date,
            DrawEuromillions.id != draw_id
        ).first()
        
        if existing_draw_same_date:
            raise HTTPException(status_code=400, detail="Un autre tirage existe déjà pour cette date")
        
        # Mise à jour du tirage
        sorted_numeros = sorted(draw.numeros)
        sorted_etoiles = sorted(draw.etoiles)
        
        existing_draw.date = new_date
        existing_draw.n1 = sorted_numeros[0]
        existing_draw.n2 = sorted_numeros[1]
        existing_draw.n3 = sorted_numeros[2]
        existing_draw.n4 = sorted_numeros[3]
        existing_draw.n5 = sorted_numeros[4]
        existing_draw.e1 = sorted_etoiles[0]
        existing_draw.e2 = sorted_etoiles[1]
        
        db.commit()
        db.refresh(existing_draw)
        
        return {
            "message": "Tirage modifié avec succès",
            "draw": existing_draw
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur lors de la modification: {str(e)}")

@router.delete("/delete-draw/{draw_id}")
async def delete_draw(draw_id: int, db: Session = Depends(get_db)):
    """Supprimer un tirage Euromillions"""
    from ..models import DrawEuromillions
    
    try:
        draw = db.query(DrawEuromillions).filter(DrawEuromillions.id == draw_id).first()
        if not draw:
            raise HTTPException(status_code=404, detail="Tirage non trouvé")
        
        db.delete(draw)
        db.commit()
        
        return {
            "message": "Tirage supprimé avec succès",
            "deleted_draw_id": draw_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur lors de la suppression: {str(e)}")

@router.post("/import-excel")
async def import_euromillions_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Importer des tirages Euromillions depuis un fichier Excel"""
    from ..models import DrawEuromillions
    
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Format de fichier non supporté. Utilisez .xlsx ou .xls")
    
    try:
        content = await file.read()
        
        # Lire le fichier Excel
        if file.filename.endswith('.xlsx'):
            df = pd.read_excel(io.BytesIO(content), engine='openpyxl')
        else:
            df = pd.read_excel(io.BytesIO(content), engine='xlrd')
        
        # Vérifier les colonnes requises
        required_columns = ['Date du tirage', 'N°1', 'N°2', 'N°3', 'N°4', 'N°5', 'Étoile 1', 'Étoile 2']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            raise HTTPException(
                status_code=400, 
                detail=f"Colonnes manquantes: {', '.join(missing_columns)}"
            )
        
        added_count = 0
        skipped_count = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                # Traitement de la date
                date_value = row['Date du tirage']
                if pd.isna(date_value):
                    errors.append(f"Ligne {index + 2}: Date manquante")
                    continue
                
                # Conversion de la date
                if isinstance(date_value, str):
                    # Essayer différents formats
                    for fmt in ['%Y-%m-%d', '%d/%m/%Y', '%d-%m-%Y']:
                        try:
                            draw_date = datetime.strptime(date_value, fmt).date()
                            break
                        except ValueError:
                            continue
                    else:
                        errors.append(f"Ligne {index + 2}: Format de date invalide: {date_value}")
                        continue
                else:
                    draw_date = date_value.date()
                
                # Vérification des doublons de date
                existing_draw = db.query(DrawEuromillions).filter(
                    DrawEuromillions.date == draw_date
                ).first()
                
                if existing_draw:
                    skipped_count += 1
                    continue
                
                # Extraction des numéros et étoiles
                numeros = []
                for i in range(1, 6):
                    numero = row[f'N°{i}']
                    if pd.isna(numero) or not isinstance(numero, (int, float)):
                        errors.append(f"Ligne {index + 2}: Numéro {i} invalide")
                        break
                    numeros.append(int(numero))
                else:
                    # Vérification des plages
                    if not all(1 <= n <= 50 for n in numeros):
                        errors.append(f"Ligne {index + 2}: Numéros hors de la plage 1-50")
                        continue
                    
                    if len(set(numeros)) != 5:
                        errors.append(f"Ligne {index + 2}: Numéros en double")
                        continue
                    
                    # Extraction des étoiles
                    etoiles = []
                    for i in range(1, 3):
                        etoile = row[f'Étoile {i}']
                        if pd.isna(etoile) or not isinstance(etoile, (int, float)):
                            errors.append(f"Ligne {index + 2}: Étoile {i} invalide")
                            break
                        etoiles.append(int(etoile))
                    else:
                        # Vérification des plages pour les étoiles
                        if not all(1 <= e <= 12 for e in etoiles):
                            errors.append(f"Ligne {index + 2}: Étoiles hors de la plage 1-12")
                            continue
                        
                        if len(set(etoiles)) != 2:
                            errors.append(f"Ligne {index + 2}: Étoiles en double")
                            continue
                        
                        # Création du tirage
                        new_draw = DrawEuromillions(
                            date=draw_date,
                            numeros=sorted(numeros),
                            etoiles=sorted(etoiles)
                        )
                        
                        db.add(new_draw)
                        added_count += 1
                
            except Exception as e:
                errors.append(f"Ligne {index + 2}: Erreur inattendue - {str(e)}")
        
        db.commit()
        
        return {
            "message": f"Import terminé. {added_count} tirages ajoutés, {skipped_count} ignorés.",
            "added_count": added_count,
            "skipped_count": skipped_count,
            "errors": errors[:10]  # Limiter à 10 erreurs pour éviter des réponses trop longues
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'import: {str(e)}")

@router.get("/generate")
async def generate_euromillions_grids(
    num_grids: int = 3,
    mode: str = "weighted",
    db: Session = Depends(get_db)
):
    """Générer des grilles Euromillions"""
    from ..models import DrawEuromillions
    
    draws = db.query(DrawEuromillions).all()
    
    if not draws:
        raise HTTPException(status_code=404, detail="Aucun tirage trouvé pour la génération")
    
    # Logique de génération basique
    grids = []
    for i in range(num_grids):
        # Pour l'instant, génération aléatoire simple
        import random
        numeros = sorted(random.sample(range(1, 51), 5))
        etoiles = sorted(random.sample(range(1, 13), 2))
        
        grids.append({
            "numeros": numeros,
            "etoiles": etoiles,
            "type": "generated"
        })
    
    return {"grids": grids} 

@router.post("/analyze-grid")
def analyze_grid(
    grid: dict,
    db: Session = Depends(get_db)
):
    """Analyser une grille générée et calculer les probabilités"""
    from ..crud import analyze_generated_grid
    
    try:
        analysis = analyze_generated_grid(db, "euromillions", grid)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/number-stats")
def get_number_stats(
    year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Récupérer les statistiques des numéros avec filtre optionnel par année"""
    from ..crud import get_number_statistics
    
    try:
        stats = get_number_statistics(db, "euromillions", year)
        return {"stats": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/quick-stats")
def get_quick_stats(
    year: Optional[int] = Query(None, description="Année spécifique"),
    month: Optional[int] = Query(None, description="Mois spécifique (1-12)"),
    db: Session = Depends(get_db)
):
    """Récupère les statistiques rapides des numéros et étoiles"""
    from ..models import DrawEuromillions
    from app.cache_manager import cache_manager
    from app.performance_metrics import performance_metrics
    from sqlalchemy import extract, func
    import time
    
    # Démarrer le chronomètre
    timer_id = performance_metrics.start_timer("quick_stats_euromillions")
    
    try:
        # Vérifier le cache d'abord
        cached_result = cache_manager.get_quick_stats_cache('euromillions', year, month)
        if cached_result:
            performance_metrics.end_timer(timer_id, True, {'cache_hit': True})
            return {
                **cached_result,
                "cached": True,
                "cache_info": "Données récupérées du cache"
            }
        
        # Construire la requête de base
        query = db.query(DrawEuromillions)
        
        # Appliquer les filtres
        if year:
            query = query.filter(extract('year', DrawEuromillions.date) == year)
        if month:
            query = query.filter(extract('month', DrawEuromillions.date) == month)
        
        # Compter le total de tirages
        total_draws = query.count()
        
        if total_draws == 0:
            result = {
                "total_draws": 0,
                "numbers": [],
                "stars": []
            }
            cache_manager.set_quick_stats_cache('euromillions', result, year, month)
            performance_metrics.end_timer(timer_id, True, {'cache_hit': False, 'total_draws': 0})
            return {**result, "cached": False}
        
        # Statistiques des numéros (1-50)
        number_stats = []
        for num in range(1, 51):
            count = query.filter(
                (DrawEuromillions.n1 == num) |
                (DrawEuromillions.n2 == num) |
                (DrawEuromillions.n3 == num) |
                (DrawEuromillions.n4 == num) |
                (DrawEuromillions.n5 == num)
            ).count()
            
            percentage = (count / total_draws) * 100 if total_draws > 0 else 0
            
            # Trouver la dernière apparition
            last_draw = query.filter(
                (DrawEuromillions.n1 == num) |
                (DrawEuromillions.n2 == num) |
                (DrawEuromillions.n3 == num) |
                (DrawEuromillions.n4 == num) |
                (DrawEuromillions.n5 == num)
            ).order_by(DrawEuromillions.date.desc()).first()
            
            number_stats.append({
                "numero": num,
                "count": count,
                "percentage": round(percentage, 1),
                "last_appearance": last_draw.date.strftime('%Y-%m-%d') if last_draw else None
            })
        
        # Statistiques des étoiles (1-12)
        star_stats = []
        for star in range(1, 13):
            count = query.filter(
                (DrawEuromillions.e1 == star) |
                (DrawEuromillions.e2 == star)
            ).count()
            
            percentage = (count / total_draws) * 100 if total_draws > 0 else 0
            
            # Trouver la dernière apparition
            last_draw = query.filter(
                (DrawEuromillions.e1 == star) |
                (DrawEuromillions.e2 == star)
            ).order_by(DrawEuromillions.date.desc()).first()
            
            star_stats.append({
                "numero": star,
                "count": count,
                "percentage": round(percentage, 1),
                "last_appearance": last_draw.date.strftime('%Y-%m-%d') if last_draw else None
            })
        
        result = {
            "total_draws": total_draws,
            "numbers": number_stats,
            "stars": star_stats
        }
        
        # Mettre en cache le résultat
        cache_manager.set_quick_stats_cache('euromillions', result, year, month)
        
        # Terminer le chronomètre
        performance_metrics.end_timer(timer_id, True, {
            'cache_hit': False, 
            'total_draws': total_draws,
            'calculation_time': time.time()
        })
        
        return {**result, "cached": False}
        
    except Exception as e:
        performance_metrics.end_timer(timer_id, False, {'error': str(e)})
        raise HTTPException(status_code=500, detail=f"Erreur lors du calcul des statistiques: {str(e)}")

@router.get("/performance-metrics")
def get_performance_metrics(
    days: int = Query(7, description="Nombre de jours pour l'analyse"),
    db: Session = Depends(get_db)
):
    """Récupère les métriques de performance"""
    from app.performance_metrics import performance_metrics
    from app.cache_manager import cache_manager
    
    try:
        # Métriques de performance générales
        performance_summary = performance_metrics.get_performance_summary('euromillions', days)
        
        # Métriques du cache
        cache_performance = performance_metrics.get_cache_performance()
        
        # Informations sur le cache
        cache_info = cache_manager.get_cache_info()
        
        return {
            "performance_summary": performance_summary,
            "cache_performance": cache_performance,
            "cache_info": cache_info,
            "analysis_period_days": days
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des métriques: {str(e)}")

@router.post("/generate-advanced")
def generate_advanced_grids_endpoint(
    strategy: str = Query(..., description="Stratégie de génération"),
    num_grids: int = Query(5, description="Nombre de grilles à générer"),
    params: Dict = None,
    db: Session = Depends(get_db)
):
    """Génère des grilles avancées de manière asynchrone"""
    from app.tasks import generate_advanced_grids
    
    try:
        # Paramètres par défaut
        if params is None:
            params = {
                'num_grids': num_grids,
                'strategy': strategy
            }
        
        # Lancer la tâche asynchrone
        task = generate_advanced_grids.delay('euromillions', strategy, params)
        
        return {
            "task_id": task.id,
            "status": "started",
            "message": f"Génération de {num_grids} grilles avec la stratégie '{strategy}' lancée",
            "check_status_url": f"/api/euromillions/task-status/{task.id}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du lancement de la génération: {str(e)}")

@router.get("/task-status/{task_id}")
def get_task_status(task_id: str):
    """Récupère le statut d'une tâche asynchrone"""
    from app.celery_app import celery_app
    
    try:
        task = celery_app.AsyncResult(task_id)
        
        if task.state == 'PENDING':
            response = {
                'task_id': task_id,
                'state': task.state,
                'status': 'En attente...'
            }
        elif task.state == 'PROGRESS':
            response = {
                'task_id': task_id,
                'state': task.state,
                'status': task.info.get('status', ''),
                'current': task.info.get('current', 0),
                'total': task.info.get('total', 100)
            }
        elif task.state == 'SUCCESS':
            response = {
                'task_id': task_id,
                'state': task.state,
                'status': 'Terminé avec succès',
                'result': task.result
            }
        else:
            response = {
                'task_id': task_id,
                'state': task.state,
                'status': 'Échec',
                'error': str(task.info)
            }
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération du statut: {str(e)}")

@router.get("/gap-analysis")
def get_gap_analysis(
    db: Session = Depends(get_db)
):
    """Analyse les gaps (intervalles) pour prédire les numéros"""
    from app.gap_analysis import gap_analyzer
    from ..models import DrawEuromillions
    
    try:
        # Récupérer tous les tirages
        draws = db.query(DrawEuromillions).order_by(DrawEuromillions.date.desc()).all()
        
        if not draws:
            raise HTTPException(status_code=404, detail="Aucun tirage trouvé")
        
        # Analyser les gaps
        gap_analysis = gap_analyzer.analyze_number_gaps(draws, 'euromillions')
        
        # Calculer les statistiques
        gap_statistics = gap_analyzer.get_gap_statistics(gap_analysis)
        
        # Générer des prédictions
        predictions = gap_analyzer.predict_next_numbers(gap_analysis, 'euromillions', 10)
        
        return {
            "game_type": "euromillions",
            "total_draws_analyzed": len(draws),
            "gap_analysis": gap_analysis,
            "gap_statistics": gap_statistics,
            "predictions": predictions
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse des gaps: {str(e)}")

@router.get("/combination-analysis")
def get_combination_analysis(
    min_size: int = Query(2, description="Taille minimale des combinaisons"),
    max_size: int = Query(4, description="Taille maximale des combinaisons"),
    db: Session = Depends(get_db)
):
    """Analyse les combinaisons fréquentes"""
    from app.combination_analysis import combination_analyzer
    from ..models import DrawEuromillions
    
    try:
        # Récupérer tous les tirages
        draws = db.query(DrawEuromillions).order_by(DrawEuromillions.date.desc()).all()
        
        if not draws:
            raise HTTPException(status_code=404, detail="Aucun tirage trouvé")
        
        # Analyser les combinaisons
        combination_analysis = combination_analyzer.analyze_combinations(
            draws, 'euromillions', min_size, max_size
        )
        
        # Calculer les statistiques
        combination_statistics = combination_analyzer.get_combination_statistics(combination_analysis)
        
        # Générer des prédictions
        predictions = combination_analyzer.predict_combinations(combination_analysis, 'euromillions', 10)
        
        return {
            "game_type": "euromillions",
            "total_draws_analyzed": len(draws),
            "combination_analysis": combination_analysis,
            "combination_statistics": combination_statistics,
            "predictions": predictions,
            "parameters": {
                "min_size": min_size,
                "max_size": max_size
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse des combinaisons: {str(e)}")

@router.post("/score-grid")
def score_grid(
    grid_numbers: List[int] = Body(..., description="Numéros de la grille"),
    db: Session = Depends(get_db)
):
    """Score une grille avec le système de scoring avancé"""
    from app.grid_scoring import grid_scorer
    from app.gap_analysis import gap_analyzer
    from app.combination_analysis import combination_analyzer
    from ..models import DrawEuromillions
    
    try:
        # Validation de la grille
        if len(grid_numbers) != 5:
            raise HTTPException(status_code=400, detail="La grille Euromillions doit contenir 5 numéros")
        
        if not all(1 <= num <= 50 for num in grid_numbers):
            raise HTTPException(status_code=400, detail="Les numéros doivent être entre 1 et 50")
        
        if len(set(grid_numbers)) != len(grid_numbers):
            raise HTTPException(status_code=400, detail="Les numéros doivent être uniques")
        
        # Récupérer les données d'analyse
        draws = db.query(DrawEuromillions).order_by(DrawEuromillions.date.desc()).all()
        
        gap_analysis = gap_analyzer.analyze_number_gaps(draws, 'euromillions')
        combination_analysis = combination_analyzer.analyze_combinations(draws, 'euromillions')
        
        # Scorer la grille
        score_result = grid_scorer.score_grid(
            grid_numbers, 'euromillions', gap_analysis, combination_analysis, draws
        )
        
        return {
            "game_type": "euromillions",
            "grid_numbers": sorted(grid_numbers),
            "scoring_result": score_result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du scoring de la grille: {str(e)}")

@router.post("/compare-grids")
def compare_grids(
    grids: List[List[int]] = Body(..., description="Liste de grilles à comparer"),
    db: Session = Depends(get_db)
):
    """Compare plusieurs grilles et les classe par score"""
    from app.grid_scoring import grid_scorer
    from app.gap_analysis import gap_analyzer
    from app.combination_analysis import combination_analyzer
    from ..models import DrawEuromillions
    
    try:
        # Validation des grilles
        for i, grid in enumerate(grids):
            if len(grid) != 5:
                raise HTTPException(
                    status_code=400, 
                    detail=f"La grille {i+1} doit contenir 5 numéros"
                )
            
            if not all(1 <= num <= 50 for num in grid):
                raise HTTPException(
                    status_code=400, 
                    detail=f"Les numéros de la grille {i+1} doivent être entre 1 et 50"
                )
            
            if len(set(grid)) != len(grid):
                raise HTTPException(
                    status_code=400, 
                    detail=f"Les numéros de la grille {i+1} doivent être uniques"
                )
        
        # Récupérer les données d'analyse
        draws = db.query(DrawEuromillions).order_by(DrawEuromillions.date.desc()).all()
        
        gap_analysis = gap_analyzer.analyze_number_gaps(draws, 'euromillions')
        combination_analysis = combination_analyzer.analyze_combinations(draws, 'euromillions')
        
        # Comparer les grilles
        comparison_result = grid_scorer.compare_grids(
            grids, 'euromillions', gap_analysis, combination_analysis, draws
        )
        
        # Calculer les statistiques
        scoring_statistics = grid_scorer.get_scoring_statistics(comparison_result)
        
        return {
            "game_type": "euromillions",
            "total_grids": len(grids),
            "comparison_result": comparison_result,
            "scoring_statistics": scoring_statistics
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la comparaison des grilles: {str(e)}")

@router.get("/number-details/{numero}")
def get_number_details(
    numero: int,
    year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Récupérer les détails d'un numéro spécifique"""
    from ..crud import get_number_details
    
    try:
        details = get_number_details(db, "euromillions", numero, year)
        return details
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/years")
def get_available_years(db: Session = Depends(get_db)):
    """Récupérer les années disponibles dans les données"""
    from ..crud import get_available_years
    
    try:
        years = get_available_years(db, "euromillions")
        return {"years": years}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/draws-by-date")
def get_draws_by_date(
    date: str,
    db: Session = Depends(get_db)
):
    """Récupérer les tirages pour une date spécifique"""
    from ..models import DrawEuromillions
    
    try:
        # Convertir la date string en objet date
        search_date = datetime.strptime(date, '%Y-%m-%d').date()
        
        # Rechercher les tirages pour cette date
        draws = db.query(DrawEuromillions).filter(
            func.date(DrawEuromillions.date) == search_date
        ).all()
        
        if not draws:
            return {
                "date": date,
                "draws": [],
                "message": "Aucun tirage trouvé pour cette date"
            }
        
        # Formater les résultats
        formatted_draws = []
        for draw in draws:
            formatted_draws.append({
                "id": draw.id,
                "date": draw.date.strftime('%Y-%m-%d'),
                "n1": draw.n1,
                "n2": draw.n2,
                "n3": draw.n3,
                "n4": draw.n4,
                "n5": draw.n5,
                "e1": draw.e1,
                "e2": draw.e2
            })
        
        return {
            "date": date,
            "draws": formatted_draws,
            "count": len(formatted_draws)
        }
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Format de date invalide. Utilisez YYYY-MM-DD")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la recherche: {str(e)}") 