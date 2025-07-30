from typing import List, Dict, Any, Optional
from .database import supabase, SQLALCHEMY_AVAILABLE

if SQLALCHEMY_AVAILABLE:
    from sqlalchemy.orm import Session
    from .models import DrawEuromillions, DrawLoto, Statistique
    from sqlalchemy import extract, or_
else:
    from typing import Session

def insert_draw_euromillions(db, data: dict):
    """Insère un tirage Euromillions dans la base de données"""
    if SQLALCHEMY_AVAILABLE:
        draw = DrawEuromillions(**data)
        db.add(draw)
        db.commit()
        db.refresh(draw)
        return draw
    else:
        try:
            response = supabase.table('draws_euromillions').insert(data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erreur lors de l'insertion Euromillions: {e}")
            return None

def insert_draw_loto(db, data: dict):
    """Insère un tirage Loto dans la base de données"""
    if SQLALCHEMY_AVAILABLE:
        draw = DrawLoto(**data)
        db.add(draw)
        db.commit()
        db.refresh(draw)
        return draw
    else:
        try:
            response = supabase.table('draws_loto').insert(data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erreur lors de l'insertion Loto: {e}")
            return None

def insert_statistique(db, data: dict):
    """Insère une statistique dans la base de données"""
    if SQLALCHEMY_AVAILABLE:
        stat = Statistique(**data)
        db.add(stat)
        db.commit()
        db.refresh(stat)
        return stat
    else:
        try:
            response = supabase.table('stats').insert(data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Erreur lors de l'insertion statistique: {e}")
            return None

def get_all_draws_euromillions(db) -> List[Dict]:
    """Récupère tous les tirages Euromillions"""
    if SQLALCHEMY_AVAILABLE:
        draws = db.query(DrawEuromillions).all()
        return [{"id": d.id, "date": d.date, "n1": d.n1, "n2": d.n2, "n3": d.n3, "n4": d.n4, "n5": d.n5, "e1": d.e1, "e2": d.e2} for d in draws]
    else:
        try:
            response = supabase.table('draws_euromillions').select('*').execute()
            return response.data
        except Exception as e:
            print(f"Erreur lors de la récupération Euromillions: {e}")
            return []

def get_all_draws_loto(db) -> List[Dict]:
    """Récupère tous les tirages Loto"""
    if SQLALCHEMY_AVAILABLE:
        draws = db.query(DrawLoto).all()
        return [{"id": d.id, "date": d.date, "n1": d.n1, "n2": d.n2, "n3": d.n3, "n4": d.n4, "n5": d.n5, "n6": d.n6, "complementaire": d.complementaire} for d in draws]
    else:
        try:
            response = supabase.table('draws_loto').select('*').execute()
            return response.data
        except Exception as e:
            print(f"Erreur lors de la récupération Loto: {e}")
            return []

def get_stats(db, jeu: str) -> List[Dict]:
    """Récupère les statistiques pour un jeu donné"""
    if SQLALCHEMY_AVAILABLE:
        stats = db.query(Statistique).filter(Statistique.jeu == jeu).all()
        return [{"id": s.id, "jeu": s.jeu, "numero": s.numero, "type": s.type, "frequence": s.frequence, "periode": s.periode} for s in stats]
    else:
        try:
            response = supabase.table('stats').select('*').eq('jeu', jeu).execute()
            return response.data
        except Exception as e:
            print(f"Erreur lors de la récupération des stats: {e}")
            return []

def get_recent_draws_euromillions(db, limit: int = 50) -> List[Dict]:
    """Récupère les tirages Euromillions récents"""
    if SQLALCHEMY_AVAILABLE:
        draws = db.query(DrawEuromillions).order_by(DrawEuromillions.date.desc()).limit(limit).all()
        return [{"id": d.id, "date": d.date, "n1": d.n1, "n2": d.n2, "n3": d.n3, "n4": d.n4, "n5": d.n5, "e1": d.e1, "e2": d.e2} for d in draws]
    else:
        try:
            response = supabase.table('draws_euromillions').select('*').order('date', desc=True).limit(limit).execute()
            return response.data
        except Exception as e:
            print(f"Erreur lors de la récupération des tirages récents Euromillions: {e}")
            return []

def get_recent_draws_loto(db, limit: int = 50) -> List[Dict]:
    """Récupère les tirages Loto récents"""
    if SQLALCHEMY_AVAILABLE:
        draws = db.query(DrawLoto).order_by(DrawLoto.date.desc()).limit(limit).all()
        return [{"id": d.id, "date": d.date, "n1": d.n1, "n2": d.n2, "n3": d.n3, "n4": d.n4, "n5": d.n5, "n6": d.n6, "complementaire": d.complementaire} for d in draws]
    else:
        try:
            response = supabase.table('draws_loto').select('*').order('date', desc=True).limit(limit).execute()
            return response.data
        except Exception as e:
            print(f"Erreur lors de la récupération des tirages récents Loto: {e}")
            return []

def get_draws_count_euromillions(db) -> int:
    """Compte le nombre total de tirages Euromillions"""
    if SQLALCHEMY_AVAILABLE:
        return db.query(DrawEuromillions).count()
    else:
        try:
            response = supabase.table('draws_euromillions').select('count', count='exact').execute()
            return response.count or 0
        except Exception as e:
            print(f"Erreur lors du comptage Euromillions: {e}")
            return 0

def get_draws_count_loto(db) -> int:
    """Compte le nombre total de tirages Loto"""
    if SQLALCHEMY_AVAILABLE:
        return db.query(DrawLoto).count()
    else:
        try:
            response = supabase.table('draws_loto').select('count', count='exact').execute()
            return response.count or 0
        except Exception as e:
            print(f"Erreur lors du comptage Loto: {e}")
            return 0

def delete_all_draws_euromillions(db):
    """Supprime tous les tirages Euromillions"""
    if SQLALCHEMY_AVAILABLE:
        db.query(DrawEuromillions).delete()
        db.commit()
        return True
    else:
        try:
            response = supabase.table('draws_euromillions').delete().neq('id', 0).execute()
            return True
        except Exception as e:
            print(f"Erreur lors de la suppression Euromillions: {e}")
            return False

def delete_all_draws_loto(db):
    """Supprime tous les tirages Loto"""
    if SQLALCHEMY_AVAILABLE:
        db.query(DrawLoto).delete()
        db.commit()
        return True
    else:
        try:
            response = supabase.table('draws_loto').delete().neq('id', 0).execute()
            return True
        except Exception as e:
            print(f"Erreur lors de la suppression Loto: {e}")
            return False

def delete_all_stats(db):
    """Supprime toutes les statistiques"""
    if SQLALCHEMY_AVAILABLE:
        db.query(Statistique).delete()
        db.commit()
        return True
    else:
        try:
            response = supabase.table('stats').delete().neq('id', 0).execute()
            return True
        except Exception as e:
            print(f"Erreur lors de la suppression des stats: {e}")
            return False

def get_draws_by_year_euromillions(db, year: int = None) -> List[Dict]:
    """Récupère les tirages Euromillions par année"""
    if SQLALCHEMY_AVAILABLE:
        from sqlalchemy import extract
        query = db.query(DrawEuromillions)
        if year:
            query = query.filter(DrawEuromillions.date >= f"{year}-01-01", 
                               DrawEuromillions.date <= f"{year}-12-31")
        draws = query.order_by(DrawEuromillions.date.desc()).all()
        return [{
            "id": d.id, 
            "date": d.date.strftime('%Y-%m-%d'), 
            "year": d.date.year,
            "n1": d.n1, "n2": d.n2, "n3": d.n3, "n4": d.n4, "n5": d.n5, 
            "e1": d.e1, "e2": d.e2
        } for d in draws]
    else:
        try:
            query = supabase.table('draws_euromillions').select('*')
            if year:
                query = query.gte('date', f"{year}-01-01").lte('date', f"{year}-12-31")
            response = query.order('date', desc=True).execute()
            return [{
                "id": d['id'],
                "date": d['date'],
                "year": int(d['date'][:4]),
                "n1": d['n1'], "n2": d['n2'], "n3": d['n3'], "n4": d['n4'], "n5": d['n5'],
                "e1": d['e1'], "e2": d['e2']
            } for d in response.data]
        except Exception as e:
            print(f"Erreur lors de la récupération par année Euromillions: {e}")
            return []

def get_draws_by_year_loto(db, year: int = None) -> List[Dict]:
    """Récupère les tirages Loto par année"""
    if SQLALCHEMY_AVAILABLE:
        from sqlalchemy import extract
        query = db.query(DrawLoto)
        if year:
            query = query.filter(DrawLoto.date >= f"{year}-01-01", 
                               DrawLoto.date <= f"{year}-12-31")
        draws = query.order_by(DrawLoto.date.desc()).all()
        return [{
            "id": d.id, 
            "date": d.date.strftime('%Y-%m-%d'), 
            "year": d.date.year,
            "n1": d.n1, "n2": d.n2, "n3": d.n3, "n4": d.n4, "n5": d.n5, "n6": d.n6,
            "complementaire": d.complementaire
        } for d in draws]
    else:
        try:
            query = supabase.table('draws_loto').select('*')
            if year:
                query = query.gte('date', f"{year}-01-01").lte('date', f"{year}-12-31")
            response = query.order('date', desc=True).execute()
            return [{
                "id": d['id'],
                "date": d['date'],
                "year": int(d['date'][:4]),
                "n1": d['n1'], "n2": d['n2'], "n3": d['n3'], "n4": d['n4'], "n5": d['n5'], "n6": d['n6'],
                "complementaire": d['complementaire']
            } for d in response.data]
        except Exception as e:
            print(f"Erreur lors de la récupération par année Loto: {e}")
            return []

def get_years_available_euromillions(db) -> List[int]:
    """Récupère les années disponibles pour Euromillions"""
    if SQLALCHEMY_AVAILABLE:
        from sqlalchemy import extract
        years = db.query(extract('year', DrawEuromillions.date)).distinct().all()
        return sorted([int(year[0]) for year in years], reverse=True)
    else:
        try:
            response = supabase.table('draws_euromillions').select('date').execute()
            years = set()
            for draw in response.data:
                years.add(int(draw['date'][:4]))
            return sorted(list(years), reverse=True)
        except Exception as e:
            print(f"Erreur lors de la récupération des années Euromillions: {e}")
            return []

def get_years_available_loto(db) -> List[int]:
    """Récupère les années disponibles pour Loto"""
    if SQLALCHEMY_AVAILABLE:
        from sqlalchemy import extract
        years = db.query(extract('year', DrawLoto.date)).distinct().all()
        return sorted([int(year[0]) for year in years], reverse=True)
    else:
        try:
            response = supabase.table('draws_loto').select('date').execute()
            years = set()
            for draw in response.data:
                years.add(int(draw['date'][:4]))
            return sorted(list(years), reverse=True)
        except Exception as e:
            print(f"Erreur lors de la récupération des années Loto: {e}")
            return [] 

def get_draws_by_number_euromillions(db, number: int, number_type: str = 'numero', year: int = None) -> List[Dict]:
    """Récupère les tirages Euromillions où un numéro spécifique est apparu"""
    if SQLALCHEMY_AVAILABLE:
        query = db.query(DrawEuromillions)
        
        # Filtrer par année si spécifiée
        if year:
            query = query.filter(DrawEuromillions.date >= f"{year}-01-01", 
                               DrawEuromillions.date <= f"{year}-12-31")
        
        # Filtrer par type de numéro
        if number_type == 'numero':
            query = query.filter(
                (DrawEuromillions.n1 == number) |
                (DrawEuromillions.n2 == number) |
                (DrawEuromillions.n3 == number) |
                (DrawEuromillions.n4 == number) |
                (DrawEuromillions.n5 == number)
            )
        elif number_type == 'etoile':
            query = query.filter(
                (DrawEuromillions.e1 == number) |
                (DrawEuromillions.e2 == number)
            )
        
        draws = query.order_by(DrawEuromillions.date.desc()).all()
        return [{
            "id": d.id, 
            "date": d.date.strftime('%Y-%m-%d'), 
            "year": d.date.year,
            "n1": d.n1, "n2": d.n2, "n3": d.n3, "n4": d.n4, "n5": d.n5, 
            "e1": d.e1, "e2": d.e2,
            "position": _get_number_position_euromillions(d, number, number_type)
        } for d in draws]
    else:
        try:
            query = supabase.table('draws_euromillions').select('*')
            
            # Filtrer par année si spécifiée
            if year:
                query = query.gte('date', f"{year}-01-01").lte('date', f"{year}-12-31")
            
            # Filtrer par numéro
            if number_type == 'numero':
                query = query.or_(f'n1.eq.{number},n2.eq.{number},n3.eq.{number},n4.eq.{number},n5.eq.{number}')
            elif number_type == 'etoile':
                query = query.or_(f'e1.eq.{number},e2.eq.{number}')
            
            response = query.order('date', desc=True).execute()
            return [{
                "id": d['id'],
                "date": d['date'],
                "year": int(d['date'][:4]),
                "n1": d['n1'], "n2": d['n2'], "n3": d['n3'], "n4": d['n4'], "n5": d['n5'],
                "e1": d['e1'], "e2": d['e2'],
                "position": _get_number_position_euromillions_supabase(d, number, number_type)
            } for d in response.data]
        except Exception as e:
            print(f"Erreur lors de la récupération par numéro Euromillions: {e}")
            return []

def get_draws_by_number_loto(db, number: int, number_type: str = 'numero', year: int = None) -> List[Dict]:
    """Récupère les tirages Loto où un numéro spécifique est apparu"""
    if SQLALCHEMY_AVAILABLE:
        query = db.query(DrawLoto)
        
        # Filtrer par année si spécifiée
        if year:
            query = query.filter(DrawLoto.date >= f"{year}-01-01", 
                               DrawLoto.date <= f"{year}-12-31")
        
        # Filtrer par type de numéro
        if number_type == 'numero':
            query = query.filter(
                (DrawLoto.n1 == number) |
                (DrawLoto.n2 == number) |
                (DrawLoto.n3 == number) |
                (DrawLoto.n4 == number) |
                (DrawLoto.n5 == number) |
                (DrawLoto.n6 == number)
            )
        elif number_type == 'complementaire':
            query = query.filter(DrawLoto.complementaire == number)
        
        draws = query.order_by(DrawLoto.date.desc()).all()
        return [{
            "id": d.id, 
            "date": d.date.strftime('%Y-%m-%d'), 
            "year": d.date.year,
            "n1": d.n1, "n2": d.n2, "n3": d.n3, "n4": d.n4, "n5": d.n5, "n6": d.n6,
            "complementaire": d.complementaire,
            "position": _get_number_position_loto(d, number, number_type)
        } for d in draws]
    else:
        try:
            query = supabase.table('draws_loto').select('*')
            
            # Filtrer par année si spécifiée
            if year:
                query = query.gte('date', f"{year}-01-01").lte('date', f"{year}-12-31")
            
            # Filtrer par numéro
            if number_type == 'numero':
                query = query.or_(f'n1.eq.{number},n2.eq.{number},n3.eq.{number},n4.eq.{number},n5.eq.{number},n6.eq.{number}')
            elif number_type == 'complementaire':
                query = query.eq('complementaire', number)
            
            response = query.order('date', desc=True).execute()
            return [{
                "id": d['id'],
                "date": d['date'],
                "year": int(d['date'][:4]),
                "n1": d['n1'], "n2": d['n2'], "n3": d['n3'], "n4": d['n4'], "n5": d['n5'], "n6": d['n6'],
                "complementaire": d['complementaire'],
                "position": _get_number_position_loto_supabase(d, number, number_type)
            } for d in response.data]
        except Exception as e:
            print(f"Erreur lors de la récupération par numéro Loto: {e}")
            return []

def _get_number_position_euromillions(draw, number: int, number_type: str) -> List[str]:
    """Détermine la position d'un numéro dans un tirage Euromillions"""
    positions = []
    if number_type == 'numero':
        if draw.n1 == number: positions.append('n1')
        if draw.n2 == number: positions.append('n2')
        if draw.n3 == number: positions.append('n3')
        if draw.n4 == number: positions.append('n4')
        if draw.n5 == number: positions.append('n5')
    elif number_type == 'etoile':
        if draw.e1 == number: positions.append('e1')
        if draw.e2 == number: positions.append('e2')
    return positions

def _get_number_position_euromillions_supabase(draw, number: int, number_type: str) -> List[str]:
    """Détermine la position d'un numéro dans un tirage Euromillions (Supabase)"""
    positions = []
    if number_type == 'numero':
        if draw['n1'] == number: positions.append('n1')
        if draw['n2'] == number: positions.append('n2')
        if draw['n3'] == number: positions.append('n3')
        if draw['n4'] == number: positions.append('n4')
        if draw['n5'] == number: positions.append('n5')
    elif number_type == 'etoile':
        if draw['e1'] == number: positions.append('e1')
        if draw['e2'] == number: positions.append('e2')
    return positions

def _get_number_position_loto(draw, number: int, number_type: str) -> List[str]:
    """Détermine la position d'un numéro dans un tirage Loto"""
    positions = []
    if number_type == 'numero':
        if draw.n1 == number: positions.append('n1')
        if draw.n2 == number: positions.append('n2')
        if draw.n3 == number: positions.append('n3')
        if draw.n4 == number: positions.append('n4')
        if draw.n5 == number: positions.append('n5')
        if draw.n6 == number: positions.append('n6')
    elif number_type == 'complementaire':
        if draw.complementaire == number: positions.append('complementaire')
    return positions

def _get_number_position_loto_supabase(draw, number: int, number_type: str) -> List[str]:
    """Détermine la position d'un numéro dans un tirage Loto (Supabase)"""
    positions = []
    if number_type == 'numero':
        if draw['n1'] == number: positions.append('n1')
        if draw['n2'] == number: positions.append('n2')
        if draw['n3'] == number: positions.append('n3')
        if draw['n4'] == number: positions.append('n4')
        if draw['n5'] == number: positions.append('n5')
        if draw['n6'] == number: positions.append('n6')
    elif number_type == 'complementaire':
        if draw['complementaire'] == number: positions.append('complementaire')
    return positions

def get_number_stats_euromillions(db, number: int, number_type: str = 'numero') -> Dict:
    """Récupère les statistiques détaillées pour un numéro Euromillions"""
    from datetime import datetime
    current_year = datetime.now().year
    
    # Statistiques globales
    all_draws = get_draws_by_number_euromillions(db, number, number_type)
    total_draws = get_draws_count_euromillions(db)
    
    # Statistiques pour l'année en cours
    current_year_draws = get_draws_by_number_euromillions(db, number, number_type, current_year)
    current_year_total = len(get_draws_by_year_euromillions(db, current_year))
    
    return {
        "number": number,
        "type": number_type,
        "global": {
            "appearances": len(all_draws),
            "total_draws": total_draws,
            "percentage": (len(all_draws) / total_draws * 100) if total_draws > 0 else 0,
            "draws": all_draws
        },
        "current_year": {
            "appearances": len(current_year_draws),
            "total_draws": current_year_total,
            "percentage": (len(current_year_draws) / current_year_total * 100) if current_year_total > 0 else 0,
            "draws": current_year_draws
        }
    }

def get_number_stats_loto(db, number: int, number_type: str = 'numero') -> Dict:
    """Récupère les statistiques détaillées pour un numéro Loto"""
    from datetime import datetime
    current_year = datetime.now().year
    
    # Statistiques globales
    all_draws = get_draws_by_number_loto(db, number, number_type)
    total_draws = get_draws_count_loto(db)
    
    # Statistiques pour l'année en cours
    current_year_draws = get_draws_by_number_loto(db, number, number_type, current_year)
    current_year_total = len(get_draws_by_year_loto(db, current_year))
    
    return {
        "number": number,
        "type": number_type,
        "global": {
            "appearances": len(all_draws),
            "total_draws": total_draws,
            "percentage": (len(all_draws) / total_draws * 100) if total_draws > 0 else 0,
            "draws": all_draws
        },
        "current_year": {
            "appearances": len(current_year_draws),
            "total_draws": current_year_total,
            "percentage": (len(current_year_draws) / current_year_total * 100) if current_year_total > 0 else 0,
            "draws": current_year_draws
        }
    } 

def get_number_statistics(db: Session, game_type: str, year: Optional[int] = None) -> List[Dict]:
    """Récupérer les statistiques des numéros avec filtre optionnel par année"""
    if game_type == "euromillions":
        query = db.query(DrawEuromillions)
        if year:
            query = query.filter(extract('year', DrawEuromillions.date) == year)
        
        draws = query.all()
        
        # Compter les occurrences de chaque numéro
        number_counts = {}
        star_counts = {}
        total_draws = len(draws)
        
        for draw in draws:
            numbers = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5]
            stars = [draw.e1, draw.e2]
            
            # Compter les numéros
            for num in numbers:
                if num not in number_counts:
                    number_counts[num] = {"count": 0, "draws": []}
                number_counts[num]["count"] += 1
                number_counts[num]["draws"].append(draw.date.isoformat())
            
            # Compter les étoiles
            for star in stars:
                if star not in star_counts:
                    star_counts[star] = {"count": 0, "draws": []}
                star_counts[star]["count"] += 1
                star_counts[star]["draws"].append(draw.date.isoformat())
        
        # Créer la liste des statistiques pour les numéros
        stats = []
        max_number = 50  # Euromillions: 1-50
        
        for numero in range(1, max_number + 1):
            count = number_counts.get(numero, {}).get("count", 0)
            percentage = (count / total_draws * 100) if total_draws > 0 else 0
            draws_list = number_counts.get(numero, {}).get("draws", [])
            last_draw = max(draws_list) if draws_list else None
            
            stats.append({
                "numero": numero,
                "count": count,
                "percentage": percentage,
                "lastDraw": last_draw,
                "draws": draws_list,
                "type": "numero"
            })
        
        # Ajouter les statistiques des étoiles
        max_star = 12  # Euromillions: 1-12
        for star in range(1, max_star + 1):
            count = star_counts.get(star, {}).get("count", 0)
            percentage = (count / total_draws * 100) if total_draws > 0 else 0
            draws_list = star_counts.get(star, {}).get("draws", [])
            last_draw = max(draws_list) if draws_list else None
            
            stats.append({
                "numero": star,
                "count": count,
                "percentage": percentage,
                "lastDraw": last_draw,
                "draws": draws_list,
                "type": "etoile"
            })
        
        return stats
    
    return []

def get_number_details(db: Session, game_type: str, numero: int, year: Optional[int] = None) -> Dict:
    """Récupérer les détails d'un numéro spécifique"""
    if game_type == "euromillions":
        query = db.query(DrawEuromillions).filter(
            or_(
                DrawEuromillions.n1 == numero,
                DrawEuromillions.n2 == numero,
                DrawEuromillions.n3 == numero,
                DrawEuromillions.n4 == numero,
                DrawEuromillions.n5 == numero
            )
        )
        
        if year:
            query = query.filter(extract('year', DrawEuromillions.date) == year)
        
        draws = query.order_by(DrawEuromillions.date.desc()).all()
        
        return {
            "numero": numero,
            "count": len(draws),
            "draws": [draw.date.isoformat() for draw in draws],
            "lastDraw": draws[0].date.isoformat() if draws else None
        }
    
    return {}

def get_available_years(db: Session, game_type: str) -> List[int]:
    """Récupérer les années disponibles dans les données"""
    if game_type == "euromillions":
        years = db.query(extract('year', DrawEuromillions.date)).distinct().all()
        return sorted([year[0] for year in years], reverse=True)
    
    return [] 

def analyze_generated_grid(db: Session, game_type: str, grid: dict) -> Dict:
    """Analyser une grille générée et calculer les probabilités"""
    if game_type == "euromillions":
        numbers = grid.get("numbers", [])
        stars = grid.get("stars", [])
        
        # Récupérer tous les tirages
        draws = db.query(DrawEuromillions).all()
        
        analysis = {
            "grid": grid,
            "total_draws": len(draws),
            "combinations": {
                "exact_match": 0,  # Combinaison exacte (5 numéros + 2 étoiles)
                "five_numbers": 0,  # 5 numéros corrects
                "four_numbers": 0,  # 4 numéros corrects
                "three_numbers": 0,  # 3 numéros corrects
                "two_numbers": 0,   # 2 numéros corrects
                "one_number": 0,    # 1 numéro correct
                "two_stars": 0,     # 2 étoiles correctes
                "one_star": 0,      # 1 étoile correcte
                "five_numbers_one_star": 0,  # 5 numéros + 1 étoile
                "four_numbers_two_stars": 0, # 4 numéros + 2 étoiles
                "four_numbers_one_star": 0,  # 4 numéros + 1 étoile
                "three_numbers_two_stars": 0, # 3 numéros + 2 étoiles
                "three_numbers_one_star": 0,  # 3 numéros + 1 étoile
                "two_numbers_two_stars": 0,   # 2 numéros + 2 étoiles
                "two_numbers_one_star": 0,    # 2 numéros + 1 étoile
                "one_number_two_stars": 0,    # 1 numéro + 2 étoiles
                "one_number_one_star": 0,     # 1 numéro + 1 étoile
            },
            "probabilities": {},
            "number_frequency": {},
            "star_frequency": {}
        }
        
        # Analyser chaque tirage
        for draw in draws:
            draw_numbers = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5]
            draw_stars = [draw.e1, draw.e2]
            
            # Compter les correspondances
            matching_numbers = len(set(numbers) & set(draw_numbers))
            matching_stars = len(set(stars) & set(draw_stars))
            
            # Mettre à jour les compteurs
            if matching_numbers == 5 and matching_stars == 2:
                analysis["combinations"]["exact_match"] += 1
            elif matching_numbers == 5 and matching_stars == 1:
                analysis["combinations"]["five_numbers_one_star"] += 1
            elif matching_numbers == 5:
                analysis["combinations"]["five_numbers"] += 1
            elif matching_numbers == 4 and matching_stars == 2:
                analysis["combinations"]["four_numbers_two_stars"] += 1
            elif matching_numbers == 4 and matching_stars == 1:
                analysis["combinations"]["four_numbers_one_star"] += 1
            elif matching_numbers == 4:
                analysis["combinations"]["four_numbers"] += 1
            elif matching_numbers == 3 and matching_stars == 2:
                analysis["combinations"]["three_numbers_two_stars"] += 1
            elif matching_numbers == 3 and matching_stars == 1:
                analysis["combinations"]["three_numbers_one_star"] += 1
            elif matching_numbers == 3:
                analysis["combinations"]["three_numbers"] += 1
            elif matching_numbers == 2 and matching_stars == 2:
                analysis["combinations"]["two_numbers_two_stars"] += 1
            elif matching_numbers == 2 and matching_stars == 1:
                analysis["combinations"]["two_numbers_one_star"] += 1
            elif matching_numbers == 2:
                analysis["combinations"]["two_numbers"] += 1
            elif matching_numbers == 1 and matching_stars == 2:
                analysis["combinations"]["one_number_two_stars"] += 1
            elif matching_numbers == 1 and matching_stars == 1:
                analysis["combinations"]["one_number_one_star"] += 1
            elif matching_numbers == 1:
                analysis["combinations"]["one_number"] += 1
            elif matching_stars == 2:
                analysis["combinations"]["two_stars"] += 1
            elif matching_stars == 1:
                analysis["combinations"]["one_star"] += 1
        
        # Calculer les probabilités
        total = len(draws)
        for key, count in analysis["combinations"].items():
            analysis["probabilities"][key] = {
                "count": count,
                "percentage": (count / total * 100) if total > 0 else 0,
                "frequency": f"1 sur {total // count}" if count > 0 else "Jamais"
            }
        
        # Analyser la fréquence des numéros de la grille
        for num in numbers:
            count = sum(1 for draw in draws if num in [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5])
            analysis["number_frequency"][num] = {
                "count": count,
                "percentage": (count / total * 100) if total > 0 else 0
            }
        
        # Analyser la fréquence des étoiles de la grille
        for star in stars:
            count = sum(1 for draw in draws if star in [draw.e1, draw.e2])
            analysis["star_frequency"][star] = {
                "count": count,
                "percentage": (count / total * 100) if total > 0 else 0
            }
        
        return analysis
    
    return {} 