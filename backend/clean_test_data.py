#!/usr/bin/env python3
"""
Script pour nettoyer les données de test et ne garder que les données originales uploadées.
"""

import sqlite3
from datetime import datetime, date

def clean_test_data():
    """Supprime les tirages de test ajoutés après les données originales"""
    
    # Connexion à la base de données
    conn = sqlite3.connect('./lotto.db')
    cursor = conn.cursor()
    
    try:
        print("🔍 Analyse des données Euromillions...")
        
        # Récupérer tous les tirages Euromillions
        cursor.execute("""
            SELECT id, date, n1, n2, n3, n4, n5, e1, e2 
            FROM draws_euromillions 
            ORDER BY date DESC
        """)
        
        draws = cursor.fetchall()
        print(f"📊 Total de tirages trouvés: {len(draws)}")
        
        if len(draws) == 0:
            print("✅ Aucun tirage à nettoyer")
            return
        
        # Identifier les tirages de test (ceux ajoutés récemment)
        # Supposons que vos données originales s'arrêtent avant juillet 2025
        test_draws = []
        original_draws = []
        
        for draw in draws:
            draw_date = datetime.strptime(draw[1], '%Y-%m-%d').date()
            if draw_date >= date(2025, 7, 1):  # Tirages de juillet 2025 et après
                test_draws.append(draw)
            else:
                original_draws.append(draw)
        
        print(f"📅 Tirages originaux (avant juillet 2025): {len(original_draws)}")
        print(f"🧪 Tirages de test (juillet 2025+): {len(test_draws)}")
        
        if len(test_draws) == 0:
            print("✅ Aucun tirage de test à supprimer")
            return
        
        # Afficher les tirages de test qui vont être supprimés
        print("\n🗑️ Tirages de test à supprimer:")
        for draw in test_draws[:5]:  # Afficher les 5 premiers
            print(f"  - {draw[1]} (ID: {draw[0]}) - Numéros: {draw[2:7]} - Étoiles: {draw[7:9]}")
        
        if len(test_draws) > 5:
            print(f"  ... et {len(test_draws) - 5} autres")
        
        # Demander confirmation
        response = input(f"\n❓ Voulez-vous supprimer {len(test_draws)} tirages de test ? (oui/non): ")
        
        if response.lower() in ['oui', 'o', 'yes', 'y']:
            # Supprimer les tirages de test
            test_ids = [draw[0] for draw in test_draws]
            placeholders = ','.join(['?' for _ in test_ids])
            
            cursor.execute(f"""
                DELETE FROM draws_euromillions 
                WHERE id IN ({placeholders})
            """, test_ids)
            
            deleted_count = cursor.rowcount
            conn.commit()
            
            print(f"✅ {deleted_count} tirages de test supprimés avec succès")
            print(f"📊 Il reste {len(original_draws)} tirages originaux")
            
        else:
            print("❌ Suppression annulée")
            
    except Exception as e:
        print(f"❌ Erreur lors du nettoyage: {e}")
        conn.rollback()
        
    finally:
        conn.close()

def show_current_data():
    """Affiche un résumé des données actuelles"""
    
    conn = sqlite3.connect('./lotto.db')
    cursor = conn.cursor()
    
    try:
        # Compter les tirages Euromillions
        cursor.execute("SELECT COUNT(*) FROM draws_euromillions")
        euromillions_count = cursor.fetchone()[0]
        
        # Compter les tirages Loto
        cursor.execute("SELECT COUNT(*) FROM draws_loto")
        loto_count = cursor.fetchone()[0]
        
        # Derniers tirages Euromillions
        cursor.execute("""
            SELECT date, n1, n2, n3, n4, n5, e1, e2 
            FROM draws_euromillions 
            ORDER BY date DESC 
            LIMIT 3
        """)
        last_euromillions = cursor.fetchall()
        
        print("\n📊 État actuel de la base de données:")
        print(f"🎰 Euromillions: {euromillions_count} tirages")
        print(f"🍀 Loto: {loto_count} tirages")
        
        if last_euromillions:
            print("\n📅 Derniers tirages Euromillions:")
            for draw in last_euromillions:
                print(f"  - {draw[0]}: Numéros {draw[1:6]} - Étoiles {draw[6:8]}")
                
    except Exception as e:
        print(f"❌ Erreur lors de l'affichage: {e}")
        
    finally:
        conn.close()

if __name__ == "__main__":
    print("🧹 Nettoyage des données de test")
    print("=" * 40)
    
    show_current_data()
    print("\n" + "=" * 40)
    clean_test_data()
    print("\n" + "=" * 40)
    show_current_data() 