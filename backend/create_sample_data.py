#!/usr/bin/env python3
"""
Script pour créer quelques données d'exemple pour tester l'affichage
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine
from app.models import Base, DrawLoto
from datetime import datetime, timedelta
import random

def create_sample_data():
    """Crée quelques données d'exemple pour le Loto"""
    db = SessionLocal()
    
    try:
        # Créer les tables si elles n'existent pas
        Base.metadata.create_all(bind=engine)
        
        # Vérifier s'il y a déjà des données
        existing_count = db.query(DrawLoto).count()
        if existing_count > 0:
            print(f"✅ Base de données contient déjà {existing_count} tirages")
            return
        
        print("📊 Création de données d'exemple pour le Loto...")
        
        # Créer quelques tirages récents
        sample_draws = [
            {
                'date': datetime.now().date() - timedelta(days=7),
                'numeros': [7, 15, 23, 31, 39, 42],
                'complementaire': 12
            },
            {
                'date': datetime.now().date() - timedelta(days=4),
                'numeros': [3, 11, 19, 27, 35, 44],
                'complementaire': 8
            },
            {
                'date': datetime.now().date() - timedelta(days=1),
                'numeros': [5, 13, 21, 29, 37, 45],
                'complementaire': 15
            }
        ]
        
        for draw_data in sample_draws:
            draw = DrawLoto(
                date=draw_data['date'],
                n1=draw_data['numeros'][0],
                n2=draw_data['numeros'][1],
                n3=draw_data['numeros'][2],
                n4=draw_data['numeros'][3],
                n5=draw_data['numeros'][4],
                n6=draw_data['numeros'][5],
                complementaire=draw_data['complementaire']
            )
            db.add(draw)
        
        db.commit()
        print(f"✅ {len(sample_draws)} tirages d'exemple créés avec succès !")
        
        # Afficher les données créées
        draws = db.query(DrawLoto).order_by(DrawLoto.date.desc()).all()
        print("\n📋 Tirages créés:")
        for draw in draws:
            print(f"  {draw.date}: {draw.n1}-{draw.n2}-{draw.n3}-{draw.n4}-{draw.n5}-{draw.n6} (Bonus: {draw.complementaire})")
        
    except Exception as e:
        print(f"❌ Erreur lors de la création des données: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_data() 