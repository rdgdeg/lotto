from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import tempfile
import os
from ..database import SessionLocal
from ..crud import insert_draw_euromillions, insert_draw_loto, insert_statistique
from ..utils import parse_euromillions_csv, parse_loto_csv, parse_stats_csv

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
async def import_csv(
    file: UploadFile = File(...), 
    type: str = Form(...), 
    jeu: str = Form(None),  # Pour les stats, spécifier le jeu
    db: Session = Depends(get_db)
):
    # Validation du type de fichier
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Le fichier doit être un CSV")
    
    # Validation du type
    if type not in ["euromillions", "loto", "stats"]:
        raise HTTPException(status_code=400, detail="Type doit être 'euromillions', 'loto' ou 'stats'")
    
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.csv') as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        if type == "euromillions":
            try:
                draws = parse_euromillions_csv(tmp_path)
                print(f"Parsing réussi: {len(draws)} tirages trouvés")
                
                imported_count = 0
                for draw in draws:
                    try:
                        result = insert_draw_euromillions(db, draw)
                        if result:
                            imported_count += 1
                    except Exception as insert_error:
                        print(f"Erreur lors de l'insertion du tirage {draw}: {insert_error}")
                        # Continuer avec les autres tirages
                
                return JSONResponse(content={
                    "message": f"{imported_count} tirages Euromillions importés avec succès sur {len(draws)} trouvés",
                    "count": imported_count
                })
            except Exception as parse_error:
                raise HTTPException(status_code=500, detail=f"Erreur lors du parsing du fichier Euromillions: {str(parse_error)}")
            
        elif type == "loto":
            draws = parse_loto_csv(tmp_path)
            for draw in draws:
                insert_draw_loto(db, draw)
            return JSONResponse(content={
                "message": f"{len(draws)} tirages Loto importés avec succès",
                "count": len(draws)
            })
            
        elif type == "stats":
            if not jeu or jeu not in ["euromillions", "loto"]:
                raise HTTPException(status_code=400, detail="Pour les stats, spécifiez le jeu ('euromillions' ou 'loto')")
            
            stats = parse_stats_csv(tmp_path, jeu)
            for stat in stats:
                insert_statistique(db, stat)
            return JSONResponse(content={
                "message": f"{len(stats)} statistiques importées avec succès pour {jeu}",
                "count": len(stats),
                "jeu": jeu
            })
            
    except HTTPException:
        # Re-raise les HTTPException
        raise
    except Exception as e:
        print(f"Erreur générale lors de l'import: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'import: {str(e)}")
    finally:
        # Nettoyage du fichier temporaire
        if 'tmp_path' in locals():
            os.unlink(tmp_path)

@router.get("/stats/{jeu}")
def get_imported_stats(jeu: str, db: Session = Depends(get_db)):
    """Récupérer les statistiques importées pour un jeu donné"""
    from ..crud import get_stats
    stats = get_stats(db, jeu)
    return {
        "jeu": jeu,
        "stats": stats
    }

@router.post("/validate")
async def validate_import(
    file: UploadFile = File(...),
    type: str = Form(...),
    db: Session = Depends(get_db)
):
    """Valider un fichier CSV avant import"""
    try:
        # Validation du type de fichier
        if not file.filename.endswith('.csv'):
            return {
                "valid": False,
                "errors": ["Le fichier doit être un CSV"],
                "warnings": [],
                "summary": "Fichier invalide"
            }
        
        # Validation du type
        if type not in ["euromillions", "loto", "stats"]:
            return {
                "valid": False,
                "errors": ["Type doit être 'euromillions', 'loto' ou 'stats'"],
                "warnings": [],
                "summary": "Type invalide"
            }
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.csv') as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        try:
            if type == "euromillions":
                draws = parse_euromillions_csv(tmp_path)
                return {
                    "valid": True,
                    "errors": [],
                    "warnings": [],
                    "summary": f"Fichier Euromillions valide: {len(draws)} tirages trouvés",
                    "count": len(draws),
                    "type": "euromillions"
                }
            elif type == "loto":
                draws = parse_loto_csv(tmp_path)
                return {
                    "valid": True,
                    "errors": [],
                    "warnings": [],
                    "summary": f"Fichier Loto valide: {len(draws)} tirages trouvés",
                    "count": len(draws),
                    "type": "loto"
                }
            elif type == "stats":
                return {
                    "valid": True,
                    "errors": [],
                    "warnings": ["Validation des stats nécessite le paramètre 'jeu'"],
                    "summary": "Fichier stats détecté",
                    "type": "stats"
                }
        except Exception as parse_error:
            return {
                "valid": False,
                "errors": [f"Erreur de parsing: {str(parse_error)}"],
                "warnings": [],
                "summary": "Fichier invalide"
            }
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
                
    except Exception as e:
        return {
            "valid": False,
            "errors": [f"Erreur générale: {str(e)}"],
            "warnings": [],
            "summary": "Erreur de validation"
        }

@router.delete("/clear/{game_type}")
def clear_imported_data(game_type: str, db: Session = Depends(get_db)):
    """Supprimer toutes les données importées pour un type de jeu"""
    from ..crud import delete_all_draws_euromillions, delete_all_draws_loto, delete_all_stats
    
    try:
        if game_type == "euromillions":
            deleted_draws = delete_all_draws_euromillions(db)
            deleted_stats = delete_all_stats(db)
            return JSONResponse(content={
                "message": f"Données Euromillions supprimées avec succès",
                "deleted_draws": deleted_draws,
                "deleted_stats": deleted_stats
            })
        elif game_type == "loto":
            deleted_draws = delete_all_draws_loto(db)
            deleted_stats = delete_all_stats(db)
            return JSONResponse(content={
                "message": f"Données Loto supprimées avec succès",
                "deleted_draws": deleted_draws,
                "deleted_stats": deleted_stats
            })
        elif game_type == "all":
            deleted_euromillions = delete_all_draws_euromillions(db)
            deleted_loto = delete_all_draws_loto(db)
            deleted_stats = delete_all_stats(db)
            return JSONResponse(content={
                "message": "Toutes les données supprimées avec succès",
                "deleted_euromillions": deleted_euromillions,
                "deleted_loto": deleted_loto,
                "deleted_stats": deleted_stats
            })
        else:
            raise HTTPException(status_code=400, detail="Type de jeu invalide. Utilisez 'euromillions', 'loto' ou 'all'")
    except Exception as e:
        print(f"Erreur lors de la suppression: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la suppression: {str(e)}") 