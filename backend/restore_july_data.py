#!/usr/bin/env python3
"""
Script pour restaurer les données de juillet 2025 qui ont été supprimées par erreur.
"""

import sqlite3
from datetime import datetime

def restore_july_2025_data():
    """Restaure les données de juillet 2025 basées sur l'image fournie"""
    
    # Données de juillet 2025 basées sur l'image
    july_2025_data = [
        ("2025-07-25", 6, 7, 23, 32, 36, 11, 12),
        ("2025-07-22", 8, 15, 26, 33, 41, 9, 10),
        ("2025-07-18", 13, 19, 25, 42, 45, 2, 9),
        ("2025-07-15", 24, 38, 41, 45, 49, 1, 6),
        ("2025-07-11", 8, 23, 24, 45, 49, 2, 10),
        ("2025-07-08", 1, 8, 9, 18, 50, 1, 5),
        ("2025-07-04", 19, 29, 42, 45, 48, 5, 7),
        ("2025-07-01", 1, 17, 28, 32, 34, 7, 8),
    ]
    
    conn = sqlite3.connect('./lotto.db')
    cursor = conn.cursor()
    
    try:
        print("🔄 Restauration des données de juillet 2025...")
        
        # Vérifier si ces données existent déjà
        for date_str, n1, n2, n3, n4, n5, e1, e2 in july_2025_data:
            cursor.execute("""
                SELECT COUNT(*) FROM draws_euromillions 
                WHERE date = ? AND n1 = ? AND n2 = ? AND n3 = ? AND n4 = ? AND n5 = ? AND e1 = ? AND e2 = ?
            """, (date_str, n1, n2, n3, n4, n5, e1, e2))
            
            if cursor.fetchone()[0] == 0:
                # Insérer le tirage
                cursor.execute("""
                    INSERT INTO draws_euromillions (date, n1, n2, n3, n4, n5, e1, e2)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (date_str, n1, n2, n3, n4, n5, e1, e2))
                print(f"✅ Ajouté: {date_str} - Numéros: {n1},{n2},{n3},{n4},{n5} - Étoiles: {e1},{e2}")
            else:
                print(f"⚠️ Déjà présent: {date_str}")
        
        conn.commit()
        
        # Vérifier le total après restauration
        cursor.execute("SELECT COUNT(*) FROM draws_euromillions")
        total_count = cursor.fetchone()[0]
        print(f"\n📊 Total de tirages après restauration: {total_count}")
        
        # Afficher les derniers tirages
        cursor.execute("""
            SELECT date, n1, n2, n3, n4, n5, e1, e2 
            FROM draws_euromillions 
            ORDER BY date DESC 
            LIMIT 5
        """)
        
        print("\n📅 Derniers tirages:")
        for draw in cursor.fetchall():
            print(f"  - {draw[0]}: Numéros {draw[1:6]} - Étoiles {draw[6:8]}")
            
    except Exception as e:
        print(f"❌ Erreur lors de la restauration: {e}")
        conn.rollback()
        
    finally:
        conn.close()

if __name__ == "__main__":
    restore_july_2025_data() 