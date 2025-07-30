#!/usr/bin/env python3
"""
Script pour nettoyer toutes les données de test du Loto
"""

import sqlite3
import os

def clean_loto_data():
    """Supprimer toutes les données de test du Loto"""
    
    # Chemin vers la base de données
    db_path = "./lotto.db"
    
    if not os.path.exists(db_path):
        print("❌ Base de données non trouvée")
        return
    
    try:
        # Connexion à la base de données
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Compter les tirages avant suppression
        cursor.execute("SELECT COUNT(*) FROM draws_loto")
        count_before = cursor.fetchone()[0]
        
        print(f"📊 Tirages trouvés avant nettoyage: {count_before}")
        
        if count_before == 0:
            print("✅ Base de données déjà vide")
            return
        
        # Supprimer tous les tirages
        cursor.execute("DELETE FROM draws_loto")
        
        # Compter les tirages après suppression
        cursor.execute("SELECT COUNT(*) FROM draws_loto")
        count_after = cursor.fetchone()[0]
        
        # Valider les changements
        conn.commit()
        
        print(f"🗑️  {count_before - count_after} tirages supprimés")
        print(f"✅ Base de données nettoyée ({count_after} tirages restants)")
        
        # Vérifier que la table est vide
        cursor.execute("SELECT COUNT(*) FROM draws_loto")
        final_count = cursor.fetchone()[0]
        
        if final_count == 0:
            print("✅ Nettoyage réussi - Base de données vide")
        else:
            print(f"⚠️  Attention: {final_count} tirages restent dans la base")
            
    except Exception as e:
        print(f"❌ Erreur lors du nettoyage: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    print("🧹 Nettoyage des données de test du Loto...")
    clean_loto_data()
    print("✅ Script terminé") 