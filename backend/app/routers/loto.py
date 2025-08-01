from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form, Depends
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, date
from sqlalchemy import func, extract, or_, and_, desc, asc
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils import parse_loto_csv
from app.stats import StatistiquesAnalyzer
import pandas as pd
import io

router = APIRouter()

class DrawLotoCreate(BaseModel):
    date: str
    numeros: List[int]
    complementaire: int

@router.get("/")
async def get_loto_draws(
    limit: int = Query(100, description="Nombre de tirages à récupérer"),
    offset: int = Query(0, description="Offset pour la pagination"),
    sort_by: str = Query('date', description="Tri par: 'date' ou 'id'"),
    sort_order: str = Query('desc', description="Ordre: 'asc' ou 'desc'"),
    year: Optional[int] = Query(None, description="Filtrer par année"),
    month: Optional[int] = Query(None, description="Filtrer par mois"),
    db: Session = Depends(get_db)
):
    """Récupérer les tirages Loto avec pagination et filtres"""
    from app.models import DrawLoto
    from sqlalchemy import extract
    
    # Construire la requête
    query = db.query(DrawLoto)
    
    # Appliquer les filtres
    if year:
        query = query.filter(extract('year', DrawLoto.date) == year)
    if month:
        query = query.filter(extract('month', DrawLoto.date) == month)
    
    # Appliquer le tri
    if sort_by == 'date':
        if sort_order == 'desc':
            query = query.order_by(DrawLoto.date.desc())
        else:
            query = query.order_by(DrawLoto.date.asc())
    elif sort_by == 'id':
        if sort_order == 'desc':
            query = query.order_by(DrawLoto.id.desc())
        else:
            query = query.order_by(DrawLoto.id.asc())
    
    # Appliquer la pagination
    total_count = query.count()
    draws = query.offset(offset).limit(limit).all()
    
    return {
        "draws": [
            {
                "id": draw.id,
                "date": draw.date.strftime('%Y-%m-%d'),
                "numeros": [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6],
                "complementaire": draw.complementaire
            }
            for draw in draws
        ],
        "pagination": {
            "total": total_count,
            "limit": limit,
            "offset": offset,
            "has_more": offset + limit < total_count
        }
    }

@router.get("/draws")
async def get_loto_draws_alias(
    limit: int = Query(100, description="Nombre de tirages à récupérer"),
    offset: int = Query(0, description="Offset pour la pagination"),
    sort_by: str = Query('date', description="Tri par: 'date' ou 'id'"),
    sort_order: str = Query('desc', description="Ordre: 'asc' ou 'desc'"),
    year: Optional[int] = Query(None, description="Filtrer par année"),
    month: Optional[int] = Query(None, description="Filtrer par mois"),
    db: Session = Depends(get_db)
):
    """Alias pour /draws - redirige vers l'endpoint principal"""
    return await get_loto_draws(limit, offset, sort_by, sort_order, year, month, db)

@router.post("/import")
async def import_loto_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Importer des tirages Loto depuis un fichier CSV"""
    try:
        content = await file.read()
        
        # Créer un fichier temporaire pour le parsing
        import tempfile
        import os
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.csv', mode='wb') as temp_file:
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            draws_data = parse_loto_csv(temp_file_path)
            
            from app.models import DrawLoto
            
            added_count = 0
            for draw_data in draws_data:
                # Vérifier si le tirage existe déjà
                existing_draw = db.query(DrawLoto).filter(
                    DrawLoto.date == draw_data['date']
                ).first()
                
                if not existing_draw:
                    new_draw = DrawLoto(**draw_data)
                    db.add(new_draw)
                    added_count += 1
            
            db.commit()
            
            return {
                "message": f"Import réussi. {added_count} tirages ajoutés.",
                "added_count": added_count
            }
        finally:
            # Nettoyer le fichier temporaire
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/validate-upload")
async def validate_loto_upload(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Valider un fichier CSV avant import"""
    try:
        # Créer un fichier temporaire
        import tempfile
        import os
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.csv') as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            # Importer et utiliser le validateur
            import sys
            sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            from enhanced_upload_validator import EnhancedUploadValidator
            
            validator = EnhancedUploadValidator()
            validation_result = validator.validate_csv_file(temp_file_path, 'loto')
            
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

@router.post("/import-excel")
async def import_loto_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Importer des tirages Loto depuis un fichier Excel"""
    from app.models import DrawLoto
    
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Format de fichier non supporté. Utilisez .xlsx ou .xls")
    
    try:
        content = await file.read()
        
        # Lire le fichier Excel
        if file.filename.endswith('.xlsx'):
            df = pd.read_excel(io.BytesIO(content), engine='openpyxl')
        else:
            df = pd.read_excel(io.BytesIO(content), engine='xlrd')
        
        # Vérifier les colonnes requises pour le Loto
        required_columns = ['Date du tirage', 'N°1', 'N°2', 'N°3', 'N°4', 'N°5', 'N°6', 'Bonus']
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
                existing_draw = db.query(DrawLoto).filter(
                    DrawLoto.date == draw_date
                ).first()
                
                if existing_draw:
                    skipped_count += 1
                    continue
                
                # Extraction des numéros
                numeros = []
                for i in range(1, 7):  # 6 numéros pour le Loto
                    numero = row[f'N°{i}']
                    if pd.isna(numero) or not isinstance(numero, (int, float)):
                        errors.append(f"Ligne {index + 2}: Numéro {i} invalide")
                        break
                    numeros.append(int(numero))
                else:
                    # Vérification des plages pour le Loto (1-49 pour les numéros principaux)
                    if not all(1 <= n <= 49 for n in numeros):  # Changé de 45 à 49
                        errors.append(f"Ligne {index + 2}: Numéros hors de la plage 1-49")
                        continue
                    
                    if len(set(numeros)) != 6:
                        errors.append(f"Ligne {index + 2}: Numéros en double")
                        continue
                    
                    # Extraction du bonus
                    bonus = row['Bonus']
                    if pd.isna(bonus) or not isinstance(bonus, (int, float)):
                        errors.append(f"Ligne {index + 2}: Bonus invalide")
                        continue
                    
                    bonus = int(bonus)
                    
                    # Vérification de la plage pour le bonus (1-45)
                    if not 1 <= bonus <= 45:
                        errors.append(f"Ligne {index + 2}: Bonus hors de la plage 1-45")
                        continue
                    
                    # Création du tirage
                    new_draw = DrawLoto(
                        date=draw_date,
                        n1=numeros[0],
                        n2=numeros[1],
                        n3=numeros[2],
                        n4=numeros[3],
                        n5=numeros[4],
                        n6=numeros[5],
                        complementaire=bonus
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

@router.get("/stats")
async def get_loto_stats(
    year: Optional[int] = Query(None, description="Filtrer par année"),
    month: Optional[int] = Query(None, description="Filtrer par mois"),
    db: Session = Depends(get_db)
):
    """Récupérer les statistiques Loto basées sur les vrais tirages"""
    from ..models import DrawLoto
    from sqlalchemy import extract, func
    from collections import Counter
    
    # Construire la requête avec filtres
    query = db.query(DrawLoto)
    
    if year is not None:
        query = query.filter(extract('year', DrawLoto.date) == year)
    
    if month is not None:
        query = query.filter(extract('month', DrawLoto.date) == month)
    
    # Récupérer tous les tirages
    draws = query.all()
    
    if not draws:
        return {
            "numeros": [],
            "complementaires": [],
            "total_draws": 0,
            "message": "Aucun tirage trouvé pour les critères spécifiés"
        }
    
    # Extraire tous les numéros (6 par tirage) et complémentaires (1 par tirage)
    all_numbers = []
    all_complementaires = []
    
    for draw in draws:
        # 6 numéros principaux (1-49)
        all_numbers.extend([draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6])
        # 1 numéro chance (1-45)
        all_complementaires.append(draw.complementaire)
    
    # Compter les occurrences
    number_count = Counter(all_numbers)
    complementaire_count = Counter(all_complementaires)
    
    # Calculer les totaux
    total_number_occurrences = sum(number_count.values())
    total_complementaire_occurrences = sum(complementaire_count.values())
    
    # Formater les résultats
    def format_stats(items, total_occurrences):
        return [
            {
                "numero": num,
                "frequence": count,
                "pourcentage": (count / total_occurrences) * 100 if total_occurrences > 0 else 0
            } 
            for num, count in items
        ]
    
    # Top 10 numéros principaux et top 6 numéros chance
    top_numbers = number_count.most_common(10)
    top_complementaires = complementaire_count.most_common(6)
    
    return {
        "numeros": format_stats(top_numbers, total_number_occurrences),
        "complementaires": format_stats(top_complementaires, total_complementaire_occurrences),
        "total_draws": len(draws),
        "total_number_occurrences": total_number_occurrences,
        "total_complementaire_occurrences": total_complementaire_occurrences,
        "date_range": {
            "start": min(draw.date for draw in draws).strftime('%Y-%m-%d'),
            "end": max(draw.date for draw in draws).strftime('%Y-%m-%d')
        } if draws else None,
        "game_info": {
            "numeros_range": "1-49",
            "complementaire_range": "1-45",
            "numeros_per_draw": 6,
            "complementaire_per_draw": 1
        }
    }

@router.post("/add-draw")
async def add_single_draw(draw: DrawLotoCreate, db: Session = Depends(get_db)):
    """Ajouter un tirage Loto manuellement"""
    from app.models import DrawLoto
    
    try:
        # Validation des données
        if len(draw.numeros) != 6:
            raise HTTPException(status_code=400, detail="Il faut exactement 6 numéros")
        
        # Validation des plages
        for numero in draw.numeros:
            if not 1 <= numero <= 49:  # Changé de 45 à 49 pour les numéros principaux
                raise HTTPException(status_code=400, detail=f"Numéro {numero} hors de la plage 1-49")
        
        if not (1 <= draw.complementaire <= 45):  # Complémentaire reste 1-45
            raise HTTPException(status_code=400, detail=f"Numéro complémentaire {draw.complementaire} hors de la plage 1-45")
        
        # Vérification que le numéro complémentaire n'est pas dans les numéros principaux
        if draw.complementaire in draw.numeros:
            raise HTTPException(status_code=400, detail="Le numéro complémentaire ne peut pas être identique à un numéro principal")
        
        # Vérification du jour de tirage (Lotto: mercredi et samedi)
        draw_date = datetime.strptime(draw.date, "%Y-%m-%d").date()
        day_of_week = draw_date.weekday()  # 0=lundi, 2=mercredi, 5=samedi
        if day_of_week not in [2, 5]:  # Mercredi et samedi
            day_names = {0: "lundi", 1: "mardi", 2: "mercredi", 3: "jeudi", 4: "vendredi", 5: "samedi", 6: "dimanche"}
            raise HTTPException(status_code=400, detail=f"Le Lotto se tire uniquement le mercredi et le samedi. La date sélectionnée ({day_names[day_of_week]}) n'est pas valide.")
        
        # Vérification des doublons
        if len(set(draw.numeros)) != 6:
            raise HTTPException(status_code=400, detail="Numéros en double détectés")
        
        # Vérification de la date
        try:
            draw_date = datetime.strptime(draw.date, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Format de date invalide (YYYY-MM-DD)")
        
        # Vérification des doublons de date
        existing_draw = db.query(DrawLoto).filter(
            DrawLoto.date == draw_date
        ).first()
        
        if existing_draw:
            raise HTTPException(status_code=400, detail="Un tirage existe déjà pour cette date")
        
        # Création du nouveau tirage
        sorted_numeros = sorted(draw.numeros)
        new_draw = DrawLoto(
            date=draw_date,
            n1=sorted_numeros[0],
            n2=sorted_numeros[1],
            n3=sorted_numeros[2],
            n4=sorted_numeros[3],
            n5=sorted_numeros[4],
            n6=sorted_numeros[5],
            complementaire=draw.complementaire
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
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'ajout du tirage: {str(e)}")

@router.get("/number/{number}")
async def get_number_history(
    number: int, 
    type: str = Query(..., description="Type: 'numero' ou 'bonus'"),
    limit: int = Query(10, description="Nombre de tirages par page"),
    offset: int = Query(0, description="Offset pour la pagination"),
    sort_by: str = Query('date', description="Tri par: 'date' ou 'id'"),
    sort_order: str = Query('desc', description="Ordre: 'asc' ou 'desc'"),
    year: Optional[int] = Query(None, description="Filtrer par année"),
    db: Session = Depends(get_db)
):
    """Récupérer l'historique complet d'un numéro ou d'un bonus spécifique"""
    from app.models import DrawLoto
    
    if type not in ['numero', 'bonus']:
        raise HTTPException(status_code=400, detail="Type doit être 'numero' ou 'bonus'")
    
    if sort_by not in ['date', 'id']:
        raise HTTPException(status_code=400, detail="sort_by doit être 'date' ou 'id'")
    
    if sort_order not in ['asc', 'desc']:
        raise HTTPException(status_code=400, detail="sort_order doit être 'asc' ou 'desc'")
    
    # Construire la requête avec filtres
    query = db.query(DrawLoto)
    
    # Filtrer par année si spécifié
    if year is not None:
        query = query.filter(extract('year', DrawLoto.date) == year)
    
    # Appliquer le tri
    if sort_by == 'date':
        if sort_order == 'desc':
            query = query.order_by(DrawLoto.date.desc())
        else:
            query = query.order_by(DrawLoto.date.asc())
    else:  # sort_by == 'id'
        if sort_order == 'desc':
            query = query.order_by(DrawLoto.id.desc())
        else:
            query = query.order_by(DrawLoto.id.asc())
    
    all_draws = query.all()
    
    if not all_draws:
        raise HTTPException(status_code=404, detail="Aucun tirage trouvé")
    
    # Analyser l'historique du numéro
    appearances = []
    total_draws = len(all_draws)
    
    for draw in all_draws:
        numeros = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6]
        
        if type == 'numero' and number in numeros:
            appearances.append({
                'id': draw.id,
                'date': draw.date.strftime('%Y-%m-%d'),
                'numeros': numeros,
                'complementaire': draw.complementaire
            })
        elif type == 'bonus' and number == draw.complementaire:
            appearances.append({
                'id': draw.id,
                'date': draw.date.strftime('%Y-%m-%d'),
                'numeros': numeros,
                'bonus': draw.complementaire
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
async def get_detailed_stats_loto(db: Session = Depends(get_db)):
    """Récupérer les statistiques détaillées Loto"""
    from .loto_advanced_stats import LotoAdvancedStats
    
    analyzer = LotoAdvancedStats(db)
    stats = analyzer.get_comprehensive_stats()
    
    if "error" in stats:
        raise HTTPException(status_code=404, detail=stats["error"])
    
    return stats

@router.get("/generate")
async def generate_loto_grids(
    num_grids: int = 3,
    mode: str = "weighted",
    db: Session = Depends(get_db)
):
    """Générer des grilles Loto"""
    from app.models import DrawLoto
    
    # Logique de génération basique
    grids = []
    for i in range(num_grids):
        # Génération aléatoire simple (fonctionne même sans données existantes)
        import random
        numeros = sorted(random.sample(range(1, 50), 6))  # Changé de 46 à 50
        complementaire = random.randint(1, 45)
        
        grids.append({
            "numeros": numeros,
            "complementaire": complementaire,
            "type": "generated"
        })
    
    return {"grids": grids}

@router.post("/generate")
async def generate_loto_grids_post(
    num_grids: int = 3,
    strategy: str = "random",
    db: Session = Depends(get_db)
):
    """Générer des grilles Loto via POST"""
    from app.models import DrawLoto
    
    # Logique de génération basique
    grids = []
    for i in range(num_grids):
        # Générer des grilles aléatoires
        grids = []
        for i in range(num_grids):
            numeros = sorted(random.sample(range(1, 50), 6))  # Changé de 46 à 50
            complementaire = random.randint(1, 45)
            grids.append({
                "id": i + 1,
                "numeros": numeros,
                "complementaire": complementaire,
                "type": "random"
            })
    
    return {"grids": grids}

@router.get("/quick-stats")
def get_quick_stats(
    year: Optional[int] = Query(None, description="Année spécifique"),
    month: Optional[int] = Query(None, description="Mois spécifique (1-12)"),
    db: Session = Depends(get_db)
):
    """Récupère les statistiques rapides des numéros Loto"""
    from app.models import DrawLoto
    from sqlalchemy import extract, func
    
    try:
        # Construire la requête de base
        query = db.query(DrawLoto)
        
        # Appliquer les filtres
        if year:
            query = query.filter(extract('year', DrawLoto.date) == year)
        if month:
            query = query.filter(extract('month', DrawLoto.date) == month)
        
        # Compter le total de tirages
        total_draws = query.count()
        
        if total_draws == 0:
            # Générer des statistiques vides pour tous les numéros (1-45) et complémentaires (1-10)
            number_stats = []
            for num in range(1, 46):
                number_stats.append({
                    "numero": num,
                    "count": 0,
                    "percentage": 0.0,
                    "last_appearance": None
                })
            
            complementaire_stats = []
            for comp in range(1, 11):
                complementaire_stats.append({
                    "numero": comp,
                    "count": 0,
                    "percentage": 0.0,
                    "last_appearance": None
                })
            
            return {
                "total_draws": 0,
                "numbers": number_stats,
                "complementaires": complementaire_stats
            }
        
        # Statistiques des numéros (1-45)
        number_stats = []
        for num in range(1, 46):
            count = query.filter(
                (DrawLoto.n1 == num) |
                (DrawLoto.n2 == num) |
                (DrawLoto.n3 == num) |
                (DrawLoto.n4 == num) |
                (DrawLoto.n5 == num) |
                (DrawLoto.n6 == num)
            ).count()
            
            percentage = (count / total_draws) * 100 if total_draws > 0 else 0
            
            # Trouver la dernière apparition
            last_draw = query.filter(
                (DrawLoto.n1 == num) |
                (DrawLoto.n2 == num) |
                (DrawLoto.n3 == num) |
                (DrawLoto.n4 == num) |
                (DrawLoto.n5 == num) |
                (DrawLoto.n6 == num)
            ).order_by(DrawLoto.date.desc()).first()
            
            number_stats.append({
                "numero": num,
                "count": count,
                "percentage": round(percentage, 1),
                "last_appearance": last_draw.date.strftime('%Y-%m-%d') if last_draw else None
            })
        
        # Statistiques des numéros complémentaires (1-10)
        complementaire_stats = []
        for comp in range(1, 11):
            count = query.filter(DrawLoto.complementaire == comp).count()
            
            percentage = (count / total_draws) * 100 if total_draws > 0 else 0
            
            # Trouver la dernière apparition
            last_draw = query.filter(
                DrawLoto.complementaire == comp
            ).order_by(DrawLoto.date.desc()).first()
            
            complementaire_stats.append({
                "numero": comp,
                "count": count,
                "percentage": round(percentage, 1),
                "last_appearance": last_draw.date.strftime('%Y-%m-%d') if last_draw else None
            })
        
        return {
            "total_draws": total_draws,
            "numbers": number_stats,
            "complementaires": complementaire_stats
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du calcul des statistiques: {str(e)}")

@router.get("/export")
async def export_loto_data(
    format: str = Query("csv", description="Format d'export: 'csv' ou 'excel'"),
    year: Optional[int] = Query(None, description="Filtrer par année"),
    db: Session = Depends(get_db)
):
    """Exporter les données Loto en CSV ou Excel"""
    from app.models import DrawLoto
    from fastapi.responses import StreamingResponse
    
    try:
        # Construire la requête de base
        query = db.query(DrawLoto)
        
        # Appliquer le filtre par année si spécifié
        if year:
            query = query.filter(extract('year', DrawLoto.date) == year)
        
        # Récupérer tous les tirages
        draws = query.order_by(DrawLoto.date.desc()).all()
        
        if not draws:
            raise HTTPException(status_code=404, detail="Aucun tirage trouvé pour l'export")
        
        # Préparer les données pour l'export
        data = []
        for draw in draws:
            data.append({
                'Date': draw.date.strftime('%Y-%m-%d'),
                'Numéro 1': draw.n1,
                'Numéro 2': draw.n2,
                'Numéro 3': draw.n3,
                'Numéro 4': draw.n4,
                'Numéro 5': draw.n5,
                'Numéro 6': draw.n6,
                'Complémentaire': draw.complementaire
            })
        
        # Créer le DataFrame
        df = pd.DataFrame(data)
        
        if format.lower() == 'excel':
            # Export Excel
            output = io.BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='Tirages Loto', index=False)
            output.seek(0)
            
            filename = f"loto_tirages_{year if year else 'tous'}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
            
            return StreamingResponse(
                io.BytesIO(output.getvalue()),
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )
        else:
            # Export CSV
            output = io.StringIO()
            df.to_csv(output, index=False, sep=',', encoding='utf-8')
            output.seek(0)
            
            filename = f"loto_tirages_{year if year else 'tous'}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            
            return StreamingResponse(
                io.BytesIO(output.getvalue().encode('utf-8')),
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'export: {str(e)}")

@router.post("/analyze-grid")
def analyze_grid(
    grid: dict,
    db: Session = Depends(get_db)
):
    """Analyser une grille générée et calculer les probabilités"""
    try:
        # Analyse basique pour Loto
        numeros = grid.get('numeros', [])
        complementaire = grid.get('complementaire')
        
        if not numeros or len(numeros) != 6:
            raise HTTPException(status_code=400, detail="Grille invalide: 6 numéros requis")
        
        if not complementaire or not (1 <= complementaire <= 45):
            raise HTTPException(status_code=400, detail="Complémentaire invalide: doit être entre 1 et 45")
        
        # Vérifier les doublons
        if len(set(numeros)) != 6:
            raise HTTPException(status_code=400, detail="Numéros en double détectés")
        
        # Vérifier la plage des numéros
        if not all(1 <= n <= 49 for n in numeros):  # Changé de 45 à 49
            raise HTTPException(status_code=400, detail="Numéros hors plage: doivent être entre 1 et 49")
        
        # Calculer les statistiques de base
        from app.models import DrawLoto
        
        total_draws = db.query(DrawLoto).count()
        
        # Fréquence des numéros dans la grille
        numero_frequencies = {}
        for num in numeros:
            count = db.query(DrawLoto).filter(
                (DrawLoto.n1 == num) |
                (DrawLoto.n2 == num) |
                (DrawLoto.n3 == num) |
                (DrawLoto.n4 == num) |
                (DrawLoto.n5 == num) |
                (DrawLoto.n6 == num)
            ).count()
            numero_frequencies[num] = {
                'count': count,
                'percentage': (count / total_draws * 100) if total_draws > 0 else 0
            }
        
        # Fréquence du complémentaire
        complementaire_count = db.query(DrawLoto).filter(
            DrawLoto.complementaire == complementaire
        ).count()
        
        complementaire_frequency = {
            'count': complementaire_count,
            'percentage': (complementaire_count / total_draws * 100) if total_draws > 0 else 0
        }
        
        # Score de la grille (basé sur la fréquence)
        total_score = sum(freq['percentage'] for freq in numero_frequencies.values()) + complementaire_frequency['percentage']
        average_score = total_score / 7  # 6 numéros + 1 complémentaire
        
        return {
            "grid": grid,
            "analysis": {
                "numero_frequencies": numero_frequencies,
                "complementaire_frequency": complementaire_frequency,
                "total_score": round(total_score, 2),
                "average_score": round(average_score, 2),
                "total_draws_analyzed": total_draws
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse: {str(e)}")

@router.get("/years")
def get_available_years(db: Session = Depends(get_db)):
    """Récupérer les années disponibles dans les données"""
    from app.models import DrawLoto
    from sqlalchemy import extract
    
    try:
        years_query = db.query(extract('year', DrawLoto.date).label('year')).distinct().order_by(extract('year', DrawLoto.date).desc())
        years_result = years_query.all()
        years = [int(year.year) for year in years_result if year.year is not None]
        return {"years": years}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des années: {str(e)}")

@router.get("/search")
async def search_loto_draws(
    year: Optional[int] = None,
    month: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    numero: Optional[int] = None,
    complementaire: Optional[int] = None,
    sort_by: str = "date",
    sort_order: str = "desc",
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Rechercher des tirages Loto avec filtres"""
    from app.models import DrawLoto
    from sqlalchemy import extract, or_, and_
    
    try:
        query = db.query(DrawLoto)
        
        # Filtres
        if year:
            query = query.filter(extract('year', DrawLoto.date) == year)
        if month:
            query = query.filter(extract('month', DrawLoto.date) == month)
        if start_date:
            query = query.filter(DrawLoto.date >= start_date)
        if end_date:
            query = query.filter(DrawLoto.date <= end_date)
        if numero:
            query = query.filter(
                (DrawLoto.n1 == numero) |
                (DrawLoto.n2 == numero) |
                (DrawLoto.n3 == numero) |
                (DrawLoto.n4 == numero) |
                (DrawLoto.n5 == numero) |
                (DrawLoto.n6 == numero)
            )
        if complementaire:
            query = query.filter(DrawLoto.complementaire == complementaire)
        
        # Tri
        if sort_by == "date":
            if sort_order == "desc":
                query = query.order_by(DrawLoto.date.desc())
            else:
                query = query.order_by(DrawLoto.date.asc())
        elif sort_by == "id":
            if sort_order == "desc":
                query = query.order_by(DrawLoto.id.desc())
            else:
                query = query.order_by(DrawLoto.id.asc())
        
        # Pagination
        total = query.count()
        draws = query.offset(offset).limit(limit).all()
        
        return {
            "draws": [
                {
                    "id": draw.id,
                    "date": draw.date.strftime('%Y-%m-%d'),
                    "numeros": [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6],
                    "complementaire": draw.complementaire
                }
                for draw in draws
            ],
            "total": total,
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la recherche: {str(e)}")

@router.post("/import-multiple")
async def import_multiple_loto_files(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    """Importer plusieurs fichiers CSV Loto en une seule fois"""
    import tempfile
    import os
    
    results = []
    total_added = 0
    
    try:
        for file in files:
            file_result = {
                "filename": file.filename,
                "success": False,
                "added_count": 0,
                "errors": [],
                "warnings": []
            }
            
            try:
                content = await file.read()
                
                # Créer un fichier temporaire pour le parsing
                with tempfile.NamedTemporaryFile(delete=False, suffix='.csv', mode='wb') as temp_file:
                    temp_file.write(content)
                    temp_file_path = temp_file.name
                
                try:
                    # Valider le fichier d'abord
                    import sys
                    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                    from upload_validator import UploadValidator
                    
                    validator = UploadValidator()
                    validation_result = validator.validate_csv_file(temp_file_path, 'loto')
                    
                    if not validation_result['valid']:
                        file_result["errors"] = validation_result['errors']
                        file_result["warnings"] = validation_result['warnings']
                        results.append(file_result)
                        continue
                    
                    # Parser et importer les données
                    draws_data = parse_loto_csv(temp_file_path)
                    
                    from app.models import DrawLoto
                    
                    added_count = 0
                    for draw_data in draws_data:
                        # Vérifier si le tirage existe déjà
                        existing_draw = db.query(DrawLoto).filter(
                            DrawLoto.date == draw_data['date']
                        ).first()
                        
                        if not existing_draw:
                            new_draw = DrawLoto(**draw_data)
                            db.add(new_draw)
                            added_count += 1
                    
                    file_result["success"] = True
                    file_result["added_count"] = added_count
                    total_added += added_count
                    
                    # Ajouter des informations sur les doublons
                    if validation_result['duplicates'] > 0:
                        file_result["warnings"].append(f"{validation_result['duplicates']} tirages en doublon ignorés")
                    
                finally:
                    # Nettoyer le fichier temporaire
                    if os.path.exists(temp_file_path):
                        os.unlink(temp_file_path)
                        
            except Exception as e:
                file_result["errors"].append(str(e))
            
            results.append(file_result)
        
        # Valider tous les changements
        db.commit()
        
        return {
            "message": f"Import multiple terminé. {total_added} tirages ajoutés au total.",
            "total_added": total_added,
            "files_processed": len(files),
            "files_success": len([r for r in results if r["success"]]),
            "files_failed": len([r for r in results if not r["success"]]),
            "results": results
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'import multiple: {str(e)}")

@router.post("/validate-multiple")
async def validate_multiple_loto_files(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    """Valider plusieurs fichiers CSV Loto avant import"""
    import tempfile
    import os
    
    results = []
    
    try:
        for file in files:
            file_result = {
                "filename": file.filename,
                "valid": False,
                "total_rows": 0,
                "valid_rows": 0,
                "invalid_rows": 0,
                "duplicates": 0,
                "date_range": {},
                "summary": {},
                "errors": [],
                "warnings": []
            }
            
            try:
                content = await file.read()
                
                # Créer un fichier temporaire
                with tempfile.NamedTemporaryFile(delete=False, suffix='.csv') as temp_file:
                    temp_file.write(content)
                    temp_file_path = temp_file.name
                
                try:
                    # Valider le fichier
                    import sys
                    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                    from enhanced_upload_validator import EnhancedUploadValidator
                    
                    validator = EnhancedUploadValidator()
                    validation_result = validator.validate_csv_file(temp_file_path, 'loto')
                    
                    file_result.update(validation_result)
                    
                finally:
                    # Nettoyer le fichier temporaire
                    if os.path.exists(temp_file_path):
                        os.unlink(temp_file_path)
                        
            except Exception as e:
                file_result["errors"].append(str(e))
            
            results.append(file_result)
        
        # Résumé global
        total_files = len(files)
        valid_files = len([r for r in results if r["valid"]])
        total_rows = sum(r["total_rows"] for r in results)
        total_valid_rows = sum(r["valid_rows"] for r in results)
        total_duplicates = sum(r["duplicates"] for r in results)
        
        return {
            "summary": {
                "total_files": total_files,
                "valid_files": valid_files,
                "invalid_files": total_files - valid_files,
                "total_rows": total_rows,
                "total_valid_rows": total_valid_rows,
                "total_duplicates": total_duplicates
            },
            "results": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la validation multiple: {str(e)}") 