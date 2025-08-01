#!/usr/bin/env python3
"""
Script de test pour importer des données de test et tester les analyses
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine
from app.models import Base, DrawLoto
from datetime import datetime, timedelta
import random

def create_test_data():
    """Crée des données de test pour le Loto"""
    db = SessionLocal()
    
    try:
        # Créer les tables si elles n'existent pas
        Base.metadata.create_all(bind=engine)
        
        # Vérifier s'il y a déjà des données
        existing_count = db.query(DrawLoto).count()
        if existing_count > 0:
            print(f"✅ Base de données contient déjà {existing_count} tirages")
            return
        
        print("📊 Création de données de test pour le Loto...")
        
        # Créer des tirages sur les 2 dernières années
        start_date = datetime.now().date() - timedelta(days=730)  # 2 ans
        end_date = datetime.now().date()
        
        current_date = start_date
        draw_count = 0
        
        while current_date <= end_date:
            # Créer 2-3 tirages par semaine
            if current_date.weekday() in [0, 3, 6]:  # Lundi, Jeudi, Dimanche
                # Générer des numéros aléatoires mais réalistes
                numeros = sorted(random.sample(range(1, 46), 6))
                complementaire = random.randint(1, 10)
                
                # Créer le tirage
                draw = DrawLoto(
                    date=current_date,
                    n1=numeros[0],
                    n2=numeros[1],
                    n3=numeros[2],
                    n4=numeros[3],
                    n5=numeros[4],
                    n6=numeros[5],
                    complementaire=complementaire
                )
                
                db.add(draw)
                draw_count += 1
                
                if draw_count % 50 == 0:
                    print(f"   Créé {draw_count} tirages...")
            
            current_date += timedelta(days=1)
        
        db.commit()
        print(f"✅ {draw_count} tirages de test créés avec succès !")
        
        # Afficher quelques statistiques
        total_draws = db.query(DrawLoto).count()
        date_range = db.query(DrawLoto.date).order_by(DrawLoto.date.asc()).first()
        last_draw = db.query(DrawLoto.date).order_by(DrawLoto.date.desc()).first()
        
        print(f"📈 Statistiques:")
        print(f"   Total tirages: {total_draws}")
        print(f"   Période: {date_range[0]} à {last_draw[0]}")
        
    except Exception as e:
        print(f"❌ Erreur lors de la création des données: {e}")
        db.rollback()
    finally:
        db.close()

def test_analyses():
    """Teste les analyses avancées"""
    from app.loto_advanced_stats import LotoAdvancedStats
    
    db = SessionLocal()
    analyzer = LotoAdvancedStats(db)
    
    print("\n🔍 Test des analyses avancées...")
    
    try:
        # Test des statistiques complètes
        stats = analyzer.get_comprehensive_stats()
        if "error" not in stats:
            print(f"✅ Statistiques complètes: {stats['total_draws']} tirages analysés")
            print(f"   Période: {stats['date_range']['start']} à {stats['date_range']['end']}")
            
            # Test des patterns
            patterns = analyzer.analyze_number_patterns()
            print(f"✅ Analyse des patterns: {patterns.get('consecutive_frequency', 0):.2%} de tirages avec numéros consécutifs")
            
            # Test des numéros chauds/froids
            hot_cold = analyzer.get_hot_cold_analysis()
            if "error" not in hot_cold:
                print(f"✅ Analyse chaud/froid: {len(hot_cold['hot_numbers'])} numéros chauds, {len(hot_cold['cold_numbers'])} numéros froids")
            
            # Test des combinaisons fréquentes
            combinations = analyzer.find_most_frequent_combinations()
            print(f"✅ Combinaisons fréquentes: {len(combinations)} combinaisons trouvées")
            
            # Test des tendances d'un numéro
            trends = analyzer.get_number_trends(7)  # Test avec le numéro 7
            if "error" not in trends:
                print(f"✅ Tendances du numéro 7: {trends['trend']}")
            
        else:
            print(f"❌ Erreur dans les analyses: {stats['error']}")
            
    except Exception as e:
        print(f"❌ Erreur lors des tests: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("🎰 Test des fonctionnalités d'analyse du Loto")
    print("=" * 50)
    
    create_test_data()
    test_analyses()
    
    print("\n🎉 Tests terminés !")
    print("\n📋 Endpoints disponibles:")
    print("   - /api/loto/advanced/comprehensive-stats")
    print("   - /api/loto/advanced/hot-cold-analysis")
    print("   - /api/loto/advanced/frequent-combinations")
    print("   - /api/loto/advanced/patterns")
    print("   - /api/loto/advanced/sequences")
    print("   - /api/loto/advanced/parity")
    print("   - /api/loto/advanced/sums")
    print("   - /api/loto/advanced/number-trends/{number}")
    print("   - /api/loto/advanced/yearly-breakdown")
    print("   - /api/loto/advanced/performance-metrics")
    print("   - /api/loto/advanced/comparison")
    print("   - /api/loto/advanced/export-analysis") 