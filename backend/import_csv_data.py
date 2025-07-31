#!/usr/bin/env python3
"""
Script pour importer les données CSV dans la base de données
"""

import sys
import os
import pandas as pd
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine
from app.models import Base, DrawLoto
from datetime import datetime

def import_csv_data():
    """Importe les données CSV dans la base de données"""
    db = SessionLocal()
    
    try:
        # Créer les tables si elles n'existent pas
        Base.metadata.create_all(bind=engine)
        
        # Vérifier s'il y a déjà des données
        existing_count = db.query(DrawLoto).count()
        if existing_count > 0:
            print(f"⚠️ Base de données contient déjà {existing_count} tirages")
            response = input("Voulez-vous continuer et ajouter les nouvelles données ? (y/n): ")
            if response.lower() != 'y':
                return
        
        print("📊 Import des données CSV...")
        
        # Liste des fichiers CSV à importer
        csv_files = [
            'exemple_loto_2023.csv',
            'exemple_loto_2024.csv'
        ]
        
        total_imported = 0
        
        for csv_file in csv_files:
            if not os.path.exists(csv_file):
                print(f"⚠️ Fichier {csv_file} non trouvé, ignoré")
                continue
                
            print(f"\n📁 Import de {csv_file}...")
            
            try:
                # Lire le fichier CSV
                df = pd.read_csv(csv_file)
                print(f"   Lignes lues: {len(df)}")
                
                # Vérifier les colonnes
                expected_columns = ['Date', 'Numéro 1', 'Numéro 2', 'Numéro 3', 'Numéro 4', 'Numéro 5', 'Numéro 6', 'Complémentaire']
                missing_columns = [col for col in expected_columns if col not in df.columns]
                
                if missing_columns:
                    print(f"   ❌ Colonnes manquantes: {missing_columns}")
                    continue
                
                # Importer chaque ligne
                imported_count = 0
                for index, row in df.iterrows():
                    try:
                        # Convertir la date
                        date = pd.to_datetime(row['Date']).date()
                        
                        # Créer le tirage
                        draw = DrawLoto(
                            date=date,
                            n1=int(row['Numéro 1']),
                            n2=int(row['Numéro 2']),
                            n3=int(row['Numéro 3']),
                            n4=int(row['Numéro 4']),
                            n5=int(row['Numéro 5']),
                            n6=int(row['Numéro 6']),
                            complementaire=int(row['Complémentaire'])
                        )
                        
                        db.add(draw)
                        imported_count += 1
                        
                    except Exception as e:
                        print(f"   ❌ Erreur ligne {index + 1}: {e}")
                        continue
                
                db.commit()
                print(f"   ✅ {imported_count} tirages importés avec succès")
                total_imported += imported_count
                
            except Exception as e:
                print(f"   ❌ Erreur lors de l'import de {csv_file}: {e}")
                db.rollback()
                continue
        
        print(f"\n🎉 Import terminé: {total_imported} tirages importés au total")
        
        # Afficher les statistiques finales
        final_count = db.query(DrawLoto).count()
        print(f"📊 Total tirages dans la base: {final_count}")
        
        if final_count > 0:
            # Afficher quelques exemples
            draws = db.query(DrawLoto).order_by(DrawLoto.date.desc()).limit(5).all()
            print("\n📋 Exemples de tirages importés:")
            for draw in draws:
                print(f"  {draw.date}: {draw.n1}-{draw.n2}-{draw.n3}-{draw.n4}-{draw.n5}-{draw.n6} (Bonus: {draw.complementaire})")
        
    except Exception as e:
        print(f"❌ Erreur générale: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    import_csv_data() 