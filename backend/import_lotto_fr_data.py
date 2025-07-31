#!/usr/bin/env python3
"""
Script pour importer tous les fichiers CSV du Loto français
"""

import sys
import os
import pandas as pd
import glob
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine
from app.models import Base, DrawLoto
from datetime import datetime

def import_lotto_fr_data():
    """Importe tous les fichiers CSV du Loto français"""
    db = SessionLocal()
    
    try:
        # Créer les tables si elles n'existent pas
        Base.metadata.create_all(bind=engine)
        
        # Vider automatiquement la base de données
        existing_count = db.query(DrawLoto).count()
        if existing_count > 0:
            print(f"🗑️ Suppression des {existing_count} tirages existants...")
            db.query(DrawLoto).delete()
            db.commit()
            print("✅ Base de données vidée")
        
        print("📊 Import des données du Loto français (2000-2025)...")
        
        # Chemin vers les fichiers CSV
        downloads_path = os.path.expanduser("~/Downloads")
        csv_pattern = os.path.join(downloads_path, "lotto-gamedata-FR-*.csv")
        
        # Trouver tous les fichiers CSV
        csv_files = glob.glob(csv_pattern)
        csv_files.sort(reverse=True)  # Trier par ordre décroissant (2025 à 2000)
        
        if not csv_files:
            print(f"❌ Aucun fichier trouvé avec le pattern: {csv_pattern}")
            return
        
        print(f"📁 {len(csv_files)} fichiers trouvés")
        
        total_imported = 0
        total_files_processed = 0
        
        for csv_file in csv_files:
            filename = os.path.basename(csv_file)
            print(f"\n📁 Import de {filename}...")
            
            try:
                # Lire le fichier CSV avec point-virgule comme séparateur
                df = pd.read_csv(csv_file, sep=';')
                print(f"   Lignes lues: {len(df)}")
                
                # Vérifier les colonnes
                expected_columns = ['Date', 'Numéro 1', 'Numéro 2', 'Numéro 3', 'Numéro 4', 'Numéro 5', 'Numéro 6', 'Bonus']
                missing_columns = [col for col in expected_columns if col not in df.columns]
                
                if missing_columns:
                    print(f"   ❌ Colonnes manquantes: {missing_columns}")
                    print(f"   Colonnes disponibles: {list(df.columns)}")
                    continue
                
                # Importer chaque ligne
                imported_count = 0
                for index, row in df.iterrows():
                    try:
                        # Convertir la date
                        date = pd.to_datetime(row['Date']).date()
                        
                        # Vérifier que les numéros sont dans la plage valide (1-49 pour le Loto français)
                        numeros = [
                            int(row['Numéro 1']), int(row['Numéro 2']), int(row['Numéro 3']),
                            int(row['Numéro 4']), int(row['Numéro 5']), int(row['Numéro 6'])
                        ]
                        bonus = int(row['Bonus'])
                        
                        # Validation des numéros
                        for num in numeros:
                            if num < 1 or num > 49:
                                print(f"   ⚠️ Numéro invalide {num} dans la ligne {index + 1}, ignoré")
                                continue
                        
                        if bonus < 1 or bonus > 49:
                            print(f"   ⚠️ Bonus invalide {bonus} dans la ligne {index + 1}, ignoré")
                            continue
                        
                        # Créer le tirage
                        draw = DrawLoto(
                            date=date,
                            n1=numeros[0],
                            n2=numeros[1],
                            n3=numeros[2],
                            n4=numeros[3],
                            n5=numeros[4],
                            n6=numeros[5],
                            complementaire=bonus
                        )
                        
                        db.add(draw)
                        imported_count += 1
                        
                    except Exception as e:
                        print(f"   ❌ Erreur ligne {index + 1}: {e}")
                        continue
                
                db.commit()
                print(f"   ✅ {imported_count} tirages importés avec succès")
                total_imported += imported_count
                total_files_processed += 1
                
            except Exception as e:
                print(f"   ❌ Erreur lors de l'import de {filename}: {e}")
                db.rollback()
                continue
        
        print(f"\n🎉 Import terminé!")
        print(f"📊 Fichiers traités: {total_files_processed}/{len(csv_files)}")
        print(f"📊 Total tirages importés: {total_imported}")
        
        # Afficher les statistiques finales
        final_count = db.query(DrawLoto).count()
        print(f"📊 Total tirages dans la base: {final_count}")
        
        if final_count > 0:
            # Afficher la période couverte
            min_date = db.query(DrawLoto.date).order_by(DrawLoto.date.asc()).first()
            max_date = db.query(DrawLoto.date).order_by(DrawLoto.date.desc()).first()
            print(f"📅 Période: {min_date[0]} à {max_date[0]}")
            
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
    import_lotto_fr_data() 